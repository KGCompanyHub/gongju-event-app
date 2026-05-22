import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF7E8] flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg text-center">
        <div className="text-6xl mb-5">🐻</div>

        <p className="text-sm font-bold text-orange-500 mb-2">
          공주팝업행사 웹앱 설문조사
        </p>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          공주 여행 미션 시작!
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          간단한 설문에 참여하고,
          공주 퀴즈와 룰렛 이벤트까지 함께 즐겨보세요.
        </p>

        <Link
          href="/survey"
          className="block w-full rounded-full bg-orange-400 py-4 text-white font-bold text-lg"
        >
          참여하기
        </Link>
      </section>
    </main>
  );
}