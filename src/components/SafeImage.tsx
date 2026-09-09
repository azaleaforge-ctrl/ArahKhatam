"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

// Gambar aman: bila file belum ada, sembunyikan img dan biarkan gradient di belakang.
export default function SafeImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
