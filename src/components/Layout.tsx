import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, Settings, LogOut, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Hide navigation on landing page
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/10 to-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Header - Hidden on landing page */}
      {!isLandingPage && user && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 shadow-soft glass-effect backdrop-blur-xl">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/favicon.png"
                alt="Boothmark Logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 relative z-10",
        !isLandingPage && "container max-w-screen-2xl px-4 sm:px-6 py-6 sm:py-8 pb-24"
      )}>
        <Outlet />
      </main>

      {/* Bottom Navigation - Hidden on landing page */}
      {!isLandingPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 shadow-soft-lg glass-effect backdrop-blur-xl safe-area-bottom">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex h-16 items-center justify-around">
            <Link
              to="/dashboard"
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-300 ease-out relative group',
                isActive('/dashboard')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive('/dashboard') && (
                <div className="absolute top-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full animate-scale-in shadow-glow" />
              )}
              <div className={cn(
                'transition-transform duration-300 ease-out',
                isActive('/dashboard') ? 'scale-110' : 'group-hover:scale-110'
              )}>
                <LayoutDashboard className={cn('h-6 w-6', isActive('/dashboard') && 'drop-shadow-glow')} />
              </div>
              <span className={cn('text-xs font-semibold', isActive('/dashboard') && 'font-bold')}>Dashboard</span>
            </Link>
            <Link
              to="/fairs"
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-300 ease-out relative group',
                isActive('/fairs')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive('/fairs') && (
                <div className="absolute top-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full animate-scale-in shadow-glow" />
              )}
              <div className={cn(
                'transition-transform duration-300 ease-out',
                isActive('/fairs') ? 'scale-110' : 'group-hover:scale-110'
              )}>
                <Calendar className={cn('h-6 w-6', isActive('/fairs') && 'drop-shadow-glow')} />
              </div>
              <span className={cn('text-xs font-semibold', isActive('/fairs') && 'font-bold')}>Fairs</span>
            </Link>
            <Link
              to="/settings"
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-300 ease-out relative group',
                isActive('/settings')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive('/settings') && (
                <div className="absolute top-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full animate-scale-in shadow-glow" />
              )}
              <div className={cn(
                'transition-transform duration-300 ease-out',
                isActive('/settings') ? 'scale-110' : 'group-hover:scale-110'
              )}>
                <Settings className={cn('h-6 w-6', isActive('/settings') && 'drop-shadow-glow')} />
              </div>
              <span className={cn('text-xs font-semibold', isActive('/settings') && 'font-bold')}>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
      )}
    </div>
  );
}
