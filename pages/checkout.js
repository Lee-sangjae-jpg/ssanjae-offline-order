import { useState } from "react";

export default function Checkout() {
  // ---- 입력값 상태 ----
  const [name, setName] = useState("");         // 주문자 성함
  const [phone, setPhone] = useState("");       // 전화번호
  const [receipt, setReceipt] = useState("");   // 현금영수증 번호(선택)
  const [memo, setMemo] = useState("");         // 요청사항 메모

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>주문자 정보 입력</h2>

      {/* 주문자 성함 */}
      <label>주문자 성함</label>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
        style={inputStyle}
      />

      {/* 전화번호 */}
      <label style={{ marginTop: "15px" }}>전화번호</label>
      <input 
        type="text" 
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="연락처를 입력하세요"
        style={inputStyle}
      />

      {/* 현금영수증 */}
      <label style={{ marginTop: "15px" }}>현금영수증 번호 (선택)</label>
      <input 
        type="text" 
        value={receipt}
        onChange={(e) => setReceipt(e.target.value)}
        placeholder="현금영수증 번호를 입력하세요"
        style={inputStyle}
      />

      {/* 메모 */}
      <label style={{ marginTop: "15px" }}>요청사항 (선택)</label>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="요청사항을 입력하세요"
        style={{ ...inputStyle, height: "80px" }}
      />

      {/* 미리보기 영역 (디버깅용) */}
      <div style={{ marginTop: "30px", padding: "15px", background: "#f0f0f0" }}>
        <h3>입력 확인</h3>
        <p>이름: {name}</p>
        <p>전화번호: {phone}</p>
        <p>현금영수증: {receipt}</p>
        <p>메모: {memo}</p>
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
  fontSize: "16px",
};
