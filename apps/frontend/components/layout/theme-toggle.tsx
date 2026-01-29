'use client';

import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Compact circular toggle matching shadcn's mode toggle aesthetics.
export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  if (!mounted) {
    // Avoid hydration mismatch by not rendering icon until mounted.
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={baseButtonClasses}
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            baseButtonClasses,
            isDark
              ? 'bg-accent text-foreground'
              : 'bg-background text-foreground border-border'
          )}
        >
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <span>Toggle theme</span>
      </TooltipContent>
    </Tooltip>
  );
}

const baseButtonClasses =
  'inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs shadow-sm transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer';
