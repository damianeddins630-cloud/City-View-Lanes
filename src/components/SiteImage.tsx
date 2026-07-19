"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

function isRemote(src: string) {
  return /^https?:\/\//i.test(src) || src.startsWith("data:");
}

/** Local /images paths use Next Image; uploaded Blob URLs use a plain img. */
export default function SiteImage({
  src,
  alt,
  fill,
  priority,
  className,
  sizes,
  width,
  height,
}: Props) {
  const safeSrc = src || "/images/cityview-lanes.webp";

  if (isRemote(safeSrc)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover ${className || ""}`}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
