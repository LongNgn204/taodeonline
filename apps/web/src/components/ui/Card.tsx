import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

const CardGlass = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-xl dark:bg-gray-900/60 dark:border-white/10",
                className
            )}
            {...props}
        />
    )
);
CardGlass.displayName = "CardGlass";

export { Card, CardGlass };
