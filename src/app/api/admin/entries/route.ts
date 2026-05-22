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

  const { data: entries, error: entriesError } = await supabaseAdmin
    .from("event_entries")
    .select("id, created_at, survey, quiz, prize, status")
    .order("created_at", { ascending: false });

  if (entriesError) {
    return NextResponse.json(
      { message: "참여자 데이터 조회 실패", error: entriesError.message },
      { status: 500 }
    );
  }

  const { data: inventory, error: inventoryError } = await supabaseAdmin
    .from("prize_inventory_daily")
    .select(
      "event_date, event_start_at, event_end_at, rank, name, limit_count, issued_count, sort_order"
    )
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });

  if (inventoryError) {
    return NextResponse.json(
      { message: "경품 수량 조회 실패", error: inventoryError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    entries: entries || [],
    inventory: inventory || [],
  });
}