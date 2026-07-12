"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface ResilientImageProps
  extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}

export default function ResilientImage({
  src,
  alt,
  fallback,
  ...props
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return fallback;

  return <Image src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}
