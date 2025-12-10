// pages/admin.js
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // 로딩 시 localStorage에서 가져오기
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

  const saveOrders = (next) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ssanjae-orders", JSON.stringify(next));
    }
    setOrders(next);
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
    if (
      window.confirm(
        `정말 이 주문을 '주문취소' 상태로 변경할까요?\n\n주문자: ${target.name}`
      )
    ) {
      const next = orders.map((o) =>
        o.id === id ? { ...o, status: "canceled" } : o
      );
      saveOrders(next);
    }
  };

  const handleDeleteOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;
    if (
      window.confirm(
        `정말 이 주문을 완전히 삭제할까요?\n\n주문자: ${target.name}`
      )
    ) {
      const next = orders.filter((o) => o.id !== id);
      saveOrders(next);
    }
  };

  // 주문들 중 가장 많은 품목 개수 구하기 → 그만큼 컬럼 생성
  const maxItemCount = orders.reduce(
    (max, o) => Math.max(max, (o.items || []).length),
    0
  );

  // 엑셀( CSV ) 다운로드
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("다운로드할 주문이 없습니다.");
      return;
    }

    const productHeaders = Array.from({ length: maxItemCount }).map(
      (_, idx) => `품목${idx + 1}`
    );

    const header = [
      "주문ID",
      "상태",
      ...productHeaders,
      "주문자",
      "전화번호",
      "요청사항",
      "총금액",
      "주문시간",
    ];

    const rows = orders.map((o) => {
      const itemTexts = Array.from({ length: maxItemCount }).map((_, idx) => {
        const item = (o.items || [])[idx];
        return item ? `${item.name} x${item.quantity}` : "";
      });

      return [
        `ID-${o.id}`,
        statusLabel(o.status),
        ...itemTexts,
        o.name,
        formatPhone(o.phone),
        o.memo || "",
        (o.totalPrice || 0).toLocaleString() + "원",
        o.createdAt ? new Date(o.createdAt).toLocaleString("ko-KR") : "",
      ];
    });

    const csvLines = [header, ...rows].map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );

    const csvContent = csvLines.join("\r\n");
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
        · 손님이 <b>/checkout</b>에서 주문하면 여기 목록에 추가됩니다. <br />
        · 은행 앱에서 입금 확인 후, 해당 주문의 버튼을 눌러{" "}
        <b>'입금완료'</b>로 변경해 주세요.
      </p>

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
          fontSize: "13px",
        }}
      >
        <thead>
          <tr>
            <th style={th}>상태</th>
            {/* 품목1 ~ 품목N 컬럼 */}
            {Array.from({ length: maxItemCount }).map((_, idx) => (
              <th key={idx} style={th}>
                품목{idx + 1}
              </th>
            ))}
            <th style={th}>주문자</th>
            <th style={th}>전화번호</th>
            <th style={th}>요청사항</th>
            <th style={th}>총금액</th>
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

              {/* 품목 칸들 */}
              {Array.from({ length: maxItemCount }).map((_, idx) => {
                const item = (o.items || [])[idx];
                return (
                  <td key={idx} style={td}>
                    {item ? `${item.name} x${item.quantity}` : "-"}
                  </td>
                );
              })}

              <td style={td}>{o.name}</td>
              <td style={td}>{formatPhone(o.phone)}</td>
              <td style={td}>{o.memo || "-"}</td>
              <td style={td}>
                {(o.totalPrice || 0).toLocaleString()}
                원
              </td>
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
                    backgroundColor:
                      o.status === "paid" ? "#2ecc71" : "#f39c12",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {o.status === "paid"
                    ? "다시 입금확인 전으로"
                    : "입금완료로 변경"}
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

          {orders.length === 0 && (
            <tr>
              <td style={{ ...td, textAlign: "center" }} colSpan={8 + maxItemCount}>
                아직 저장된 주문이 없습니다.
              </td>
            </tr>
          )}
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

// 상태 텍스트
function statusLabel(s) {
  if (s === "paid") return "입금완료";
  if (s === "canceled") return "주문취소";
  return "입금확인 전";
}

// 전화번호 포맷
function formatPhone(phone) {
  const d = String(phone || "").replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return phone || "";
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
