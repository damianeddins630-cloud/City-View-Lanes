import SiteImage from "@/components/SiteImage";

type Props = {
  path?: string;
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

/** Image display (edit mode removed). `path` kept for call-site compatibility. */
export default function EditableImage({
  src,
  alt,
  fill,
  priority,
  className,
  sizes,
  width,
  height,
}: Props) {
  return (
    <SiteImage
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      className={className}
      sizes={sizes}
      width={width}
      height={height}
    />
  );
}
