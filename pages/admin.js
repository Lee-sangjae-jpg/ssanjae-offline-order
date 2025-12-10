// pages/admin.js
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // 처음 로딩 시 localStorage에서 주문 목록 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("ssanjae-orders") || "[]";
    let parsed = [];
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse orders from localStorage", e);
      parsed = [];
    }

    // 최신 주문이 위로 오게 정렬
    parsed.sort((a, b) =>
      (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1
    );

    setOrders(parsed);
  }, []);

  // localStorage + 상태 동시 저장
  const saveOrders = (nextOrders) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ssanjae-orders",
        JSON.stringify(nextOrders)
      );
    }
    setOrders(nextOrders);
  };

  // 입금확인 전 ↔ 입금완료 토글
  const handleTogglePaid = (id) => {
    const next = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: order.status === "paid" ? "pending" : "paid",
          }
        : order
    );
    saveOrders(next);
  };

  // 주문취소 상태로 변경
  const handleCancelOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const ok = window.confirm(
      `정말 이 주문을 "주문취소" 상태로 바꾸시겠어요?\n\n주문자: ${target.name}\n전화번호: ${target.phone}`
    );
    if (!ok) return;

    const next = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: "canceled",
          }
        : order
    );
    saveOrders(next);
  };

  // 주문 완전 삭제
  const handleDeleteOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const ok = window.confirm(
      `정말 이 주문을 목록에서 완전히 삭제할까요?\n\n주문자: ${target.name}\n전화번호: ${target.phone}`
    );
    if (!ok) return;

    const next = orders.filter((order) => order.id !== id);
    saveOrders(next);
  };

  // 엑셀에서 열 수 있는 CSV 다운로드
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("다운로드할 주문이 없습니다.");
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
      // 숫자 그대로 두면 1.23E+12 같은 지수표기로 나오니 문자처럼 보이게
      `ID-${o.id}`,
      statusLabel(o.status),
      o.name,
      formatPhone(o.phone),
      o.memo || "",
      o.createdAt
        ? new Date(o.createdAt).toLocaleString("ko-KR")
        : "",
    ]);

    // 한국 엑셀이 좋아하는 세미콜론(;) 구분자 사용
    const csvLines = [header, ...rows].map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";")
    );

    const csvContent = csvLines.join("\r\n");

    // UTF-16 + BOM 으로 저장 → 엑셀 2016에서 한글 안 깨지게
    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-16le;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ssanjae-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>싼재네 오프라인 주문 관리자 화면</h2>
      <p style={{ fontSize: "13px", color: "#555" }}>
        - 손님이 /checkout에서 주문하면 여기 목록에 추가됩니다.
        <br />
        - 은행 앱에서 입금 확인 후, 해당 주문의 버튼을 눌러
        &quot;입금완료&quot;로 변경해 주세요.
      </p>

      {/* 전체 엑셀 다운로드 버튼 */}
      <div style={{ margin: "10px 0 5px 0" }}>
        <button
          onClick={handleDownloadCSV}
          style={{
            padding: "8px 14px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#2980b9",
            color: "white",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          주문 목록 엑셀 다운로드
        </button>
      </div>

      {orders.length === 0 ? (
        <p>아직 저장된 주문이 없습니다.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>주문자</th>
              <th style={thStyle}>전화번호</th>
              <th style={thStyle}>요청사항</th>
              <th style={thStyle}>주문시간</th>
              <th style={thStyle}>입금처리</th>
              <th style={thStyle}>관리</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={tdStyle}>
                  <StatusBadge status={order.status} />
                </td>
                <td style={tdStyle}>{order.name}</td>
                <td style={tdStyle}>{order.phone}</td>
                <td style={tdStyle}>{order.memo || "-"}</td>
                <td style={tdStyle}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString(
                        "ko-KR"
                      )
                    : "-"}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleTogglePaid(order.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor:
                        order.status === "paid"
                          ? "#2ecc71"
                          : "#f39c12",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    {order.status === "paid"
                      ? "다시 입금확인 전으로"
                      : "입금완료로 변경"}
                  </button>
                </td>
                <td style={tdStyle}>
                  {/* 주문취소 버튼 */}
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#7f8c8d",
                      color: "white",
                      fontSize: "11px",
                      marginRight: "4px",
                    }}
                  >
                    주문취소
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#c0392b",
                      color: "white",
                      fontSize: "11px",
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 상태 배지 & 깜빡임 스타일 */}
      <style jsx>{`
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: bold;
          color: white;
        }
        .status-pending {
          background-color: #e74c3c;
          animation: blink 1s infinite;
        }
        .status-paid {
          background-color: #2ecc71;
        }
        .status-canceled {
          background-color: #7f8c8d;
        }
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// 상태 텍스트 (CSV용)
function statusLabel(status) {
  if (status === "paid") return "입금완료";
  if (status === "canceled") return "주문취소";
  return "입금확인 전";
}

// 전화번호를 010-1234-5678 형식으로 변환
function formatPhone(phone) {
  const digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// 화면에 표시할 상태 뱃지
function StatusBadge({ status }) {
  if (status === "paid") {
    return (
      <span className="status-badge status-paid">입금완료</span>
    );
  }
  if (status === "canceled") {
    return (
      <span className="status-badge status-canceled">
        주문취소
      </span>
    );
  }
  return (
    <span className="status-badge status-pending">
      입금확인 전
    </span>
  );
}

const thStyle = {
  borderBottom: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f9f9f9",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px",
  verticalAlign: "top",
};
