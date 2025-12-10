// pages/index.js
import { useEffect, useState } from "react";

const PRODUCTS_KEY = "ssanjae-offline-products-v1";
const CART_KEY = "ssanjae-offline-cart-v1";

// admin.js 에서 썼던 DEFAULT_PRODUCTS 와 동일하게 맞추기
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

// 가격 표시: 6900 → 6,900원
function formatPrice(price) {
  if (price === "" || price === null || price === undefined) return "";
  const num = Number(price);
  if (Number.isNaN(num)) return String(price);
  return num.toLocaleString("ko-KR") + "원";
}

export default function HomePage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [quantities, setQuantities] = useState([]); // 각 상품 수량
  const [isReady, setIsReady] = useState(false);

  // 처음 로딩 시 상품 목록 가져오기
  useEffect(() => {
    const loadedProducts = loadArrayFromLocalStorage(
      PRODUCTS_KEY,
      DEFAULT_PRODUCTS
    );
    setProducts(loadedProducts);
    setQuantities(loadedProducts.map(() => 0)); // 상품 개수만큼 0으로 세팅
    setIsReady(true);
  }, []);

  // 수량 증가 / 감소
  const changeQuantity = (index, delta) => {
    setQuantities((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const next = q + delta;
        if (next < 0) return 0;
        return next;
      })
    );
  };

  // 선택된 상품 목록 / 총금액 계산
  const selectedItems = products
    .map((p, i) => ({
      ...p,
      quantity: quantities[i] || 0,
    }))
    .filter((item) => item.quantity > 0);

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  // 주문 버튼 눌렀을 때
  const handleGoCheckout = () => {
    if (!selectedItems.length) {
      window.alert("먼저 주문하실 상품 수량을 선택해 주세요.");
      return;
    }

    // 장바구니를 localStorage 에 저장
    const cartData = {
      items: selectedItems.map((item) => ({
        name: item.name,
        price: Number(item.price || 0),
        quantity: item.quantity,
      })),
      totalPrice,
      savedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cartData));
    } catch (e) {
      console.error("failed to save cart", e);
      window.alert("브라우저 저장 중 문제가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    // /checkout 페이지로 이동
    window.location.href = "/checkout";
  };

  if (!isReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        화면을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 헤더 */}
      <header
        style={{
          background: "#00512f",
          color: "#fff",
          padding: "14px 16px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        싼재네 오프라인 주문
      </header>

      {/* 본문 영역 */}
      <main style={{ flex: 1, padding: "12px 12px 90px" }}>
        {/* 안내문 */}
        <div
          style={{
            marginBottom: "12px",
            fontSize: "13px",
            color: "#444",
            lineHeight: 1.4,
          }}
        >
          오늘 판매하는 품목입니다.
          <br />
          원하시는 수량을 선택하신 뒤, 아래 <b>“주문 정보 입력하기”</b> 버튼을 눌러 주세요.
        </div>

        {/* 상품 리스트 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {products.map((product, index) => {
            const priceNumber = Number(product.price || 0);
            const hasPrice = !Number.isNaN(priceNumber) && priceNumber > 0;

            return (
              <div
                key={index}
                style={{
                  padding: "12px 12px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* 상품명 + 가격 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "4px",
                      wordBreak: "keep-all",
                    }}
                  >
                    {product.name || "(상품명 미입력)"}
                  </div>
                  {hasPrice && (
                    <div style={{ fontSize: "13px", color: "#555" }}>
                      가격: {formatPrice(priceNumber)}
                    </div>
                  )}
                  {!hasPrice && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#c0392b",
                        marginTop: "2px",
                      }}
                    >
                      (가격이 설정되지 않았습니다)
                    </div>
                  )}
                  {product.stock && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      재고: {product.stock}개 (참고용)
                    </div>
                  )}
                </div>

                {/* 수량 조절 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginLeft: "12px",
                  }}
                >
                  <button
                    onClick={() => changeQuantity(index, -1)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      lineHeight: "24px",
                    }}
                  >
                    -
                  </button>
                  <div
                    style={{
                      minWidth: "24px",
                      textAlign: "center",
                      fontSize: "15px",
                    }}
                  >
                    {quantities[index] || 0}
                  </div>
                  <button
                    onClick={() => changeQuantity(index, +1)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid #00512f",
                      background: "#00512f",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      lineHeight: "24px",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                fontSize: "13px",
                color: "#888",
              }}
            >
              등록된 상품이 없습니다.
              <br />
              관리자 화면(/admin)에서 상품을 먼저 등록해 주세요.
            </div>
          )}
        </div>

        {/* 선택 요약 박스 */}
        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            background: "#fff",
            borderRadius: "4px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            fontSize: "13px",
          }}
        >
          <div style={{ marginBottom: "6px", fontWeight: 600 }}>
            선택한 상품 요약
          </div>
          {selectedItems.length === 0 ? (
            <div style={{ color: "#888" }}>아직 선택된 상품이 없습니다.</div>
          ) : (
            <>
              <ul style={{ paddingLeft: "18px", margin: "0 0 6px" }}>
                {selectedItems.map((item, i) => (
                  <li key={i}>
                    {item.name} × {item.quantity}개
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 600 }}>
                총 금액: {formatPrice(totalPrice)}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "10px 12px 12px",
          background:
            "linear-gradient(to top, rgba(245,245,245,1), rgba(245,245,245,0.9))",
          borderTop: "1px solid #ddd",
        }}
      >
        <button
          onClick={handleGoCheckout}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: "4px",
            border: "none",
            background: "#00512f",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          주문 정보 입력하기
        </button>
      </div>
    </div>
  );
}
