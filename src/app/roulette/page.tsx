"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Prize = {
  rank: string;
  name: string;
  description: string;
  segmentIndex?: number;
  wonAt?: string;
};

type WheelSegment = {
  label: string;
  color: string;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
};

const wheelSegments: WheelSegment[] = [
  {
    label: "1등",
    color: "#FDBA74",
    startAngle: 0,
    endAngle: 90,
    centerAngle: 45,
  },
  {
    label: "2등",
    color: "#BFDBFE",
    startAngle: 90,
    endAngle: 180,
    centerAngle: 135,
  },
  {
    label: "3등",
    color: "#FDE68A",
    startAngle: 180,
    endAngle: 270,
    centerAngle: 225,
  },
  {
    label: "꽝",
    color: "#BBF7D0",
    startAngle: 270,
    endAngle: 360,
    centerAngle: 315,
  },
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.sin(angleInRadians),
    y: centerY - radius * Math.cos(angleInRadians),
  };
}

function describeSlice(startAngle: number, endAngle: number) {
  const centerX = 144;
  const centerY = 144;
  const radius = 136;

  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function RoulettePage() {
  const router = useRouter();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  const handleSpin = async () => {
    if (isSpinning) return;

    const entryId = localStorage.getItem("gongju-popup-entry-id");

    if (!entryId) {
      alert("참여 정보가 없습니다. 처음부터 다시 참여해주세요.");
      router.push("/");
      return;
    }

    setIsSpinning(true);
    setSelectedPrize(null);

    try {
      const response = await fetch("/api/prize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("룰렛 결과 저장 중 오류가 발생했습니다.");
        console.error(result);
        setIsSpinning(false);
        return;
      }

      const prize = result.prize as Prize;

      const segmentIndex = prize.segmentIndex ?? 0;
      const segmentSize = 90;
      const segmentCenterAngle = segmentIndex * segmentSize + segmentSize / 2;

      const currentRotation = ((rotation % 360) + 360) % 360;
      const targetRotation = (360 - segmentCenterAngle) % 360;
      const extraRotation = (targetRotation - currentRotation + 360) % 360;

      const finalRotation = rotation + 360 * 5 + extraRotation;

      setRotation(finalRotation);

      setTimeout(() => {
        localStorage.setItem("gongju-popup-prize", JSON.stringify(prize));
        setSelectedPrize(prize);
        setIsSpinning(false);
      }, 2800);
    } catch (error) {
      alert("룰렛 처리 중 오류가 발생했습니다.");
      console.error(error);
      setIsSpinning(false);
    }
  };

  const goToPrizePage = () => {
    router.push("/prize");
  };

  return (
    <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-3xl bg-white p-6 text-center shadow-md">
          <p className="mb-2 text-sm font-bold text-orange-500">
            룰렛 이벤트
          </p>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            룰렛을 돌려 선물을 확인해보세요!
          </h1>

          <p className="text-sm leading-relaxed text-gray-600">
            설문과 퀴즈 미션을 완료했어요.
            <br />
            이제 마지막으로 룰렛 이벤트에 참여해보세요.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-md">
          <div className="mb-6 flex justify-center">
            <div className="relative h-72 w-72">
              <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 text-4xl text-orange-500">
                ▼
              </div>

              <svg
                viewBox="0 0 288 288"
                className="h-full w-full drop-shadow-lg transition-transform duration-[2800ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="#FDBA74"
                />

                {wheelSegments.map((segment) => {
                  const labelPosition = polarToCartesian(
                    144,
                    144,
                    88,
                    segment.centerAngle
                  );

                  return (
                    <g key={segment.label}>
                      <path
                        d={describeSlice(
                          segment.startAngle,
                          segment.endAngle
                        )}
                        fill={segment.color}
                        stroke="#ffffff"
                        strokeWidth="3"
                      />

                      <text
                        x={labelPosition.x}
                        y={labelPosition.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="18"
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        {segment.label}
                      </text>
                    </g>
                  );
                })}

                <circle
                  cx="144"
                  cy="144"
                  r="52"
                  fill="#ffffff"
                  stroke="#FDBA74"
                  strokeWidth="4"
                />

                <text
                  x="144"
                  y="136"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="800"
                  fill="#F97316"
                >
                  공주
                </text>

                <text
                  x="144"
                  y="158"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="800"
                  fill="#F97316"
                >
                  룰렛
                </text>
              </svg>
            </div>
          </div>

          {!selectedPrize && (
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full rounded-full py-4 text-lg font-bold text-white transition ${
                isSpinning ? "bg-gray-300" : "bg-orange-400"
              }`}
            >
              {isSpinning ? "룰렛 돌아가는 중..." : "룰렛 돌리기"}
            </button>
          )}

          {selectedPrize && (
            <div className="text-center">
              <div className="mb-4 rounded-3xl bg-orange-50 p-5">
                <p className="mb-2 text-sm font-bold text-orange-500">
                  결과
                </p>

                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {selectedPrize.rank === "꽝"
                    ? "아쉽지만 꽝!"
                    : `${selectedPrize.rank} 당첨!`}
                </h2>

                <p className="mb-2 font-bold text-gray-800">
                  {selectedPrize.name}
                </p>

                <p className="text-sm leading-relaxed text-gray-600">
                  {selectedPrize.description}
                </p>
              </div>

              <button
                type="button"
                onClick={goToPrizePage}
                className="w-full rounded-full bg-orange-400 py-4 text-lg font-bold text-white"
              >
                결과 확인하기
              </button>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-gray-400">
          실제 운영 시 룰렛 당첨 결과는 서버에서 저장되도록 구성하는 것이
          안전합니다.
        </p>
      </section>
    </main>
  );
}