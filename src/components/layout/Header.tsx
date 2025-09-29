import { Card } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Navigation } from './Navigation';

export const Header = () => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-card-custom">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-accent">
              <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">AI Speech Recognition</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Advanced speech-to-text technology
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Navigation />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </Card>
  );
};