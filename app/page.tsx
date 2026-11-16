"use client";

// 첫 화면 (주소: /) — 스킬투머니 강좌 목록
import { useState } from "react";
import { courses } from "@/data/courses";
import ReservationModal from "./ReservationModal";

export interface Course {
  id: string | number;
  name: string;
  price: number;
  seat: number;
  booked: number;
  date: string;
  tags: string[];
}

// 35000 → "35,000원"
function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

// 남은 좌석에 따른 상태: 0석 = 마감, 1~2석 = 마감 임박, 그 외 = 여유
function getSeatStatus(remaining: number) {
  if (remaining <= 0) return "soldOut";
  if (remaining <= 2) return "almostFull";
  return "available";
}

export default function Home() {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  // 예약 창을 연 강좌 (null이면 창이 닫힌 상태)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 체크 시 남은 좌석(정원 - 예약)이 1석 이상인 강좌만 필터링
  const displayedCourses = onlyAvailable
    ? courses.filter((course: Course) => course.seat - course.booked > 0)
    : courses;

  return (
    <main className="relative flex flex-1 justify-center overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
      {/* 배경의 은은한 빛 번짐 효과 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative w-full max-w-5xl">
        {/* 머리말 */}
        <header className="fade-up flex flex-col items-center text-center">
          <span className="mb-5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-medium tracking-widest text-gold sm:text-sm">
            ONE-DAY CLASS
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            스킬투머니
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-xl">
            배운 기술이 돈이 되는 원데이 클래스
          </p>
        </header>

        {/* 강좌 목록 */}
        <section aria-labelledby="course-list-title" className="mt-14 sm:mt-20">
          {/* 강좌 목록 제목 & 예약 가능 필터 체크박스 */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="course-list-title"
              className="text-lg font-bold text-white sm:text-xl"
            >
              강좌 목록
            </h2>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-white/80 select-none transition-colors hover:text-white">
              <input
                type="checkbox"
                id="only-available-filter"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-white/10 accent-gold transition focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              <span>예약 가능한 강좌만 보기</span>
            </label>
          </div>

          {displayedCourses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-white/60">
              현재 예약 가능한 강좌가 없습니다.
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCourses.map((course: Course, index: number) => {
                const remaining = course.seat - course.booked;
                const status = getSeatStatus(remaining);
                const isSoldOut = status === "soldOut";

                return (
                  <li
                    key={course.id}
                    className="fade-up"
                    style={{ animationDelay: `${150 + index * 100}ms` }}
                  >
                    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.08] sm:p-7">
                      {/* 강좌 이름 + 상태 표시 */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold text-white sm:text-2xl">
                          {course.name}
                        </h3>

                        {isSoldOut && (
                          <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white/70">
                            마감
                          </span>
                        )}
                        {status === "almostFull" && (
                          <span className="shrink-0 rounded-full border border-red-400/50 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                            마감 임박
                          </span>
                        )}
                      </div>

                      {/* 강좌 이름 아래의 작은 배지들 */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {course.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-light"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 수강료 */}
                      <p className="mt-4 text-sm text-white/60">
                        수강료{" "}
                        <span className="ml-1 text-2xl font-black text-gold">
                          {formatPrice(course.price)}
                        </span>
                      </p>

                      {/* 좌석 현황: 남은 좌석 = 정원 - 예약 */}
                      <p className="mt-2 text-sm text-white/60">
                        남은 좌석{" "}
                        <span
                          className={`font-bold ${status === "almostFull" ? "text-red-400" : "text-white"}`}
                        >
                          {remaining}석
                        </span>{" "}
                        / 정원 {course.seat}명
                      </p>

                      {/* 일시 */}
                      {course.date && (
                        <p className="mt-1 text-sm text-white/60">
                          📅 일정{" "}
                          <span className="font-medium text-white/80">
                            {course.date}
                          </span>
                        </p>
                      )}

                      {/* 예약 버튼: 누르면 예약 신청 창이 열림. 마감이면 누를 수 없음 */}
                      <button
                        type="button"
                        id={`reserve-${course.id}`}
                        disabled={isSoldOut}
                        onClick={() => setSelectedCourse(course)}
                        className="mt-8 h-12 w-full rounded-xl bg-gold font-bold text-[#0b1a3a] transition-colors enabled:hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                      >
                        {isSoldOut ? "예약 마감" : "예약하기"}
                      </button>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* 예약 신청 창 */}
      {selectedCourse && (
        <ReservationModal
          courseName={selectedCourse.name}
          date={selectedCourse.date}
          maxPeople={selectedCourse.seat - selectedCourse.booked}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </main>
  );
}
