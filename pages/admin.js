// pages/admin.js
import { useEffect, useState } from "react";

const ORDERS_KEY = "ssanjae-offline-orders-v1";
const PRODUCTS_KEY = "ssanjae-offline-products-v1";

// 기본 상품 예시 (처음에만 쓰이고, 이후엔 localStorage 값이 우선)
const DEFAULT_PRODUCTS = [
  { name: "상하목장 마이리틀 유기농 짜먹는 요거트 플레인", stock: "", price: 890 },
  { name: "수제 물떡 어묵탕", stock: "", price: 6900 },
  { name: "따끈따끈 부산완당", stock: "", price: 3900 },
];

// 공통: localStorage 읽기
function loadArrayFromLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.error("localStorage parse error", e);
    return fallback;
  }
}

// 공통: localStorage 저장
function saveArrayToLocalStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage save error", e);
  }
}

// 전화번호 01012347262 → 010-1234-7262 형태로 포맷
function formatPhone(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // 그 외는 있는 그대로
}

// 주문 상태 한글로
function getStatusLabel(status) {
  if (status === "paid") return "입금완료";
  if (status === "cancelled") return "취소";
  return "입금확인 전";
}

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [isReady, setIsReady] = useState(false);

  // 처음 로딩: 주문 + 상품 불러오기
  useEffect(() => {
    const loadedOrders = loadArrayFromLocalStorage(ORDERS_KEY, []);
    const loadedProducts = loadArrayFromLocalStorage(
      PRODUCTS_KEY,
      DEFAULT_PRODUCTS
    );
    setOrders(loadedOrders);
    setProducts(loadedProducts);
    setIsReady(true);
  }, []);

  // orders 바뀔 때마다 자동 저장
  useEffect(() => {
    if (!isReady) return;
    saveArrayToLocalStorage(ORDERS_KEY, orders);
  }, [orders, isReady]);

  // products 바뀔 때마다 자동 저장
  useEffect(() => {
    if (!isReady) return;
    saveArrayToLocalStorage(PRODUCTS_KEY, products);
  }, [products, isReady]);

  // =========================
  // 상품 관리 관련 함수
  // =========================

  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]:
                field === "price" || field === "stock"
                  ? value.replace(/\D/g, "") // 숫자만
                  : value,
            }
          : p
      )
    );
  };

  const handleAddProductRow = () => {
    setProducts((prev) => [
      ...prev,
      { name: "", stock: "", price: "" },
    ]);
  };

  const handleDeleteProductRow = (index) => {
    if (!window.confirm("이 상품 행을 삭제할까요?")) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSaveClick = () => {
    // 이미 useEffect 로 저장되지만, 사용자가 “저장” 눌렀다는 느낌을 주기 위해
    saveArrayToLocalStorage(PRODUCTS_KEY, products);
    window.alert("상품 정보가 저장되었습니다.\n(이 브라우저에서 계속 유지돼요)");
  };

  // =========================
  // 주문 관리 관련 함수
  // =========================

  const handleMarkPaid = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "paid" } : o
      )
    );
  };

  const handleMarkPending = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "pending" } : o
      )
    );
  };

  const handleCancelOrder = (id) => {
    if (!window.confirm("이 주문을 '취소' 상태로 바꿀까요?")) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "cancelled" } : o
      )
    );
  };

  const handleDeleteOrder = (id) => {
    if (!window.confirm("이 주문을 완전히 삭제할까요?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // 엑셀(CSV) 다운로드
  const handleDownloadCsv = () => {
    if (!orders.length) {
      window.alert("다운로드할 주문이 없습니다.");
      return;
    }

    const header = [
      "주문ID",
      "상태",
      "주문자",
      "전화번호",
      "요청사항",
      "주문시간",
    ];

    const rows = orders.map((o) => [
      o.id ?? "",
      getStatusLabel(o.status),
      o.name ?? "",
      formatPhone(o.phone ?? ""),
      (o.memo ?? "").replace(/\r?\n/g, " "),
      o.createdAt ?? "",
    ]);

    const escapeCsvValue = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvLines = [
      header.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ];

    const csvContent = "\uFEFF" + csvLines.join("\r\n"); // BOM + 줄바꿈
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ssanjae-orders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 로딩 전이면 아무것도 안 보여줌 (SSR 깜빡임 방지)
  if (!isReady) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        관리자 화면 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "16px" }}>
        싼재네 오프라인 주문 관리자 화면
      </h1>

      {/* ================= 상품 관리 섹션 ================= */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "8px" }}>상품 관리</h2>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
          - 오늘 판매할 품목의 <b>상품명 / 재고수량 / 판매가격</b>을 입력하세요.
          <br />
          - 이 정보는 이 브라우저(localStorage)에 저장됩니다.
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "12px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                }}
              >
                상품명
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "120px",
                }}
              >
                재고수량
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "140px",
                }}
              >
                판매가격(원)
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "80px",
                }}
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "4px" }}>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) =>
                      handleProductChange(index, "name", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px" }}
                    placeholder="상품명을 입력하세요"
                  />
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px" }}>
                  <input
                    type="text"
                    value={p.stock}
                    onChange={(e) =>
                      handleProductChange(index, "stock", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px", textAlign: "right" }}
                    placeholder="예: 50"
                  />
                </td>
                <td style={{ border: "1px solid #ddd", padding: "4px" }}>
                  <input
                    type="text"
                    value={p.price}
                    onChange={(e) =>
                      handleProductChange(index, "price", e.target.value)
                    }
                    style={{ width: "100%", padding: "4px", textAlign: "right" }}
                    placeholder="예: 14900"
                  />
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleDeleteProductRow(index)}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    행 삭제
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  등록된 상품이 없습니다. 아래 버튼을 눌러 행을 추가하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleAddProductRow}
            style={{
              padding: "6px 10px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + 행 추가
          </button>
          <button
            onClick={handleProductSaveClick}
            style={{
              padding: "6px 10px",
              background: "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            상품 정보 저장
          </button>
        </div>
      </section>

      {/* ================= 주문 관리 섹션 ================= */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h2>주문 관리</h2>
          <button
            onClick={handleDownloadCsv}
            style={{
              padding: "6px 10px",
              background: "#2ecc71",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            주문 목록 엑셀 다운로드
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "12px" }}>
          - 손님이 /checkout 에서 주문하면 여기에 한 줄씩 추가됩니다.
          <br />- 은행 앱에서 입금 여부 확인 후, 각 주문 행의 버튼으로
          &quot;입금완료&quot; / &quot;입금확인 전&quot; / &quot;취소&quot;
          상태를 바꿔주세요.
        </p>

        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "90px",
                }}
              >
                상태
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                }}
              >
                주문자
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                }}
              >
                전화번호
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                }}
              >
                요청사항
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                }}
              >
                주문시간
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "140px",
                }}
              >
                입금처리
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  background: "#f8f8f8",
                  width: "140px",
                }}
              >
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  {getStatusLabel(o.status)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                  {o.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                  {formatPhone(o.phone)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                  {(o.memo || "").split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                  {o.createdAt}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  {o.status === "paid" ? (
                    <button
                      onClick={() => handleMarkPending(o.id)}
                      style={{
                        padding: "4px 8px",
                        background: "#f39c12",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      다시 입금확인 전으로
                    </button>
                  ) : o.status === "cancelled" ? (
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      취소된 주문
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(o.id)}
                      style={{
                        padding: "4px 8px",
                        background: "#27ae60",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      입금완료 처리
                    </button>
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleCancelOrder(o.id)}
                    style={{
                      padding: "4px 8px",
                      background: "#7f8c8d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px",
                      marginRight: "6px",
                    }}
                  >
                    주문취소
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(o.id)}
                    style={{
                      padding: "4px 8px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  아직 저장된 주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
