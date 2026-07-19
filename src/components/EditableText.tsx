import type { ElementType } from "react";

type Props = {
  path?: string;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  prefix?: string;
  suffix?: string;
};

/** Plain text display (edit mode removed). `path` kept for call-site compatibility. */
export default function EditableText({
  value,
  as: Tag = "span",
  className,
  prefix = "",
  suffix = "",
}: Props) {
  return (
    <Tag className={className}>
      {prefix}
      {value}
      {suffix}
    </Tag>
  );
}
