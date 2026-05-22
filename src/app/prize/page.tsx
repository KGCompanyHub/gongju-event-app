"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PrizeResult = {
  rank: string;
  name: string;
  description: string;
  wonAt: string;
};

export default function PrizePage() {
  const [prize, setPrize] = useState<PrizeResult | null>(null);

  useEffect(() => {
    const savedPrize = localStorage.getItem("gongju-popup-prize");

    if (savedPrize) {
      setPrize(JSON.parse(savedPrize));
    }
  }, []);

  if (!prize) {
    return (
      <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
        <section className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
          <div className="rounded-3xl bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-5xl">🎁</div>

            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              아직 당첨 결과가 없어요
            </h1>

            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              룰렛 이벤트에 먼저 참여해주세요.
            </p>

            <Link
              href="/roulette"
              className="block w-full rounded-full bg-orange-400 px-8 py-4 font-bold text-white"
            >
              룰렛으로 이동하기
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-7 text-center shadow-md">
          <div className="mb-5 text-6xl">🎉</div>

          <p className="mb-2 text-sm font-bold text-orange-500">
            공주팝업행사 이벤트 당첨
          </p>

          <h1 className="mb-4 text-3xl font-bold text-gray-900">
          {prize.rank === "꽝" ? "아쉽지만 꽝!" : `${prize.rank} 당첨!`}
          </h1>

          <div className="mb-6 rounded-3xl bg-orange-50 p-5">
            <p className="mb-2 text-xl font-bold text-gray-900">
              {prize.name}
            </p>

            <p className="text-sm leading-relaxed text-gray-600">
              {prize.description}
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-dashed border-orange-300 p-4">
            <p className="mb-1 text-xs font-bold text-orange-500">
              현장 스태프 확인용
            </p>

            <p className="text-sm text-gray-600">
              이 화면을 캡처하거나 현장에서 보여주세요.
            </p>
          </div>

          <Link
            href="/"
            className="block w-full rounded-full bg-orange-400 py-4 text-lg font-bold text-white"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}