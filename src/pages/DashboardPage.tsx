import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Building2, ListChecks, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { careerFairService, checklistService } from '@/services/database.service';
import WelcomeModal from '@/components/WelcomeModal';
import Loader from '@/components/ui/Loader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [careerFairs, setCareerFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [upcomingFair, setUpcomingFair] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalFairs: 0,
    upcomingFairs: 0,
    totalCompanies: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    // Check if this is the first time user is seeing the dashboard
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fairs = await careerFairService.getAll(user.id);
      setCareerFairs(fairs.slice(0, 5)); // Show only 5 most recent

      // Calculate stats
      const now = new Date();
      const upcoming = fairs.filter(fair => new Date(fair.date) >= now).length;

      setStats({
        totalFairs: fairs.length,
        upcomingFairs: upcoming,
        totalCompanies: 0, // TODO: Calculate from companies table
      });

      // Check for fairs within the next 7 days
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

      const fairsWithinWeek = fairs.filter(fair => {
        const fairDate = new Date(fair.date);
        return fairDate >= now && fairDate <= oneWeekFromNow;
      });

      if (fairsWithinWeek.length > 0) {
        // Get the closest fair
        const closestFair = fairsWithinWeek.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0];

        setUpcomingFair(closestFair);

        // Load checklist items for this fair
        const items = await checklistService.getByCareerFairId(closestFair.id);
        setChecklistItems(items);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = async (itemId: string, currentStatus: boolean) => {
    try {
      await checklistService.update(itemId, { is_completed: !currentStatus });

      // Update local state
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, is_completed: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={user?.user_metadata?.full_name}
      />

      <div className="space-y-12 sm:space-y-16">
      {/* Welcome Header */}
      <div className="space-y-3 pt-4">
        <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl">
          Here's your career fair journey at a glance
        </p>
      </div>

      {/* Upcoming Fair Alert */}
      {upcomingFair && checklistItems.some(item => !item.is_completed) && (
        <Card className="border-0 shadow-soft-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20 shrink-0">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    You have <span className="text-primary">{upcomingFair.name}</span> coming up!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(upcomingFair.date)} • Review your prep list
                  </p>
                </div>

                {/* Inline Checklist */}
                <div className="space-y-2">
                  {checklistItems
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                        onClick={() => toggleChecklistItem(item.id, item.is_completed)}
                      >
                        {item.is_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            item.is_completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {item.item_text}
                        </span>
                      </div>
                    ))}
                </div>

                <Link to={`/fairs/${upcomingFair.id}/checklist`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Full Checklist
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
        <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 bg-gradient-to-br from-background to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Career Fairs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-5xl font-light tracking-tight">{stats.totalFairs}</div>
            <p className="text-sm text-muted-foreground mt-3">
              Total events
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 bg-gradient-to-br from-background to-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-5xl font-light tracking-tight">{stats.upcomingFairs}</div>
            <p className="text-sm text-muted-foreground mt-3">
              Events ahead
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 bg-gradient-to-br from-background to-zomp/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-zomp/10">
                <Building2 className="h-5 w-5 text-zomp" />
              </div>
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-5xl font-light tracking-tight">{stats.totalCompanies}</div>
            <p className="text-sm text-muted-foreground mt-3">
              Connections made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/fairs/new">
            <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-primary/5 to-accent/5 h-full">
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Create Career Fair</h3>
                    <p className="text-sm text-muted-foreground">Start planning your next event</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/fairs">
            <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-zomp/5 to-secondary/5 h-full">
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col items-start gap-4">
                  <div className="p-4 rounded-2xl bg-zomp/10 group-hover:bg-zomp/20 transition-colors">
                    <ListChecks className="h-7 w-7 text-zomp" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">View All Events</h3>
                    <p className="text-sm text-muted-foreground">Browse your career fairs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Career Fairs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-foreground">Recent Events</h2>
          {careerFairs.length > 0 && (
            <Link to="/fairs">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All →
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="flex items-center justify-center py-16">
              <Loader />
            </CardContent>
          </Card>
        ) : careerFairs.length === 0 ? (
          <Card className="border-0 shadow-soft bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="text-center py-16 space-y-5">
              <div className="flex justify-center">
                <div className="p-5 rounded-2xl bg-muted/30">
                  <Calendar className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No career fairs yet</p>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Create your first career fair to start your journey
                </p>
              </div>
              <Link to="/fairs/new">
                <Button className="mt-2 rounded-full px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Career Fair
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {careerFairs.map((fair) => (
              <Link
                key={fair.id}
                to={`/fairs/${fair.id}`}
                className="block"
              >
                <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{fair.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(fair.date)}
                          {fair.location && <span>• {fair.location}</span>}
                        </p>
                      </div>
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Tips */}
      {stats.totalFairs === 0 && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-medium">Getting Started</h2>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
                  1
                </span>
                <div className="pt-0.5">
                  <p className="font-medium mb-1">Create your first career fair</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add event details including date, location, and preparation notes
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
                  2
                </span>
                <div className="pt-0.5">
                  <p className="font-medium mb-1">Set up your prep checklist</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Organize everything you need to be ready for the big day
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
                  3
                </span>
                <div className="pt-0.5">
                  <p className="font-medium mb-1">Scan company materials</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use intelligent OCR to quickly capture and organize company information
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
