"use client";

export function ripple(e: React.MouseEvent<HTMLElement>) {
  const host = e.currentTarget;
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const dot = document.createElement("span");
  dot.className = "ripple-dot";
  dot.style.width = size + "px";
  dot.style.height = size + "px";
  dot.style.left = e.clientX - rect.left - size / 2 + "px";
  dot.style.top = e.clientY - rect.top - size / 2 + "px";
  host.appendChild(dot);
  setTimeout(() => dot.remove(), 650);
}

export function tilt(e: React.MouseEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = "translateY(-6px) perspective(700px) rotateX(" + -py * 6 + "deg) rotateY(" + px * 8 + "deg)";
}

export function tiltReset(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
}
