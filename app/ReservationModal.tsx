"use client";

// 예약 신청 창(모달) — 강좌 이름과 날짜는 카드에서 받아 자동으로 채움
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ReservationModalProps {
  courseName: string;
  date: string;
  maxPeople: number; // 남은 좌석 수 (인원 입력 최대값)
  onClose: () => void;
}

export default function ReservationModal({
  courseName,
  date,
  maxPeople,
  onClose,
}: ReservationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Esc 키로 닫기 + 모달이 열려 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    if (!mounted) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose, isSubmitting]);

  // [신청] — /api/reserve 로 POST 전송
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!phone.trim()) {
      setError("연락처를 입력해 주세요.");
      return;
    }
    if (people < 1) {
      setError("인원은 1명 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: courseName,
          date,
          name: name.trim(),
          phone: phone.trim(),
          people,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "신청에 실패했습니다.");
      }

      const totalFormatted = (data.total || 0).toLocaleString("ko-KR");
      alert(
        `예약 신청이 완료되었습니다!\n\n• 강좌: ${courseName}\n• 일정: ${date}\n• 인원: ${people}명\n• 결제 금액: ${totalFormatted}원`
      );
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "신청 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none";
  const readOnlyClass =
    "h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-white/70";

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    // 바깥 어두운 배경 — 누르면 닫힘 (body 바로 아래에 그려서 다른 요소에 가려지지 않게)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
        className="w-full max-w-md rounded-2xl border border-gold/40 bg-[#11244d] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()} // 창 안을 눌러도 닫히지 않게
      >
        <h2 id="reservation-title" className="text-xl font-bold text-gold sm:text-2xl">
          예약 신청
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* 자동으로 채워지는 칸 */}
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            강좌
            <input type="text" value={courseName} readOnly className={readOnlyClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            날짜
            <input type="text" value={date} readOnly className={readOnlyClass} />
          </label>

          {/* 사용자가 입력하는 칸 */}
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              autoFocus
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            연락처
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            인원
            <input
              type="number"
              min={1}
              max={maxPeople}
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              inputMode="numeric"
              className={inputClass}
            />
          </label>

          {/* 오류 메시지 */}
          {error && (
            <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
              ⚠️ {error}
            </p>
          )}

          {/* 버튼 */}
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-xl bg-gold font-bold text-[#0b1a3a] transition-colors enabled:hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "신청 중..." : "신청"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-white/20 font-bold text-white/80 transition-colors enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

