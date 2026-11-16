import { NextResponse } from "next/server";
import { courses } from "@/data/courses";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, course, name, phone, people } = body;

    // 1. 필수 입력값 검증
    if (!name || !phone || !people || !course) {
      return NextResponse.json(
        { error: "이름, 연락처, 인원, 강좌 정보를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    const count = Number(people);
    if (isNaN(count) || count < 1) {
      return NextResponse.json(
        { error: "인원은 1명 이상의 숫자로 입력해 주세요." },
        { status: 400 }
      );
    }

    // 2. 강좌 데이터에서 수강료를 찾아 서버에서 직접 결제 금액(total) 계산
    const matchedCourse = courses.find(
      (c) => c.name === course || String(c.id) === String(course)
    );

    if (!matchedCourse) {
      return NextResponse.json(
        { error: "해당 강좌를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const total = matchedCourse.price * count;
    const courseName = matchedCourse.name;
    const courseDate = date || matchedCourse.date;

    // 3. .env에서 구글 시트 웹앱 URL 가져오기 (브라우저에 절대 노출되지 않음)
    const sheetUrl = process.env.SHEET_URL?.trim();
    if (!sheetUrl) {
      return NextResponse.json(
        { error: "서버에 구글 시트 주소(SHEET_URL)가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 4. 구글 시트(Apps Script)로 { date, course, name, phone, people, total } 전송
    const payload = {
      date: courseDate,
      course: courseName,
      name: String(name).trim(),
      phone: String(phone).trim(),
      people: count,
      total,
    };

    const sheetRes = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!sheetRes.ok) {
      const errText = await sheetRes.text().catch(() => "");
      console.error("구글 시트 전송 실패:", sheetRes.status, errText);
      return NextResponse.json(
        { error: "구글 시트에 예약을 저장하지 못했습니다." },
        { status: 502 }
      );
    }

    let resultData: Record<string, unknown> = {};
    try {
      resultData = await sheetRes.json();
    } catch {
      resultData = { result: "ok" };
    }

    return NextResponse.json({
      ok: true,
      result: "ok",
      total,
      data: resultData,
    });
  } catch (error: unknown) {
    console.error("예약 처리 중 오류:", error);
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
