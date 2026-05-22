"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PrizeResult = {
  rank: string;
  name: string;
  description: string;
  wonAt: string;
};

export default function PrizePage() {
  const [prize, setPrize] = useState<PrizeResult | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const savedPrize = localStorage.getItem("gongju-popup-prize");

    if (savedPrize) {
      setPrize(JSON.parse(savedPrize));
    }
  }, []);

  const saveScreenshot = async () => {
    if (!captureRef.current) {
      alert("저장할 결과 화면을 찾지 못했습니다.");
      return;
    }

    try {
      setIsCapturing(true);

      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#FFF7E8",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("이미지 생성에 실패했습니다.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `gongju-prize-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error(error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsCapturing(false);
    }
  };

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
    <>
      {/* 캡처 전용 숨김 카드 */}
      <div
        ref={captureRef}
        style={{
          position: "fixed",
          left: "-10000px",
          top: "0px",
          width: "390px",
          padding: "20px",
          backgroundColor: "#FFF7E8",
          color: "#111827",
          fontFamily: "Arial, Apple SD Gothic Neo, Malgun Gothic, sans-serif",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            padding: "28px 22px",
            textAlign: "center",
            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={
                prize.rank === "꽝"
                  ? "/images/prize-fail.gif"
                  : "/images/prize-win.gif"
              }
              alt={prize.rank === "꽝" ? "아쉬운 결과" : "당첨 축하"}
              style={{
                width: "128px",
                height: "128px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <p
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              fontWeight: 900,
              color: "#f97316",
            }}
          >
            공주팝업행사 이벤트 당첨
          </p>

          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "30px",
              lineHeight: 1.25,
              fontWeight: 900,
              color: "#111827",
            }}
          >
            {prize.rank === "꽝" ? "아쉽지만 꽝!" : `${prize.rank} 당첨!`}
          </h1>

          <div
            style={{
              marginBottom: "24px",
              borderRadius: "24px",
              backgroundColor: "#fff7ed",
              padding: "20px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "20px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              {prize.name}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#4b5563",
              }}
            >
              {prize.description}
            </p>
          </div>

          <div
            style={{
              border: "1px dashed #fdba74",
              borderRadius: "16px",
              padding: "16px",
              backgroundColor: "#ffffff",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "13px",
                fontWeight: 900,
                color: "#f97316",
              }}
            >
              당첨 화면을 저장해 주세요.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#4b5563",
              }}
            >
              공주문화관광재단 인스타그램 팔로우 후,
              <br />
              DM으로 보내주시면 확인해드립니다.
            </p>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
        <section className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-7 text-center shadow-md">
            <div className="mb-5 flex justify-center">
              <img
                src={
                  prize.rank === "꽝"
                    ? "/images/prize-fail.gif"
                    : "/images/prize-win.gif"
                }
                alt={prize.rank === "꽝" ? "아쉬운 결과" : "당첨 축하"}
                className="h-32 w-32 object-contain"
              />
            </div>

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
                당첨 화면을 저장해 주세요.
              </p>

              <p className="text-sm leading-relaxed text-gray-600">
                공주문화관광재단 인스타그램 팔로우 후,
                <br />
                DM으로 보내주시면 확인해드립니다.
              </p>
            </div>

            <button
              type="button"
              onClick={saveScreenshot}
              disabled={isCapturing}
              className="mb-3 flex w-full touch-manipulation items-center justify-center rounded-full bg-[#632713] py-4 text-lg font-bold text-white shadow-md transition hover:bg-[#4f1f0f] active:scale-[0.99] disabled:bg-gray-300"
            >
              {isCapturing ? "이미지 저장 중..." : "결과 이미지 저장하기"}
            </button>

            <a
              href="https://www.instagram.com/gjcf_2020/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-orange-400 py-4 text-lg font-bold text-white shadow-md transition hover:bg-orange-500"
            >
              공주문화관광재단 인스타 바로가기
            </a>
          </div>
        </section>
      </main>
    </>
  );
}