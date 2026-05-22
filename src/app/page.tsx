import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        backgroundColor: "#FFF3DC",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          margin: "0 auto",
          backgroundColor: "#FFF3DC",
        }}
      >
        <div
          style={
            {
              position: "relative",
              width: "100%",
              aspectRatio: "941 / 1672",
              overflow: "hidden",
              backgroundColor: "#FFF3DC",
              "--stage-w": 941,
              "--stage-h": 1672,
            } as React.CSSProperties
          }
        >
          {/* 배경 이미지 */}
          <img
            src="/images/gongju-main-bg-v2.png"
            alt="공주를 플레이하자"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* GIF 캐릭터 - 배경 이미지 좌표 기준 */}
          <div
            style={{
              position: "absolute",

              // 여기 좌표만 조절하면 됨
              left: "calc(120 / var(--stage-w) * 100%)",
              top: "calc(300 / var(--stage-h) * 100%)",
              width: "calc(180 / var(--stage-w) * 100%)",

              zIndex: 2,
            }}
          >
            <img
              src="/images/gongju-character-v2.gif"
              alt="공주 캐릭터"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          {/* 참여 카드 */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "calc(840 / var(--stage-h) * 100%)",
              transform: "translateX(-50%)",
              width: "86%",
              backgroundColor: "#ffffff",
              borderRadius: "0 0 24px 24px",
              padding: "30px 22px 34px",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
              zIndex: 3,
            }}
          >
            <p
              style={{
                marginBottom: "14px",
                fontSize: "14px",
                fontWeight: 900,
                color: "#f97316",
              }}
            >
              공주팝업행사 웹앱 설문조사
            </p>

            <h1
              style={{
                marginBottom: "28px",
                fontSize: "26px",
                lineHeight: "1.25",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              공주 여행 미션 시작!
            </h1>

            <Link
              href="/survey"
              style={{
                display: "flex",
                width: "100%",
                height: "64px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "999px",
                backgroundColor: "#f7902f",
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              참여하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}