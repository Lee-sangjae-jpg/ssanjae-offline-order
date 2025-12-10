// pages/index.js
import { useEffect, useState } from "react";

const PRODUCTS_KEY = "ssanjae-offline-products";
const ORDER_DRAFT_KEY = "ssanjae-offline-order-draft";

// 기본 상품 목록 (관리자 페이지에서 바꾸면 이 값 대신 저장된 값 사용)
const defaultProducts = [
  {
    id: 1,
    name: "상하목장 마이리틀 유기농 짜먹는 요구르 플레인",
    price: 890,
    stock: 999,
  },
  {
    id: 2,
    name: "수제 물떡 어묵탕",
    price: 6900,
    stock: 999,
  },
  {
    id: 3,
    name: "따끈따끈 부산완당",
    price: 3900,
    stock: 999,
  },
];

export default function Home() {
  const [products, setProducts] = useState(defaultProducts);
  const [quantities, setQuantities] = useState({});

  // 숫자 → "1,234원" 형식으로
  const formatPrice = (value) =>
    value.toLocaleString("ko-KR", { maximumFractionDigits: 0 }) + "원";

  // 처음 화면 열릴 때: 상품 설정 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 관리자 페이지에서 저장한 상품 목록이 있으면 사용
    const saved = window.localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } catch (e) {
        console.error("상품 데이터 파싱 오류", e);
      }
    }

    // 예전에 저장해 둔 임시 주문 내역은 새 주문을 위해 제거
    window.localStorage.removeItem(ORDER_DRAFT_KEY);
  }, []);

  // 수량 + / - 버튼
  const changeQuantity = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      let next = current + delta;
      if (next < 0) next = 0;
      return { ...prev, [id]: next };
    });
  };

  // 선택된 상품 목록과 총 금액 계산
  const selectedItems = products
    .map((p) => ({
      ...p,
      quantity: quantities[p.id] || 0,
    }))
    .filter((p) => p.quantity > 0);

  const totalPrice = selectedItems.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  // "주문 정보 입력하기" 버튼 눌렀을 때
  const goToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("먼저 상품 수량을 선택해 주세요!");
      return;
    }

    if (typeof window === "undefined") return;

    // checkout에서 사용할 임시 주문 정보 저장
    const draft = {
      items: selectedItems.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      totalPrice,
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));

    // /checkout 페이지로 이동
    window.location.href = "/checkout";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 설명 */}
      <div style={{ padding: "16px" }}>
        <h1 style={{ marginBottom: "8px" }}>싼재네 오프라인 주문</h1>
        <p style={{ fontSize: "14px", color: "#555" }}>
          오늘 판매하는 품목입니다.
          <br />
          원하는 수량을 선택하신 뒤, 아래{" "}
          <strong>“주문 정보 입력하기”</strong> 버튼을 눌러 주세요.
        </p>
      </div>

      {/* 상품 목록 */}
      <div style={{ flex: 1 }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
              padding: "16px",
            }}
          >
            <div style={{ marginBottom: "4px", fontWeight: "bold" }}>
              {product.name}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "8px",
              }}
            >
              가격: {formatPrice(product.price)}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                onClick={() => changeQuantity(product.id, -1)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                }}
              >
                -
              </button>
              <span style={{ minWidth: "20px", textAlign: "center" }}>
                {quantities[product.id] || 0}
              </span>
              <button
                onClick={() => changeQuantity(product.id, 1)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 선택한 상품 요약 */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #ddd",
          backgroundColor: "#fafafa",
          fontSize: "14px",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
          선택한 상품 요약
        </div>
        {selectedItems.length === 0 ? (
          <div>아직 선택한 상품이 없습니다.</div>
        ) : (
          <>
            <ul style={{ paddingLeft: "18px", marginTop: 0 }}>
              {selectedItems.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "8px", fontWeight: "bold" }}>
              총 금액: {formatPrice(totalPrice)}
            </div>
          </>
        )}
      </div>

      {/* 하단 주문 버튼 */}
      <button
        onClick={goToCheckout}
        style={{
          width: "100%",
          padding: "16px 0",
          border: "none",
          backgroundColor: "#004b2f",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        주문 정보 입력하기
      </button>
    </div>
  );
}
