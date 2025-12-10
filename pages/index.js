// pages/index.js
import { useState } from "react";
import { useRouter } from "next/router";

// ★ 여기 PRODUCT 목록은 예시야. 상품명/가격은 나중에 싼재가 마음대로 바꿔도 됨.
const PRODUCTS = [
  {
    id: "yogurt",
    name: "상하목장 마이리틀 유기농 짜먹는 요거트 플레인",
    price: 890,
  },
  {
    id: "fishcake",
    name: "수제 물떡 어묵탕",
    price: 6900,
  },
  {
    id: "dumpling",
    name: "따끈따끈 부산완당",
    price: 3900,
  },
];

export default function Home() {
  const router = useRouter();

  // 각 상품별 주문 수량
  const [quantities, setQuantities] = useState(
    () =>
      PRODUCTS.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
      }, {})
  );

  const handleChangeQty = (id, delta) => {
    setQuantities((prev) => {
      const next = { ...prev };
      const newValue = (next[id] || 0) + delta;
      next[id] = newValue < 0 ? 0 : newValue;
      return next;
    });
  };

  const itemsInCart = PRODUCTS.filter((p) => quantities[p.id] > 0).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    quantity: quantities[p.id],
  }));

  const totalPrice = itemsInCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrderClick = () => {
    if (itemsInCart.length === 0) {
      alert("주문할 상품의 수량을 1개 이상 선택해 주세요.");
      return;
    }

    // 1) 현재 장바구니 정보를 localStorage에 저장
    if (typeof window !== "undefined") {
      const cartData = {
        items: itemsInCart,
        totalPrice,
      };
      window.localStorage.setItem(
        "ssanjae-current-cart",
        JSON.stringify(cartData)
      );
    }

    // 2) /checkout 페이지로 이동
    router.push("/checkout");
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <header
        style={{
          backgroundColor: "#0B5538",
          color: "white",
          padding: "12px 16px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        싼재네 오프라인 주문
      </header>

      <main style={{ padding: "16px" }}>
        {/* 상품 목록 */}
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {p.name}
            </div>
            <div style={{ marginBottom: "8px" }}>
              가격: {p.price.toLocaleString()}원
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                onClick={() => handleChangeQty(p.id, -1)}
                style={qtyBtn}
              >
                -
              </button>
              <span style={{ minWidth: "30px", textAlign: "center" }}>
                {quantities[p.id]}
              </span>
              <button
                onClick={() => handleChangeQty(p.id, +1)}
                style={qtyBtn}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* 하단 고정 영역: 총 금액 + 주문하기 버튼 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid #ddd",
          backgroundColor: "white",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "#555" }}>총 금액</div>
          <div style={{ fontWeight: "bold" }}>
            {totalPrice.toLocaleString()}원
          </div>
        </div>
        <button
          onClick={handleOrderClick}
          style={{
            flex: 1,
            marginLeft: "12px",
            padding: "10px",
            backgroundColor: "#0B5538",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          주문하기
        </button>
      </div>
    </div>
  );
}

const qtyBtn = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  border: "1px solid #0B5538",
  backgroundColor: "white",
  color: "#0B5538",
  cursor: "pointer",
  fontWeight: "bold",
};
