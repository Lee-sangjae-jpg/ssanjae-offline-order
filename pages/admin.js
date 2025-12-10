import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // 처음 로딩 시, 브라우저 저장소에서 주문 목록 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("ssanjae-orders") || "[]";
    const parsed = JSON.parse(raw);
    // 최신 주문이 위로 오게 정렬
    parsed.sort((a, b) => (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1);
    setOrders(parsed);
  }, []);

  // 변경 내용을 localStorage에 다시 저장하는 함수
  const saveOrders = (nextOrders) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ssanjae-orders",
        JSON.stringify(nextOrders)
      );
    }
    setOrders(nextOrders);
  };

  // 상태 토글: pending -> paid
  const handleTogglePaid = (id) => {
    const next = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: order.status === "pending" ? "paid" : "pending",
          }
        : order
    );
    saveOrders(next);
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

      {orders.length === 0 ? (
        <p>아직 저장된 주문이 없습니다.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
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
                    ? new Date(order.createdAt).toLocaleString("ko-KR")
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
                        order.status === "pending" ? "#f39c12" : "#2ecc71",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {order.status === "pending"
                      ? "입금완료로 변경"
                      : "다시 입금확인 전으로"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 깜빡이는 효과를 위한 스타일 */}
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

function StatusBadge({ status }) {
  if (status === "paid") {
    return (
      <span className="status-badge status-paid">입금완료</span>
    );
  }
  return (
    <span className="status-badge status-pending">입금확인 전</span>
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
