"use client";

import { useState } from "react";

function formatKoreanDateTime(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getVerifyCode(entryId?: string) {
  if (!entryId) return "-";

  return entryId.replace(/-/g, "").slice(-8).toUpperCase();
}

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
    eventDate?: string;
    event_date?: string;
    wonAt?: string;
    won_at?: string;
  } | null;
};

type PrizeInventory = {
  event_date: string;
  event_start_at: string | null;
  event_end_at: string | null;
  rank: string;
  name: string;
  limit_count: number | null;
  issued_count: number;
  sort_order: number;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [inventory, setInventory] = useState<PrizeInventory[]>([]);
  const [showTestInventory, setShowTestInventory] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      survey_done: "설문 완료",
      quiz_done: "퀴즈 완료",
      prize_done: "룰렛 완료",
      roulette_done: "룰렛 완료",
      coupon_used: "경품 수령 완료",
    };

    return statusMap[status] || status;
  };

  const getPrizeEventDate = (entry: EventEntry) => {
    return entry.prize?.eventDate || entry.prize?.event_date || "";
  };

  const getPrizeWonAt = (entry: EventEntry) => {
    return entry.prize?.wonAt || entry.prize?.won_at || "";
  };

  const isWinnerEntry = (entry: EventEntry) => {
    return Boolean(entry.prize?.rank && entry.prize.rank !== "꽝");
  };

  const getEventDayLabel = (eventDate: string) => {
    if (eventDate === "2026-05-24") {
      return `1일차 (${eventDate})`;
    }

    if (eventDate === "2026-05-25") {
      return `2일차 (${eventDate})`;
    }

    return `테스트 (${eventDate})`;
  };

  const formatTimeRange = (startAt: string | null, endAt: string | null) => {
    if (!startAt || !endAt) {
      return "-";
    }

    const start = startAt.replace("T", " ").slice(11, 16);
    const end = endAt.replace("T", " ").slice(11, 16);

    return `${start} ~ ${end}`;
  };

  const loadEntries = async () => {
    if (!password.trim()) {
      alert("관리자 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/entries", {
        method: "GET",
        headers: {
          "x-admin-password": password,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "관리자 데이터 조회에 실패했습니다.");
        console.error(result);
        return;
      }

      setEntries(result.entries || []);
      setInventory(result.inventory || []);
      setIsLoaded(true);
    } catch (error) {
      alert("관리자 데이터 조회 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      "공주 인지 경로",
      "방문 목적",
      "공주 인지도",
      "공주를 떠올렸을 때 먼저 생각나는 것",
      "방문 경험",
      "만족했던 부분",
      "방문 의향",
      "퀴즈 점수",
      "퀴즈 정답 수",
      "퀴즈 전체 문항 수",
      "당첨 행사일",
      "당첨 등급",
      "당첨 상품",
      "당첨 시간",
      "인증 코드",
      "상태",
    ];

    const rows = entries.map((entry) => {
      const single = entry.survey?.singleAnswers || {};
      const multiple = entry.survey?.multipleAnswers || {};
      const satisfaction = multiple.satisfaction || [];
      const prizeWonAt = getPrizeWonAt(entry);
      const isWinner = isWinnerEntry(entry);

      return [
        formatKoreanDateTime(entry.created_at),
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
        getPrizeEventDate(entry),
        entry.prize?.rank || "",
        entry.prize?.name || "",
        isWinner && prizeWonAt ? formatKoreanDateTime(prizeWonAt) : "",
        isWinner ? getVerifyCode(entry.id) : "",
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

  const totalCount = entries.length;
  const surveyCount = entries.filter((entry) => entry.survey).length;
  const prizeDoneCount = entries.filter((entry) => entry.prize).length;

  const winnerCount = entries.filter((entry) => isWinnerEntry(entry)).length;

  const officialEventDates = ["2026-05-24", "2026-05-25"];

  const testInventoryCount = inventory.filter(
    (item) => !officialEventDates.includes(item.event_date)
  ).length;

  const visibleInventory = showTestInventory
    ? inventory
    : inventory.filter((item) => officialEventDates.includes(item.event_date));

  return (
    <main className="min-h-screen bg-[#FFF7E8] px-5 py-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-md">
          <p className="mb-2 text-sm font-bold text-orange-500">
            공주팝업행사 관리자
          </p>

          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            참여 데이터 관리
          </h1>

          <p className="text-sm leading-relaxed text-gray-600">
            설문, 퀴즈, 룰렛 결과와 날짜별 경품 발급 수량을 확인할 수
            있습니다.
          </p>
        </div>

        {!isLoaded && (
          <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-md">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              관리자 비밀번호
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadEntries();
                }
              }}
              className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-400"
              placeholder="비밀번호 입력"
            />

            <button
              type="button"
              onClick={loadEntries}
              disabled={isLoading}
              className="w-full rounded-full bg-orange-400 py-4 text-lg font-bold text-white hover:bg-orange-500 disabled:bg-gray-300"
            >
              {isLoading ? "불러오는 중..." : "관리자 데이터 보기"}
            </button>
          </div>
        )}

        {isLoaded && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-3xl bg-white p-5 shadow-md">
                <p className="mb-1 text-sm font-bold text-gray-500">
                  전체 참여자
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {totalCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-md">
                <p className="mb-1 text-sm font-bold text-gray-500">
                  설문 완료
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {surveyCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-md">
                <p className="mb-1 text-sm font-bold text-gray-500">
                  룰렛 완료
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {prizeDoneCount}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-md">
                <p className="mb-1 text-sm font-bold text-gray-500">
                  실제 당첨자
                </p>
                <p className="text-3xl font-black text-orange-600">
                  {winnerCount}
                </p>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <h2 className="font-bold text-gray-900">
                  날짜별 경품 발급 현황
                </h2>

                {testInventoryCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTestInventory((prev) => !prev)}
                    className="rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white"
                  >
                    {showTestInventory
                      ? "테스트 데이터 숨기기"
                      : `테스트 데이터 보기 (${testInventoryCount})`}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-orange-100 text-sm font-bold text-gray-900">
                    <tr>
                      <th className="px-4 py-3">행사일</th>
                      <th className="px-4 py-3">운영 시간</th>
                      <th className="px-4 py-3">등수</th>
                      <th className="px-4 py-3">상품</th>
                      <th className="px-4 py-3">발급 수량</th>
                      <th className="px-4 py-3">잔여 수량</th>
                      <th className="px-4 py-3">제한 수량</th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-900">
                    {visibleInventory.map((item) => {
                      const remaining =
                        item.limit_count === null
                          ? "-"
                          : Math.max(item.limit_count - item.issued_count, 0);

                      return (
                        <tr
                          key={`${item.event_date}-${item.rank}`}
                          className="border-t border-gray-200 bg-white hover:bg-orange-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {getEventDayLabel(item.event_date)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {formatTimeRange(
                              item.event_start_at,
                              item.event_end_at
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-orange-600">
                            {item.rank}
                          </td>

                          <td className="min-w-[180px] px-4 py-4 font-bold text-gray-900">
                            {item.name}
                          </td>

                          <td className="px-4 py-4 font-bold text-gray-900">
                            {item.issued_count}
                          </td>

                          <td className="px-4 py-4 font-bold text-gray-900">
                            {remaining}
                          </td>

                          <td className="px-4 py-4 font-bold text-gray-900">
                            {item.limit_count ?? "제한 없음"}
                          </td>
                        </tr>
                      );
                    })}

                    {visibleInventory.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center font-bold text-gray-400"
                        >
                          등록된 경품 수량 데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 flex justify-end">
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
                📥 엑셀 다운로드
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="border-b border-gray-100 p-5">
                <h2 className="font-bold text-gray-900">참여자 목록</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[2100px] text-left text-sm">
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
                      <th className="px-4 py-3">당첨 행사일</th>
                      <th className="px-4 py-3">당첨</th>
                      <th className="px-4 py-3">당첨 시간</th>
                      <th className="px-4 py-3">인증 코드</th>
                      <th className="px-4 py-3">상태</th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-900">
                    {entries.map((entry) => {
                      const single = entry.survey?.singleAnswers || {};
                      const multiple = entry.survey?.multipleAnswers || {};
                      const satisfaction = multiple.satisfaction || [];
                      const prizeWonAt = getPrizeWonAt(entry);
                      const isWinner = isWinnerEntry(entry);

                      return (
                        <tr
                          key={entry.id}
                          className="border-t border-gray-200 bg-white hover:bg-orange-50"
                        >
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                            {formatKoreanDateTime(entry.created_at)}
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
                            {satisfaction.length > 0
                              ? satisfaction.join(", ")
                              : "-"}
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

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {getPrizeEventDate(entry) || "-"}
                          </td>

                          <td className="min-w-[220px] px-4 py-4 font-bold text-orange-600">
                            {entry.prize
                              ? `${entry.prize.rank} - ${entry.prize.name}`
                              : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-bold text-gray-900">
                            {isWinner && prizeWonAt
                              ? formatKoreanDateTime(prizeWonAt)
                              : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 font-black text-[#632713]">
                            {isWinner ? getVerifyCode(entry.id) : "-"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              {getStatusLabel(entry.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {entries.length === 0 && (
                      <tr>
                        <td
                          colSpan={17}
                          className="px-4 py-8 text-center font-bold text-gray-400"
                        >
                          참여 데이터가 없습니다.
                        </td>
                      </tr>
                    )}
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