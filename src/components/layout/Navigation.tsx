import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="flex items-center gap-2">
      <Button
        asChild
        variant={isActive('/') ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          "transition-all duration-200",
          isActive('/') && "bg-gradient-primary shadow-glow"
        )}
      >
        <Link to="/" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Record</span>
        </Link>
      </Button>
      
      <Button
        asChild
        variant={isActive('/status') ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          "transition-all duration-200",
          isActive('/status') && "bg-gradient-primary shadow-glow"
        )}
      >
        <Link to="/status" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Status</span>
        </Link>
      </Button>
    </nav>
  );
};