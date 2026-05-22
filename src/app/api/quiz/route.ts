import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { entryId, quiz } = body;

    if (!entryId) {
      return NextResponse.json(
        { message: "entryId가 없습니다." },
        { status: 400 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        { message: "quiz 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("event_entries")
      .update({
        quiz,
        status: "quiz_done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (error) {
      return NextResponse.json(
        { message: "퀴즈 저장 실패", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "퀴즈 저장 완료",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "서버 오류", error: String(error) },
      { status: 500 }
    );
  }
}