import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "linear-gradient(135deg, #2E31E6 0%, #10124F 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 160,
          height: 160,
          borderRadius: 37,
          background: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* The brand mark, matching public/brand/seera-mark.svg. */}
        <svg width="104" height="104" viewBox="0 0 120 120" fill="none">
          <path
            d="M108 88 Q99 62 90 88 Q81 62 72 88 Q63 62 54 88 C46 108 22 100 22 40"
            stroke="#2E31E6"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="20" r="10" fill="#0F1530" />
        </svg>
      </div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#FFFFFF" }}>Seera</div>
      <div style={{ display: "flex", fontSize: 34, color: "#DDE1FF" }}>
        ATS-ready resumes, in Arabic and English
      </div>
    </div>,
    { ...size },
  );
}
