import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Prize = {
  rank: string;
  name: string;
  description: string;
  probability: number;
  segmentIndex: number;
};

const prizes: Prize[] = [
  {
    rank: "1등",
    name: "공주 스페셜 굿즈",
    description: "공주의 매력을 담은 특별 굿즈를 받아가세요!",
    probability: 5,
    segmentIndex: 0,
  },
  {
    rank: "2등",
    name: "공주 여행 쿠폰",
    description: "공주 여행을 더 즐겁게 만들어줄 쿠폰이에요.",
    probability: 15,
    segmentIndex: 1,
  },
  {
    rank: "3등",
    name: "공주 기념 스티커",
    description: "귀여운 공주 팝업 기념 스티커를 드려요.",
    probability: 30,
    segmentIndex: 2,
  },
  {
    rank: "꽝",
    name: "아쉽지만 다음 기회에",
    description: "아쉽게도 이번에는 당첨되지 않았어요. 그래도 참여해주셔서 감사합니다!",
    probability: 50,
    segmentIndex: 3,
  },
];

function pickPrize() {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const prize of prizes) {
    cumulative += prize.probability;

    if (random <= cumulative) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}

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

    const selectedPrize = pickPrize();

    const prizeResult = {
      rank: selectedPrize.rank,
      name: selectedPrize.name,
      description: selectedPrize.description,
      segmentIndex: selectedPrize.segmentIndex,
      wonAt: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("event_entries")
      .update({
        prize: prizeResult,
        status: "prize_done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (error) {
      return NextResponse.json(
        { message: "룰렛 결과 저장 실패", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "룰렛 결과 저장 완료",
      prize: prizeResult,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "서버 오류", error: String(error) },
      { status: 500 }
    );
  }
}