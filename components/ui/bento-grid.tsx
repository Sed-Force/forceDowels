import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  // New props for controlling the spanning
  colSpan?: { md?: number; lg?: number };
  rowSpan?: number;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  children,
  colSpan,
  rowSpan,
  ...props
}: BentoGridItemProps) {
  // Generate span classes based on provided props
  const spanClasses = [
    colSpan?.md && `md:col-span-${colSpan.md}`,
    colSpan?.lg && `lg:col-span-${colSpan.lg}`,
    rowSpan && `row-span-${rowSpan}`,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none dark:border-white/[0.2] border border-neutral-200 bg-white dark:bg-black/[0.8] overflow-hidden",
        ...spanClasses,
        className
      )}
      {...props}
    >
      <div className="relative w-full h-full p-4 flex flex-col justify-between">
        <div className="flex flex-col h-full">
          {header && <div className="flex-1">{header}</div>}
          <div className="mt-2">
            {icon && <div className="mb-2">{icon}</div>}
            {title && (
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-lg mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}