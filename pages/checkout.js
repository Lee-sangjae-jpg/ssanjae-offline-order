// pages/checkout.js
import { useEffect, useState } from "react";

export default function Checkout() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("ssanjae-current-cart");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setCart({
        items: parsed.items || [],
        totalPrice: parsed.totalPrice || 0,
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveOrder = () => {
    if (cart.items.length === 0) {
      alert("주문 내역이 없습니다. 메인 화면에서 상품을 선택해 주세요.");
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

    const rawOrders = window.localStorage.getItem("ssanjae-orders") || "[]";
    let orders = [];
    try {
      orders = JSON.parse(rawOrders);
    } catch (e) {
      orders = [];
    }

    const newOrder = {
      id: Date.now(), // 주문 ID
      items: cart.items,
      totalPrice: cart.totalPrice,
      name,
      phone,
      memo,
      status: "pending", // 입금확인 전
      createdAt: Date.now(),
    };

    orders.push(newOrder);
    window.localStorage.setItem("ssanjae-orders", JSON.stringify(orders));

    // 현재 장바구니는 비워 두는 게 안전
    window.localStorage.removeItem("ssanjae-current-cart");

    alert(
      [
        "주문 정보가 저장되었습니다.",
        "",
        `주문자: ${name}`,
        `전화번호: ${phone}`,
        `총 금액: ${cart.totalPrice.toLocaleString()}원`,
        "",
        "주문 후 아래 계좌로 입금 부탁드립니다.",
        "이상재(싼재네마켓) 560501-01-741443",
      ].join("\n")
    );
  };

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      {/* 1. 주문 내역 + 계좌 안내 박스 */}
      <div
        style={{
          border: "2px solid #0B5538",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "20px",
          background: "#f9fffb",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "8px" }}>주문 내역</h3>

        {cart.items.length === 0 ? (
          <div style={{ color: "#999", fontSize: "14px" }}>
            아직 선택된 상품이 없습니다.
            <br />
            메인 화면에서 상품 수량을 선택한 후 다시 와주세요.
          </div>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  <th style={th}>품목</th>
                  <th style={th}>수량</th>
                  <th style={th}>금액</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td style={td}>{item.name}</td>
                    <td style={td}>{item.quantity}개</td>
                    <td style={td}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                textAlign: "right",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              총 금액: {cart.totalPrice.toLocaleString()}원
            </div>

            <div style={{ fontSize: "13px", lineHeight: 1.6 }}>
              <div>
                <b>입금 계좌</b>: 이상재(싼재네마켓) 560501-01-741443
              </div>
              <div style={{ color: "#d35400", fontWeight: "bold" }}>
                ※ 주문 후 입금 부탁드립니다.
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. 주문자 정보 입력 */}
      <h2>주문자 정보 입력</h2>

      <div style={{ marginBottom: "10px", fontSize: "13px", color: "#555" }}>
        주문자 성함은 <b>입금자명과 동일하게</b> 적어주세요.
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={label}>
          주문자 성함 (입금자명과 동일하게 적어주세요)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
            placeholder="예) 이상재"
          />
        </label>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={label}>
          전화번호
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={input}
            placeholder="예) 01012345678"
          />
        </label>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={label}>
          요청사항 (선택)
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={{ ...input, height: "80px", resize: "vertical" }}
            placeholder="예) 조금 늦을 것 같아요 00시"
          />
        </label>
      </div>

      <button
        onClick={handleSaveOrder}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#0B5538",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        주문 저장 (입금확인 전)
      </button>

      {/* 3. 입력 확인 박스 */}
      <div
        style={{
          borderTop: "1px solid #eee",
          paddingTop: "16px",
          marginTop: "8px",
        }}
      >
        <h3>입력 확인</h3>
        <p>이름(입금자명): {name || "-"}</p>
        <p>전화번호: {phone || "-"}</p>
        <p>요청사항: {memo || "-"}</p>
      </div>
    </div>
  );
}

const th = {
  borderBottom: "1px solid #ccc",
  padding: "4px 6px",
  textAlign: "left",
  background: "#f3f3f3",
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "4px 6px",
};

const label = {
  display: "block",
  fontSize: "14px",
  marginBottom: "4px",
};

const input = {
  width: "100%",
  padding: "8px",
  boxSizing: "border-box",
  borderRadius: "4px",
  border: "1px solid #ccc",
  marginTop: "4px",
};
