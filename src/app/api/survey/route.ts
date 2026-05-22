import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("event_entries")
      .insert({
        survey: body,
        status: "survey_done",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { message: "설문 저장 실패", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      message: "설문 저장 완료",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "서버 오류", error: String(error) },
      { status: 500 }
    );
  }
}