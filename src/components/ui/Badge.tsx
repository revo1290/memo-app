import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
} as const;

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
} as const;

export type BadgeVariant = keyof typeof variants;
export type BadgeSize = keyof typeof sizes;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string; // カスタムカラー（HEX）
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      color,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    // カスタムカラーが指定されている場合は、それを使用
    const customColorStyle = color
      ? {
          backgroundColor: `${color}20`, // 20は透明度
          color: color,
          borderColor: color,
        }
      : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          !color && variants[variant],
          sizes[size],
          color && 'border',
          className
        )}
        style={customColorStyle}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
            aria-label="削除"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
