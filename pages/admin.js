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
      parsed = [];
    }

    parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setOrders(parsed);
  }, []);

  const saveOrders = (nextOrders) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ssanjae-orders", JSON.stringify(nextOrders));
    }
    setOrders(nextOrders);
  };

  const handleTogglePaid = (id) => {
    const next = orders.map((o) =>
      o.id === id
        ? { ...o, status: o.status === "paid" ? "pending" : "paid" }
        : o
    );
    saveOrders(next);
  };

  const handleCancelOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    if (window.confirm(`정말 주문 취소로 변경할까요?\n\n${target.name}`)) {
      const next = orders.map((o) =>
        o.id === id ? { ...o, status: "canceled" } : o
      );
      saveOrders(next);
    }
  };

  const handleDeleteOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    if (window.confirm(`정말 이 주문을 완전히 삭제할까요?\n\n${target.name}`)) {
      const next = orders.filter((o) => o.id !== id);
      saveOrders(next);
    }
  };

  // CSV 다운로드 ——————————————————————————
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("다운로드할 주문이 없습니다.");
      return;
    }

    const header = ["주문ID", "상태", "주문자", "전화번호", "요청사항", "주문시간"];

    const rows = orders.map((o) => [
      `ID-${o.id}`,
      statusLabel(o.status),
      o.name,
      formatPhone(o.phone),
      o.memo || "",
      o.createdAt ? new Date(o.createdAt).toLocaleString("ko-KR") : "",
    ]);

    // 구분자: 쉼표(,)로 변경 (엑셀 2016 호환)
    const csvLines = [header, ...rows].map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );

    const csvContent = csvLines.join("\r\n");

    // UTF-16LE + BOM (한글 깨짐 방지)
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

      <button
        onClick={handleDownloadCSV}
        style={{
          padding: "8px 14px",
          backgroundColor: "#2980b9",
          border: "none",
          borderRadius: "4px",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        주문 목록 엑셀 다운로드
      </button>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
        }}
      >
        <thead>
          <tr>
            <th style={th}>상태</th>
            <th style={th}>주문자</th>
            <th style={th}>전화번호</th>
            <th style={th}>요청사항</th>
            <th style={th}>주문시간</th>
            <th style={th}>입금처리</th>
            <th style={th}>관리</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td style={td}>
                <StatusBadge status={o.status} />
              </td>
              <td style={td}>{o.name}</td>
              <td style={td}>{formatPhone(o.phone)}</td>
              <td style={td}>{o.memo || "-"}</td>
              <td style={td}>
                {o.createdAt
                  ? new Date(o.createdAt).toLocaleString("ko-KR")
                  : "-"}
              </td>

              <td style={td}>
                <button
                  onClick={() => handleTogglePaid(o.id)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: o.status === "paid" ? "#2ecc71" : "#f39c12",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {o.status === "paid"
                    ? "다시 입금확인 전"
                    : "입금완료 처리"}
                </button>
              </td>

              <td style={td}>
                <button
                  onClick={() => handleCancelOrder(o.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#7f8c8d",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    marginRight: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  주문취소
                </button>

                <button
                  onClick={() => handleDeleteOrder(o.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#c0392b",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    cursor: "pointer",
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

      <style jsx>{`
        .status {
          padding: 4px 8px;
          color: white;
          border-radius: 999px;
          font-size: 11px;
          font-weight: bold;
        }
        .pending {
          background-color: #e74c3c;
          animation: blink 1s infinite;
        }
        .paid {
          background-color: #2ecc71;
        }
        .canceled {
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
function statusLabel(s) {
  if (s === "paid") return "입금완료";
  if (s === "canceled") return "주문취소";
  return "입금확인 전";
}

// 전화번호 포맷
function formatPhone(phone) {
  const d = String(phone).replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return phone;
}

// 상태 뱃지
function StatusBadge({ status }) {
  return (
    <span
      className={
        "status " +
        (status === "paid"
          ? "paid"
          : status === "canceled"
          ? "canceled"
          : "pending")
      }
    >
      {statusLabel(status)}
    </span>
  );
}

const th = {
  borderBottom: "1px solid #ccc",
  padding: "8px",
  background: "#f7f7f7",
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
