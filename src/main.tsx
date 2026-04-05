import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Generate favicon using Inter (already loaded by the browser for the page)
function setFavicon() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = 14;

  // Rounded square background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = "#0e1e3a";
  ctx.fill();
  ctx.fillStyle = "rgba(74,127,212,0.25)";
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(74,127,212,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Æ glyph
  ctx.fillStyle = "#4A7FD4";
  ctx.font = "bold 42px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Æ", size / 2, size / 2 + 1);

  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    ?? Object.assign(document.createElement("link"), { rel: "icon" });
  link.type = "image/png";
  link.href = canvas.toDataURL("image/png");
  document.head.appendChild(link);
}

// Wait for Inter to be ready, then render the favicon
document.fonts.ready.then(setFavicon);

createRoot(document.getElementById("root")!).render(<App />);
