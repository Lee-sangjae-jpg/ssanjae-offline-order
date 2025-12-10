import { useState } from "react";

const dates = [
  { id: "2025-12-10", label: "12월10일(수)" },
  { id: "2025-12-11", label: "12월11일(목)" },
  { id: "2025-12-12", label: "12월12일(금)" },
];

const products = [
  {
    id: 1,
    name: "상하목장 마이리틀 유기농 짜먹는 요거트 플레인",
    price: 890,
    remaining: 86,
    pickupTime: "12:00 ~ 20:00 수령 가능",
    note: "86개 남았어요!",
  },
  {
    id: 2,
    name: "수제 몰떡 어묵탕",
    price: 6900,
    remaining: 49,
    pickupTime: "12:00 ~ 20:00 수령 가능",
    note: "49개 남았어요!",
  },
  {
    id: 3,
    name: "따끈따끈 부산완당",
    price: 3900,
    remaining: 394,
    pickupTime: "12:00 ~ 20:00 수령 가능",
    note: "주문주세요!",
  },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(dates[0].id);
  const [quantities, setQuantities] = useState({});

  const handleChangeQty = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce(
    (sum, v) => sum + (v || 0),
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "sans-serif",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 헤더 */}
      <header
        style={{
          padding: "12px 16px",
          backgroundColor: "#0c5c3b",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: "bold" }}>싼재네 오프라인 주문</div>
        <div style={{ fontSize: "12px" }}>루주네님 안녕하세요</div>
      </header>

      {/* 날짜 탭 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          overflowX: "auto",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {dates.map((d) => {
          const isActive = d.id === selectedDate;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDate(d.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: isActive ? "1px solid #0c5c3b" : "1px solid #cccccc",
                backgroundColor: isActive ? "#0c5c3b" : "white",
                color: isActive ? "white" : "#333",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* 상품 리스트 */}
      <main
        style={{
          flex: 1,
          padding: "12px 16px 80px",
          overflowY: "auto",
        }}
      >
        {products.map((p) => {
          const qty = quantities[p.id] || 0;
          return (
            <div
              key={p.id}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                {p.name}
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "4px",
                }}
              >
                {p.price.toLocaleString()}원
              </div>
              <div style={{ fontSize: "12px", color: "#00796b" }}>
                {p.note}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#555",
                  marginTop: "4px",
                  marginBottom: "8px",
                }}
              >
                {p.pickupTime}
              </div>

              {/* 수량 조절 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => handleChangeQty(p.id, -1)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "999px",
                    border: "1px solid #cccccc",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                >
                  –
                </button>
                <span style={{ minWidth: "24px", textAlign: "center" }}>
                  {qty}
                </span>
                <button
                  onClick={() => handleChangeQty(p.id, 1)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "999px",
                    border: "1px solid #0c5c3b",
                    backgroundColor: "#0c5c3b",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* 하단 주문 영역 */}
      <footer
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8px 16px",
          backgroundColor: "white",
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: "6px",
            border: "1px solid #0c5c3b",
            backgroundColor: "white",
            color: "#0c5c3b",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          주문내역
        </button>
        <button
          style={{
            flex: 2,
            padding: "10px 0",
            borderRadius: "6px",
            border: "none",
            backgroundColor: totalItems > 0 ? "#0c5c3b" : "#9e9e9e",
            color: "white",
            fontWeight: "bold",
            cursor: totalItems > 0 ? "pointer" : "default",
          }}
        >
          {totalItems > 0
            ? `${totalItems}개 주문하기`
            : "선택한 상품이 없어요"}
        </button>
      </footer>
    </div>
  );
}
