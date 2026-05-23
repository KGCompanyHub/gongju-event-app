import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DrawPrizeResult = {
  rank: string;
  name: string;
  description: string;
  segment_index: number;
  center_angle: number;
  won_at: string;
  event_date: string;
  issued_count: number | null;
  limit_count: number | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json(
        { message: "entryId가 없습니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .rpc("draw_prize_for_entry", {
        entry_id: entryId,
      })
      .single<DrawPrizeResult>();

    if (error || !data) {
      return NextResponse.json(
        {
          message: "룰렛 결과 저장 실패",
          error: error?.message || "룰렛 결과 데이터가 없습니다.",
        },
        { status: 500 }
      );
    }

    const prizeResult = {
      rank: data.rank,
      name: data.name,
      description: data.description,
      segmentIndex: data.segment_index,
      centerAngle: Number(data.center_angle),
      eventDate: data.event_date,
      wonAt: data.won_at || new Date().toISOString(),
    };

    return NextResponse.json({
      message: "룰렛 결과 저장 완료",
      prize: prizeResult,
      inventory: {
        issuedCount: data.issued_count,
        limitCount: data.limit_count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "서버 오류", error: String(error) },
      { status: 500 }
    );
  }
}