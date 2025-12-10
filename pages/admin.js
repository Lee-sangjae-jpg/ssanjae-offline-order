// pages/admin.js
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  // 처음 로딩 시 localStorage에서 주문 목록 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("ssanjae-orders") || "[]";
    let parsed = [];
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse orders from localStorage", e);
      parsed = [];
    }

    // 최신 주문이 위로 오게 정렬
    parsed.sort((a, b) =>
      (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1
    );

    setOrders(parsed);
  }, []);

  // localStorage + 상태 동시 저장
  const saveOrders = (nextOrders) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ssanjae-orders",
        JSON.stringify(nextOrders)
      );
    }
    setOrders(nextOrders);
  };

  // 입금확인 전 ↔ 입금완료 토글
  const handleTogglePaid = (id) => {
    const next = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: order.status === "paid" ? "pending" : "paid",
          }
        : order
    );
    saveOrders(next);
  };

  // 주문취소 상태로 변경
  const handleCancelOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const ok = window.confirm(
      `정말 이 주문을 "주문취소" 상태로 바꾸시겠어요?\n\n주문자: ${target.name}\n전화번호: ${target.phone}`
    );
    if (!ok) return;

    const next = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            status: "canceled",
          }
        : order
    );
    saveOrders(next);
  };

  // 주문 완전 삭제
  const handleDeleteOrder = (id) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const ok = window.confirm(
      `정말 이 주문을 목록에서 완전히 삭제할까요?\n\n주문자: ${target.name}\n전화번호: ${target.phone}`
    );
    if (!ok) return;

    const next = orders.filter((order) => order.id !== id);
    saveOrders(next);
  };

  // 엑셀에서 열 수 있는 CSV 다운로드
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("다운로드할 주문이 없습니다.");
      return;
    }

    const header = [
      "주문ID",
      "상태",
      "주문자",
      "전화번호",
      "요청사항",
      "주문시간",
    ];

    const rows = orders.map((o) => [
      // 숫자 그대로 두면 1.23E+12 같은 지수표기로 나오니 문자처럼 보이게
      `ID-${o.id}`,
      statusLabel(o.status),
      o.name,
      formatPhone(o.phone),
      o.memo || "",
      o.createdAt
        ? new Date(o.createdAt).toLocaleString("ko-KR")
        : "",
    ]);

    // 한국 엑셀이 좋아하는 세미콜론(;) 구분자 사용
    const csvLines = [header, ...rows].map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";")
    );

    const csvContent = csvLines.join("\r\n");

    // UTF-16 + BOM 으로 저장 → 엑셀 2016에서 한글 안 깨지게
    const bom = "\uFEFF";
    const blob = new Blob([bom, csvContent], {
      type: "text/csv;charset=utf-16le;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url
