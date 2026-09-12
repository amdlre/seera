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
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect x="18" y="14" width="28" height="36" rx="3" fill="#2563EB" />
            <rect x="23" y="21" width="18" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="23" y="28" width="18" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="23" y="35" width="12" height="3" rx="1.5" fill="#FFFFFF" />
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
