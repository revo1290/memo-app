import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
  secondary: 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200',
  danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
  ghost: 'text-gray-400 hover:text-gray-600 hover:bg-transparent',
} as const;

const sizes = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
} as const;

export type IconButtonVariant = keyof typeof variants;
export type IconButtonSize = keyof typeof sizes;

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label: string; // アクセシビリティ用
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        aria-label={label}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
