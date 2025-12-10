import { useState, useEffect } from "react";

export default function Checkout() {
  // ---- 입력값 상태 ----
  const [name, setName] = useState("");       // 주문자 성함
  const [phone, setPhone] = useState("");     // 전화번호
  const [receipt, setReceipt] = useState(""); // 현금영수증 번호(선택)
  const [memo, setMemo] = useState("");       // 요청사항(선택)

  // 브라우저에 저장된 이름/전화번호 불러오기 (단골 편의용)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = window.localStorage.getItem("ssanjae-name") || "";
    const savedPhone = window.localStorage.getItem("ssanjae-phone") || "";
    setName(savedName);
    setPhone(savedPhone);
  }, []);

  // 주문 정보 임시 저장 (나중에 여기서 구글시트/백엔드로 전송)
  const handleSubmit = () => {
    const trimmedName = name.trim();
    const onlyDigitsPhone = phone.replace(/[^0-9]/g, "");

    if (!trimmedName) {
      alert("주문자 성함을 입력해 주세요.");
      return;
    }
    if (onlyDigitsPhone.length < 10) {
      alert("연락 가능한 휴대폰 번호를 숫자만으로 입력해 주세요.");
      return;
    }

    // 브라우저에 이름/전화번호 저장 (다음에 자동 입력)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ssanjae-name", trimmedName);
      window.localStorage.setItem("ssanjae-phone", onlyDigitsPhone);
    }

    // 지금은 테스트라 팝업만 띄움 (나중엔 주문 데이터 전송)
    alert(
      `주문 정보가 저장되었습니다.\n\n` +
        `이름: ${trimmedName}\n` +
        `전화번호: ${onlyDigitsPhone}\n` +
        `현금영수증: ${receipt || "미신청"}\n` +
        `메모: ${memo || "-"}`
    );
  };

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
        onChange={(e) =>
          setPhone(e.target.value.replace(/[^0-9]/g, ""))
        }
        placeholder="숫자만 입력해 주세요 (예: 01012345678)"
        maxLength={11}
        style={inputStyle}
      />

      {/* 현금영수증 */}
      <label style={{ marginTop: "15px" }}>현금영수증 번호 (선택)</label>
      <input
        type="text"
        value={receipt}
        onChange={(e) =>
          setReceipt(e.target.value.replace(/[^0-9]/g, ""))
        }
        placeholder="휴대폰 번호 / 사업자번호 등"
        style={inputStyle}
      />

      {/* 메모 */}
      <label style={{ marginTop: "15px" }}>요청사항 (선택)</label>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="예) 아이스팩 꼭 넣어주세요 / 부재 시 경비실 맡겨주세요"
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
        주문자 정보 저장 (테스트)
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
  fontSize: "14px",
  boxSizing: "border-box",
};
