import { ImageResponse } from "next/og";

export const alt = "Yazar Ramazan Temelkuran resmi web sitesi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #171d2b 0%, #26334c 100%)",
          color: "white",
          fontFamily: "serif",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div
            style={{
              width: 156,
              height: 156,
              borderRadius: 40,
              background: "#b8843f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 78,
              fontWeight: 700,
            }}
          >
            RT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
              Ramazan Temelkuran
            </div>
            <div style={{ fontSize: 32, color: "#e3c79b" }}>
              Yazar · Resmi Web Sitesi
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
