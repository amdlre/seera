import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* The brand mark, matching public/brand/seera-icon-blue.svg. */}
          <svg width="84" height="84" viewBox="0 0 110.7 110.7">
            <g transform="scale(0.1) translate(0 928)">
              <rect
                x="320.5"
                y="-618"
                width="466"
                height="658"
                rx="74"
                fill="none"
                stroke="#2563EB"
                strokeWidth="38"
              />
              <line
                x1="430.5"
                y1="-447"
                x2="676.5"
                y2="-447"
                stroke="#2563EB"
                strokeWidth="44"
                strokeLinecap="round"
              />
              <line
                x1="430.5"
                y1="-314"
                x2="676.5"
                y2="-314"
                stroke="#2563EB"
                strokeWidth="25"
                strokeLinecap="round"
              />
              <line
                x1="504.5"
                y1="-204"
                x2="676.5"
                y2="-204"
                stroke="#2563EB"
                strokeWidth="25"
                strokeLinecap="round"
              />
              <circle cx="455.5" cy="-764" r="44" fill="#2563EB" />
              <circle cx="651.5" cy="-764" r="44" fill="#2563EB" />
            </g>
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#FFFFFF" }}>
          Seera
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#DBEAFE" }}>
          ATS-ready resumes, in Arabic and English
        </div>
      </div>
    ),
    { ...size },
  );
}
