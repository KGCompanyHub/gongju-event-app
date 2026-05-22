"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  description: string;
};

const quizzes: Quiz[] = [
  {
    id: "q1",
    question: "공주는 어느 시대의 역사와 문화로 잘 알려져 있을까요?",
    options: ["신라", "백제", "고려", "조선"],
    answer: "백제",
    description:
      "공주는 백제의 역사와 문화를 품고 있는 도시로, 무령왕릉과 공산성 등 다양한 문화유산을 만날 수 있어요.",
  },
  {
    id: "q2",
    question: "공주의 대표적인 역사 유적지 중 하나는 무엇일까요?",
    options: ["공산성", "경복궁", "첨성대", "수원화성"],
    answer: "공산성",
    description:
      "공산성은 공주를 대표하는 백제 역사유적으로, 공주의 풍경과 역사를 함께 느낄 수 있는 장소예요.",
  },
  {
    id: "q3",
    question: "공주를 떠올리게 하는 대표적인 특산물은 무엇일까요?",
    options: ["밤", "감귤", "대게", "한라봉"],
    answer: "밤",
    description:
      "공주는 밤으로도 유명해요. 공주 여행에서는 밤을 활용한 간식과 디저트도 즐길 수 있어요.",
  },
  {
    id: "q4",
    question: "공주 여행에서 즐길 수 있는 매력으로 가장 어울리는 것은?",
    options: [
      "역사와 문화 체험",
      "스키장 투어",
      "해수욕장 물놀이",
      "대형 놀이공원만 즐기기",
    ],
    answer: "역사와 문화 체험",
    description:
      "공주는 백제문화, 한옥, 자연, 감성 카페, 축제까지 함께 즐길 수 있는 여행지예요.",
  },
];

export default function QuizPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuiz = quizzes[currentIndex];
  const selectedAnswer = selectedAnswers[currentQuiz.id];

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuiz.id]: option,
    }));

    setIsAnswered(true);
  };

    const handleNext = async () => {
    if (currentIndex < quizzes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsAnswered(false);
        return;
    }

    const correctCount = quizzes.filter(
        (quiz) => selectedAnswers[quiz.id] === quiz.answer
    ).length;

    const quizResult = {
        selectedAnswers,
        correctCount,
        totalCount: quizzes.length,
        submittedAt: new Date().toISOString(),
    };

    const entryId = localStorage.getItem("gongju-popup-entry-id");

    if (!entryId) {
        alert("설문 저장 정보가 없습니다. 처음부터 다시 참여해주세요.");
        router.push("/");
        return;
    }

    const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        entryId,
        quiz: quizResult,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        alert("퀴즈 결과 저장 중 오류가 발생했습니다.");
        console.error(result);
        return;
    }

    localStorage.setItem("gongju-popup-quiz", JSON.stringify(quizResult));

    router.push("/roulette");
    };

  return (
    <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-md">
          <p className="mb-2 text-sm font-bold text-orange-500">
            공주 알아가기 퀴즈
          </p>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            답을 고르며 공주의 매력을 알아보세요!
          </h1>

          <p className="text-sm leading-relaxed text-gray-600">
            정답을 맞히는 것보다, 공주에 대해 자연스럽게 알아가는 것이
            목적이에요.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-bold text-orange-500">
            QUESTION {currentIndex + 1}
          </span>

          <span className="text-gray-500">
            {currentIndex + 1} / {quizzes.length}
          </span>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-xl font-bold leading-relaxed text-gray-900">
            {currentQuiz.question}
          </h2>

          <div className="space-y-3">
            {currentQuiz.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = currentQuiz.answer === option;

              let buttonStyle = "border-orange-200 bg-white text-gray-700";

              if (isAnswered && isCorrectAnswer) {
                buttonStyle = "border-green-400 bg-green-100 text-green-700";
              }

              if (isAnswered && isSelected && !isCorrectAnswer) {
                buttonStyle = "border-red-300 bg-red-100 text-red-600";
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${buttonStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 rounded-2xl bg-orange-50 p-4">
              <p className="mb-2 font-bold text-orange-600">
                {selectedAnswer === currentQuiz.answer
                  ? "정답이에요!"
                  : "괜찮아요, 이렇게 알아가면 돼요!"}
              </p>

              <p className="text-sm leading-relaxed text-gray-700">
                {currentQuiz.description}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered}
          className={`mt-6 w-full rounded-full py-4 text-lg font-bold text-white transition ${
            isAnswered ? "bg-orange-400" : "bg-gray-300"
          }`}
        >
          {currentIndex < quizzes.length - 1 ? "다음 문제" : "룰렛 참여하기"}
        </button>
      </section>
    </main>
  );
}