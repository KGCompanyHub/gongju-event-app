"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  title: string;
  options: string[];
  multiple?: boolean;
};

const questions: Question[] = [
  {
    id: "gender",
    title: "성별",
    options: ["남성", "여성"],
  },
  {
    id: "age",
    title: "당신의 연령대를 체크해주세요.",
    options: [
      "20대 미만",
      "20~29세",
      "30~39세",
      "40~49세",
      "50~59세",
      "60세 이상",
    ],
  },
  {
    id: "job",
    title: "당신의 직업군을 체크해주세요.",
    options: ["학생", "직장인", "자영업자", "기타"],
  },
  {
    id: "route",
    title: "공주를 어떻게 알게 되셨나요?",
    options: [
      "직접 방문",
      "내 고향 혹은 고향 인접",
      "공주시 관광홈페이지",
      "대한민국 구석구석",
      "인스타그램",
      "페이스북",
    ],
  },
  {
    id: "purpose",
    title: "이곳의 방문 목적은 무엇인가요?",
    options: [
      "행사 체험을 해보고싶어서",
      "공주에 대한 호기심",
      "친구 / 지인들과 휴식, 모임을 위해",
      "관광 / 어떤 공간인지 알고 싶어서",
      "쇼핑",
      "기타",
    ],
  },
  {
    id: "knowledge",
    title: "공주를 얼마나 알고 계신가요?",
    options: [
      "매우 잘 알고 있다",
      "어느 정도 알고 있다",
      "이름만 들어봤다",
      "잘 모른다",
    ],
  },
  {
    id: "firstImage",
    title: "공주를 떠올렸을 때 가장 먼저 생각나는 것은 무엇인가요?",
    options: [
      "백제문화",
      "공산성",
      "밤 / 한옥 / 전통문화",
      "자연 / 힐링 여행",
      "축제 및 행사",
      "맛집 / 카페",
      "기타",
    ],
  },
  {
    id: "visitExperience",
    title: "공주를 방문해 본 적이 있나요?",
    options: [
      "최근 1년 이내 방문",
      "방문 경험 있음(1년 이상 전)",
      "방문한 적 없음",
    ],
  },
  {
    id: "satisfaction",
    title: "공주를 방문했다면 가장 만족했던 부분은 무엇이었나요?",
    multiple: true,
    options: [
      "역사 / 문화유산",
      "자연 경관",
      "음식",
      "카페 및 감성 공간",
      "축제, 체험 프로그램",
      "사진 촬영 명소",
      "기억나는 것이 없다",
      "방문 경험 없음",
    ],
  },
  {
    id: "revisit",
    title: "앞으로 공주를 방문할 의향이 있으신가요?",
    options: [
      "매우 있다",
      "어느정도 있다",
      "보통이다",
      "별로 없다",
      "전혀 없다",
    ],
  },
];

export default function SurveyPage() {
  const router = useRouter();

  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  const [multipleAnswers, setMultipleAnswers] = useState<
    Record<string, string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectSingleAnswer = (questionId: string, option: string) => {
    setSingleAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const toggleMultipleAnswer = (questionId: string, option: string) => {
    setMultipleAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const isSelected = currentAnswers.includes(option);

      return {
        ...prev,
        [questionId]: isSelected
          ? currentAnswers.filter((item) => item !== option)
          : [...currentAnswers, option],
      };
    });
  };

  const isAnswered = (question: Question) => {
    if (question.multiple) {
      return (multipleAnswers[question.id] || []).length > 0;
    }

    return Boolean(singleAnswers[question.id]);
  };

  const isAllAnswered = questions.every(isAnswered);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!isAllAnswered) {
      alert("모든 설문 문항에 답변해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const surveyData = {
        singleAnswers,
        multipleAnswers,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("설문 저장 중 오류가 발생했습니다.");
        console.error(result);
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("gongju-popup-entry-id", result.id);
      localStorage.setItem("gongju-popup-survey", JSON.stringify(surveyData));

      router.push("/quiz");
    } catch (error) {
      alert("설문 저장 중 오류가 발생했습니다.");
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
    <main
      className="min-h-screen bg-[#FFF7E8] px-5 py-8"
      style={{
        position: "relative",
        isolation: "isolate",
        touchAction: "auto",
      }}
    >
      <section
        className="mx-auto w-full max-w-md"
        style={{
          position: "relative",
          zIndex: 9999,
        }}
      >
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-md">
          <p className="mb-2 text-sm font-bold text-orange-500">
            공주팝업행사 웹앱 설문조사
          </p>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            공주 여행 미션에 참여해보세요!
          </h1>

          <p className="text-sm leading-relaxed text-gray-600">
            간단한 설문을 통해 공주에 대한 관심도와 여행 취향을 확인하고,
            이어지는 퀴즈와 룰렛 이벤트에 참여할 수 있어요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{
            position: "relative",
            zIndex: 99999,
            pointerEvents: "auto",
          }}
        >
          {questions.map((question, questionIndex) => {
            return (
              <div
                key={question.id}
                className="relative z-30 rounded-3xl bg-white p-5 shadow-md"
              >
                <div className="mb-4">
                  <p className="mb-1 text-xs font-bold text-orange-400">
                    QUESTION {questionIndex + 1}
                  </p>

                  <h2 className="font-bold leading-relaxed text-gray-900">
                    {questionIndex + 1}. {question.title}
                  </h2>

                  {question.multiple && (
                    <p className="mt-2 text-xs text-orange-500">
                      복수 선택 가능
                    </p>
                  )}
                </div>

                <div className="relative z-30 space-y-3">
                  {question.options.map((option) => {
                    const isSelected = question.multiple
                      ? (multipleAnswers[question.id] || []).includes(option)
                      : singleAnswers[question.id] === option;

                    return (
                      <button
                        style={{
                          position: "relative",
                          zIndex: 999999,
                          pointerEvents: "auto",
                          touchAction: "manipulation",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        key={option}
                        type="button"
                        onClick={() =>
                          question.multiple
                            ? toggleMultipleAnswer(question.id, option)
                            : selectSingleAnswer(question.id, option)
                        }
                        onTouchStart={() => {}}
                        className={`relative z-30 block w-full cursor-pointer touch-manipulation select-none rounded-2xl border px-4 py-4 text-left text-base transition active:scale-[0.99] ${
                          isSelected
                            ? "border-orange-400 bg-orange-100 font-bold text-orange-700"
                            : "border-orange-200 bg-white text-gray-700"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="relative z-30 rounded-3xl bg-white p-6 text-center shadow-md">
            <div className="mb-4 flex justify-center">
              <img
                src="/images/icon_on_x3.png"
                alt="설문 완료 이미지"
                className="h-24 w-24 object-contain"
              />
            </div>
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              설문 참여 미션 성공!
            </h2>

            <p className="text-sm leading-relaxed text-gray-600">
              남겨주신 의견은 공주의 즐거운 여행 콘텐츠를 만드는데 큰 힘이 됩니다.
              <br />
              행복하세요~!
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative z-30 w-full cursor-pointer touch-manipulation rounded-full py-4 text-lg font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed ${
              isAllAnswered && !isSubmitting ? "bg-orange-400" : "bg-gray-300"
            }`}
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </section>
    </main>
    </>
  );
}