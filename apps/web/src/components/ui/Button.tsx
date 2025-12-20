import * as React from "react";

import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

// Note: Need to install class-variance-authority first.
// If user didn't approve installing it, I will implement without it for now to avoid blocking.
// But standard shadcn/ui uses it. I'll stick to simple implementation for now to avoid extra deps if not requested.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

        const variants = {
            primary: "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:to-accent-500",
            secondary: "bg-white text-gray-900 shadow-sm border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700",
            outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/10",
            ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-11 w-11",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
