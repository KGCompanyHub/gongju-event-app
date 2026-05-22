import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const adminPassword = request.headers.get("x-admin-password");

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "관리자 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("event_entries")
    .select("id, created_at, survey, quiz, prize, status")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "데이터 조회 실패", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    entries: data,
  });
}