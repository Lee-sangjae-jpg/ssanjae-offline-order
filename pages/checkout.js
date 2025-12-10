// pages/checkout.js
import { useEffect, useState } from "react";

const SELECTED_ITEMS_KEY = "ssanjae-offline-selected-items";
const ORDERS_KEY = "ssanjae-offline-orders";

export default function Checkout() {
  const [orderItems, setOrderItems] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  // 1) 선택된 상품들 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SELECTED_ITEMS_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setOrderItems(parsed);
    } catch (e) {
      console.error("선택 상품 파싱 에러", e);
    }
  }, []);

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );

  // 2) 주문 저장 (입금확인 전)
  const handleSaveOrder = () => {
    if (orderItems.length === 0) {
      alert("주문 내역이 비어 있습니다. 메인 화면에서 상품을 선택해 주세요.");
      return;
    }
    if (!name.trim()) {
      alert("주문자 성함(입금자명)을 입력해 주세요.");
      return;
    }
    if (!phone.trim()) {
      alert("전화번호를 입력해 주세요.");
      return;
    }

    if (typeof window === "undefined") return;

    const newOrder = {
      id: Date.now(), // 간단한 주문ID
      status: "입금확인 전",
      name: name.trim(),
      phone: phone.trim(),
      memo: memo.trim(),
      items: orderItems,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    const raw = window.localStorage.getItem(ORDERS_KEY);
    let list = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    list.push(newOrder);
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list));

    alert("주문 정보가 저장되었습니다.\n관리자 화면에서 입금확인 후 처리해 주세요.");
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

      <main style={{ padding: "16px", paddingBottom: "80px" }}>
        {/* 주문 내역 박스 */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
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
            주문 내역
          </h2>

          {orderItems.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#666" }}>
              아직 선택된 상품이 없습니다. 메인 화면에서 상품 수량을 선택한 후 다시
              와주세요.
            </p>
          ) : (
            <>
              <ul style={{ paddingLeft: "16px", fontSize: "13px" }}>
                {orderItems.map((item) => (
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
              <p style={{ fontSize: "12px", marginTop: "6px", color: "#555" }}>
                입금 계좌: <strong>이상재(싼재네마켓) 560501-01-741443</strong>
                <br />
                <strong>주문 후 입금 부탁드립니다.</strong>
              </p>
            </>
          )}
        </section>

        {/* 주문자 정보 입력 */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "16px",
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
            주문자 정보 입력
          </h2>

          <p style={{ fontSize: "13px", marginBottom: "8px" }}>
            주문자 성함은 <strong>입금자명과 동일하게</strong> 적어주세요.
          </p>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              주문자 성함 (입금자명과 동일하게 적어주세요)
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 이상재"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              전화번호
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예) 01012345678"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              요청사항 (선택)
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예) 조금 늦을 것 같아요 00시"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </section>
      </main>

      <button
        onClick={handleSaveOrder}
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
        주문 저장 (입금확인 전)
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "13px",
  boxSizing: "border-box",
};
