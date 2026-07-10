import type { ReactNode } from "react";

/**
 * Presentational shells that give every gallery a consistent, labelled layout.
 * A `GallerySection` is a titled block; a `GalleryRow` lays out a labelled row
 * of component variants.
 */
export function GallerySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-y-5">
      <div className="flex flex-col gap-y-1">
        <h2 className="font-medium text-fg text-lg">{title}</h2>
        {description && (
          <p className="max-w-prose text-fg-subtle text-sm">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-6">{children}</div>
    </section>
  );
}

export function GalleryRow({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      {label && (
        <p className="font-mono text-fg-subtle text-xs uppercase tracking-wide">
          {label}
        </p>
      )}
      <div className="flex flex-row flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}
