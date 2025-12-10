import { useState, useEffect } from "react";

export default function Checkout() {
  // ---- 입력값 상태 ----
  const [name, setName] = useState("");   // 주문자 성함(입금자명)
  const [phone, setPhone] = useState(""); // 전화번호
  const [memo, setMemo] = useState("");   // 요청사항(선택)

  // 브라우저에 저장된 이름/전화번호 불러오기 (단골 편의)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = window.localStorage.getItem("ssanjae-name") || "";
    const savedPhone = window.localStorage.getItem("ssanjae-phone") || "";
    setName(savedName);
    setPhone(savedPhone);
  }, []);

  // 주문 저장 (입금확인 전 상태로 추가)
  const handleSubmit = () => {
    const trimmedName = name.trim();
    const onlyDigitsPhone = phone.replace(/[^0-9]/g, "");

    if (!trimmedName) {
      alert("주문자 성함을 입력해 주세요. (입금자명과 동일해야 합니다)");
      return;
    }
    if (onlyDigitsPhone.length < 10) {
      alert("연락 가능한 휴대폰 번호를 숫자만으로 입력해 주세요.");
      return;
    }

    // 이름/전화번호는 단골 편의를 위해 로컬에 저장
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ssanjae-name", trimmedName);
      window.localStorage.setItem("ssanjae-phone", onlyDigitsPhone);
    }

    // 주문 목록에 새 주문 추가 (입금확인 전 상태)
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("ssanjae-orders") || "[]";
      const orders = JSON.parse(raw);

      const newOrder = {
        id: Date.now(),              // 임시 주문 ID
        name: trimmedName,           // 주문자 성함 = 입금자명
        phone: onlyDigitsPhone,      // 연락처
        memo,                        // 요청사항
        status: "pending",           // 입금확인 전
        createdAt: new Date().toISOString(),
      };

      orders.push(newOrder);
      window.localStorage.setItem("ssanjae-orders", JSON.stringify(orders));
    }

    alert(
      "주문이 '입금확인 전' 상태로 저장되었습니다.\n" +
        "입금 후에는 사장님이 관리자 화면에서 '입금완료'로 변경해 주실 거예요."
    );

    // 폼 초기화 (원하면 메모만 비우고 이름/전화번호는 유지해도 됨)
    setMemo("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>주문자 정보 입력</h2>

      {/* 주문자 성함 */}
      <label>주문자 성함 (입금자명과 동일하게 적어주세요)</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예) 이상재"
        style={inputStyle}
      />

      {/* 전화번호 */}
      <label style={{ marginTop: "15px" }}>전화번호</label>
      <input
        type="text"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value.replace(/[^0-9]/g, ""))
        }
        placeholder="숫자만 입력 (예: 01012345678)"
        maxLength={11}
        style={inputStyle}
      />

      {/* 메모 */}
      <label style={{ marginTop: "15px" }}>요청사항 (선택)</label>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="예) 조금 늦을 것 같아요 OO시 "
        style={{ ...inputStyle, height: "80px" }}
      />

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#0c5c3b",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        주문 저장 (입금확인 전)
      </button>

      {/* 미리보기 영역 */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "6px",
        }}
      >
        <h3>입력 확인</h3>
        <p>이름(입금자명): {name}</p>
        <p>전화번호: {phone}</p>
        <p>요청사항: {memo}</p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "14px",
  boxSizing: "border-box",
};
