// pages/index.js
import { useEffect, useState } from "react";

const PRODUCTS_KEY = "ssanjae-offline-products";
const SELECTED_ITEMS_KEY = "ssanjae-offline-selected-items";

const DEFAULT_PRODUCTS = [
  { id: 1, name: "상하목장 마이리틀 유기농 짜먹는 요거트 플레인", price: 890, stock: 999 },
  { id: 2, name: "수제 물떡 어묵탕", price: 6900, stock: 999 },
  { id: 3, name: "따끈따끈 부산완당", price: 3900, stock: 999 },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  // 1) 처음 들어올 때, 로컬스토리지에서 상품 목록 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setProducts(DEFAULT_PRODUCTS);
      }
    } else {
      setProducts(DEFAULT_PRODUCTS);
    }
  }, []);

  // 2) 수량 변경
  const changeQty = (id, diff) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + diff;
      if (next < 0) return prev;
      return { ...prev, [id]: next };
    });
  };

  // 3) 선택한 상품들로 요약 만들기
  const selectedItems = products
    .map((p) => ({
      ...p,
      quantity: quantities[p.id] || 0,
      totalPrice: (quantities[p.id] || 0) * p.price,
    }))
    .filter((item) => item.quantity > 0);

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // 4) "주문 정보 입력하기" 버튼 클릭 시
  const handleGoCheckout = () => {
    if (selectedItems.length === 0) {
      alert("상품을 하나 이상 선택해 주세요!");
      return;
    }

    if (typeof window === "undefined") return;

    // ★ checkout.js 에서도 똑같은 키를 사용할 거야
    window.localStorage.setItem(
      SELECTED_ITEMS_KEY,
      JSON.stringify(selectedItems)
    );

    // /checkout 페이지로 이동
    window.location.href = "/checkout";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          padding: "16px",
          backgroundColor: "#00512c",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        싼재네 오프라인 주문
      </header>

      <main style={{ padding: "16px" }}>
        <p style={{ fontSize: "13px", marginBottom: "4px" }}>
          오늘 판매하는 품목입니다.
        </p>
        <p style={{ fontSize: "13px", marginBottom: "16px" }}>
          원하는 수량을 선택하신 뒤, 아래{" "}
          <strong>“주문 정보 입력하기” 버튼</strong>을 눌러 주세요.
        </p>

        {/* 상품 리스트 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          {products.map((product) => {
            const qty = quantities[product.id] || 0;
            return (
              <div
                key={product.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#555" }}>
                    가격: {product.price.toLocaleString()}원
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => changeQty(product.id, -1)}
                    style={qtyButtonStyle}
                  >
                    -
                  </button>
                  <span style={{ minWidth: "24px", textAlign: "center" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => changeQty(product.id, 1)}
                    style={qtyButtonStyle}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 선택한 상품 요약 */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "80px",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: "8px",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            선택한 상품 요약
          </h2>

          {selectedItems.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#666" }}>
              아직 선택된 상품이 없습니다.
            </p>
          ) : (
            <>
              <ul style={{ paddingLeft: "16px", fontSize: "13px" }}>
                {selectedItems.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity}개 (
                    {item.totalPrice.toLocaleString()}원)
                  </li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                총 금액: {totalAmount.toLocaleString()}원
              </p>
            </>
          )}
        </section>
      </main>

      {/* 하단 고정 버튼 */}
      <button
        onClick={handleGoCheckout}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "56px",
          backgroundColor: "#00512c",
          color: "#fff",
          border: "none",
          fontSize: "16px",
        }}
      >
        주문 정보 입력하기
      </button>
    </div>
  );
}

const qtyButtonStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "16px",
  border: "1px solid #ccc",
  backgroundColor: "white",
  cursor: "pointer",
};
