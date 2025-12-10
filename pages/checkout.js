// pages/checkout.js
import { useEffect, useState } from "react";

const ORDER_DRAFT_KEY = "ssanjae-offline-order-draft";
const ORDERS_KEY = "ssanjae-offline-orders";

const formatPrice = (value) =>
  value.toLocaleString("ko-KR", { maximumFractionDigits: 0 }) + "원";

export default function Checkout() {
  // 1) index에서 넘어온 임시 주문 정보
  const [draft, setDraft] = useState(null);

  // 2) 입력 폼 상태
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  // 3) 주문 저장 후 알림용
  const [savedOrderId, setSavedOrderId] = useState(null);

  // 화면이 처음 열릴 때: 로컬스토리지에서 임시 주문 정보 읽기
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(ORDER_DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setDraft(parsed);
    } catch (e) {
      console.error("임시 주문 정보 파싱 오류", e);
    }
  }, []);

  const handleSaveOrder = () => {
    if (!draft || !draft.items || draft.items.length === 0) {
      alert("먼저 메인 화면에서 상품을 선택해 주세요.");
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
      id: Date.now(), // 엑셀/관리자에서 구분용
      status: "입금확인 전",
      customerName: name.trim(),
      phone: phone.trim(),
      memo: memo.trim() || "-",
      createdAt: new Date().toLocaleString("ko-KR"),
      items: draft.items, // 품목/수량/단가 정보
      totalPrice: draft.totalPrice,
    };

    // 기존 주문 목록 불러오기
    const rawOrders = window.localStorage.getItem(ORDERS_KEY);
    let orders = [];
    if (rawOrders) {
      try {
        orders = JSON.parse(rawOrders);
      } catch (e) {
        console.error("주문 목록 파싱 오류", e);
      }
    }

    // 새 주문 추가 후 저장
    orders.push(newOrder);
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    setSavedOrderId(newOrder.id);
    alert(
      `주문이 저장되었습니다.\n관리자 화면에서 입금확인 후 '입금완료'로 변경해 주세요.`
    );
  };

  return (
    <div style={{ padding: "16px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* 1. 주문 내역 영역 */}
      <section
        style={{
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#f8fff8",
          borderRadius: "8px",
          border: "1px solid #d0e8d0",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0" }}>주문 내역</h2>

        {!draft || !draft.items || draft.items.length === 0 ? (
          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
            아직 선택된 상품이 없습니다.
            <br />
            메인 화면에서 상품 수량을 선택한 후 다시 와주세요.
          </p>
        ) : (
          <>
            <ul style={{ paddingLeft: "18px", margin: "0 0 8px 0" }}>
              {draft.items.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity}개 (
                  {formatPrice(item.price * item.quantity)})
                </li>
              ))}
            </ul>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              총 금액: {formatPrice(draft.totalPrice)}
            </div>
            <div style={{ fontSize: "14px", color: "#444" }}>
              입금 계좌: <strong>이상재(싼재네마켓) 560501-01-741443</strong>
              <br />
              <span style={{ color: "#c0392b" }}>
                주문 후 입금 부탁드립니다.
              </span>
            </div>
          </>
        )}
      </section>

      {/* 2. 주문자 정보 입력 */}
      <section
        style={{
          padding: "12px 16px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0" }}>주문자 정보 입력</h2>

        <div style={{ marginBottom: "8px", fontSize: "13px", color: "#444" }}>
          주문자 성함은 <strong>입금자명과 동일하게</strong> 적어 주세요.
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            주문자 성함(입금자명)
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 이상재"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            전화번호
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="예) 01012345678"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            요청사항 (선택)
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예) 조금 늦을 것 같아요 00시쯤 도착할 것 같아요"
            rows={3}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          onClick={handleSaveOrder}
          style={{
            width: "100%",
            padding: "12px 0",
            border: "none",
            marginTop: "8px",
            backgroundColor: "#004b2f",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          주문 저장 (입금확인 전)
        </button>
      </section>

      {/* 3. 입력 확인 미니 미리보기 */}
      <section
        style={{
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #eee",
          backgroundColor: "#fafafa",
          fontSize: "14px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>입력 확인</h3>
        <p>이름(입금자명): {name || "-"}</p>
        <p>전화번호: {phone || "-"}</p>
        <p>요청사항: {memo || "-"}</p>
        {savedOrderId && (
          <p style={{ color: "#2c7" }}>
            주문이 저장되었습니다. (주문ID: {savedOrderId})
          </p>
        )}
      </section>
    </div>
  );
}
