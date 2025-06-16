'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [currentIcon, setCurrentIcon] = React.useState(<Laptop className="h-5 w-5" />);

  React.useEffect(() => {
    if (theme === 'light') {
      setCurrentIcon(<Sun className="h-5 w-5" />);
    } else if (theme === 'dark') {
      setCurrentIcon(<Moon className="h-5 w-5" />);
    } else {
      setCurrentIcon(<Laptop className="h-5 w-5" />);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {currentIcon}
    </Button>
  );
}
