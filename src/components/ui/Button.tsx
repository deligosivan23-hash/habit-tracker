import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-obsidian-900 hover:bg-amber-400 active:bg-amber-600 font-semibold shadow-amber-sm',
  secondary:
    'bg-surface-raised border border-border text-text-primary hover:bg-surface-overlay hover:border-border-bright',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary border border-transparent hover:border-border',
  danger:
    'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20',
  amber:
    'bg-transparent border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/70',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  icon: 'p-2 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.1 }}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center',
          'font-body transition-all duration-150 cursor-pointer',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
          'select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...(rest as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon
        )}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
