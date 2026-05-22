"use client";

import { useState } from "react";

type EventEntry = {
  id: string;
  created_at: string;
  status: string;
  survey: {
    singleAnswers?: Record<string, string>;
    multipleAnswers?: Record<string, string[]>;
  } | null;
  quiz: {
    correctCount?: number;
    totalCount?: number;
  } | null;
  prize: {
    rank?: string;
    name?: string;
    description?: string;
  } | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEntries = async () => {
    const response = await fetch("/api/admin/entries", {
      headers: {
        "x-admin-password": password,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "관리자 조회 실패");
      return;
    }

    setEntries(result.entries);
    setIsLoaded(true);
  };

  const totalCount = entries.length;
  
  const csvSafe = (value: unknown) => {
    if (value === null || value === undefined) {
      return '""';
    }

    const text = Array.isArray(value) ? value.join(", ") : String(value);

    return `"${text.replaceAll('"', '""')}"`;
  };

  const downloadExcel = () => {
    const headers = [
      "참여일시",
      "성별",
      "연령대",
      "직업군",
      "행사 인지 경로",
      "방문 목적",
      "공주 인지도",
      "공주를 떠올렸을 때 먼저 생각나는 것",
      "방문 경험",
      "만족했던 부분",
      "방문 의향",
      "퀴즈 점수",
      "퀴즈 정답 수",
      "퀴즈 전체 문항 수",
      "당첨 등급",
      "당첨 상품",
      "상태",
    ];

    const rows = entries.map((entry) => {
      const single = entry.survey?.singleAnswers || {};
      const multiple = entry.survey?.multipleAnswers || {};
      const satisfaction = multiple.satisfaction || [];

      return [
        new Date(entry.created_at).toLocaleString(),
        single.gender || "",
        single.age || "",
        single.job || "",
        single.route || "",
        single.purpose || "",
        single.knowledge || "",
        single.firstImage || "",
        single.visitExperience || "",
        satisfaction.join(", "),
        single.revisit || "",
        entry.quiz
          ? `${entry.quiz.correctCount || 0} / ${entry.quiz.totalCount || 0}`
          : "",
        entry.quiz?.correctCount ?? "",
        entry.quiz?.totalCount ?? "",
        entry.prize?.rank || "",
        entry.prize?.name || "",
        getStatusLabel(entry.status),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvSafe).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `gongju-popup-data-${today}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const completedSurveyCount = entries.filter(
    (entry) => entry.survey
  ).length;

  const prizeCount = entries.filter(
    (entry) => entry.prize
  ).length;
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      survey_done: "설문 완료",
      quiz_done: "퀴즈 완료",
      prize_done: "룰렛 완료",
      coupon_used: "경품 수령 완료",
    };

    return statusMap[status] || status;
  };
  return (
    
    <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-md">
          <p className="mb-2 text-sm font-bold text-orange-500">
            공주팝업행사 관리자
          </p>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            참여 현황 대시보드
          </h1>

          <p className="text-sm text-gray-600">
            설문 참여자, 퀴즈 진행, 룰렛 당첨 현황을 확인할 수 있습니다.
          </p>
        </div>

        {!isLoaded && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-md">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              관리자 비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mb-4 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none"
              placeholder="비밀번호를 입력하세요"
            />

            <button
              type="button"
              onClick={loadEntries}
              className="w-full rounded-full bg-orange-400 py-4 font-bold text-white"
            >
              관리자 데이터 보기
            </button>
          </div>
        )}

        {isLoaded && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">전체 참여 수</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">설문 완료 수</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {completedSurveyCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">룰렛 참여 수</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {prizeCount}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="border-b border-gray-100 p-5">
                <h2 className="font-bold text-gray-900">
                  참여자 목록
                </h2>

                <button
                  type="button"
                  onClick={downloadExcel}
                  style={{
                    backgroundColor: "#f97316",
                    color: "#ffffff",
                    border: "2px solid #c2410c",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: 900,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
                    cursor: "pointer",
                  }}
                >
                엑셀 다운로드
              </button>
              </div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-md"></div>   
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1800px] text-left text-sm">
                  <thead className="bg-orange-100 text-sm font-bold text-gray-900">
                    <tr>
                      <th className="px-4 py-3">참여일시</th>
                      <th className="px-4 py-3">성별</th>
                      <th className="px-4 py-3">연령대</th>
                      <th className="px-4 py-3">직업군</th>
                      <th className="px-4 py-3">행사 인지 경로</th>
                      <th className="px-4 py-3">방문 목적</th>
                      <th className="px-4 py-3">공주 인지도</th>
                      <th className="px-4 py-3">먼저 떠오르는 것</th>
                      <th className="px-4 py-3">방문 경험</th>
                      <th className="px-4 py-3">만족했던 부분</th>
                      <th className="px-4 py-3">방문 의향</th>
                      <th className="px-4 py-3">퀴즈 점수</th>
                      <th className="px-4 py-3">당첨</th>
                      <th className="px-4 py-3">상태</th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-900">
                    {entries.map((entry) => {
                      const single = entry.survey?.singleAnswers || {};
                      const multiple = entry.survey?.multipleAnswers || {};
                      const satisfaction = multiple.satisfaction || [];

                      return (
                        <tr
                          key={entry.id}
                          className="border-t border-gray-200 bg-white hover:bg-orange-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.gender || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.age || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.job || "-"}
                          </td>

                          <td className="min-w-[220px] px-4 py-4 font-bold text-gray-900">
                            {single.route || "-"}
                          </td>

                          <td className="min-w-[220px] px-4 py-4 font-bold text-gray-900">
                            {single.purpose || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.knowledge || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.firstImage || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.visitExperience || "-"}
                          </td>

                          <td className="min-w-[240px] px-4 py-4 font-bold text-gray-900">
                            {satisfaction.length > 0 ? satisfaction.join(", ") : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {single.revisit || "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {entry.quiz
                              ? `${entry.quiz.correctCount || 0} / ${
                                  entry.quiz.totalCount || 0
                                }`
                              : "-"}
                          </td>

                          <td className="min-w-[180px] px-4 py-4 font-bold text-orange-600">
                            {entry.prize
                              ? `${entry.prize.rank} - ${entry.prize.name}`
                              : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              {getStatusLabel(entry.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}