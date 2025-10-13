import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] will-change-transform',
          {
            'bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-soft hover:shadow-soft-lg hover:scale-[1.02] hover:from-primary/95 hover:via-primary hover:to-primary/95':
              variant === 'default',
            'bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:shadow-soft-lg hover:scale-[1.02]':
              variant === 'secondary',
            'border-2 border-input bg-background shadow-soft hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-[1.02]':
              variant === 'outline',
            'hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.05]': variant === 'ghost',
            'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-soft-lg hover:scale-[1.02]':
              variant === 'destructive',
          },
          {
            'h-11 px-5 py-2.5': size === 'default',
            'h-9 rounded-lg px-3 text-xs': size === 'sm',
            'h-12 rounded-xl px-8 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
