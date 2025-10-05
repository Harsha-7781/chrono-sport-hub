import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Calendar, Users, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const MOCK_STATS = {
  totalSports: 12,
  totalSessions: 45,
  totalPlayers: 156,
  upcomingSessions: 8,
};

const RECENT_SESSIONS = [
  {
    id: '1',
    title: 'Basketball Tournament',
    sport: 'Basketball',
    date: '2024-01-20',
    time: '18:00',
    location: 'Court A',
    players: 8,
    maxPlayers: 10,
    status: 'upcoming' as const
  },
  {
    id: '2',
    title: 'Soccer Practice',
    sport: 'Soccer',
    date: '2024-01-21',
    time: '16:30',
    location: 'Field B',
    players: 15,
    maxPlayers: 22,
    status: 'upcoming' as const
  },
  {
    id: '3',
    title: 'Tennis Singles',
    sport: 'Tennis',
    date: '2024-01-19',
    time: '10:00',
    location: 'Court 1',
    players: 2,
    maxPlayers: 2,
    status: 'completed' as const
  },
];

export function Dashboard() {
  const { user } = useAuth();

  const StatCard = ({ title, value, icon: Icon, description }: {
    title: string;
    value: number;
    icon: React.ElementType;
    description: string;
  }) => (
    <Card className="bg-card border-border hover:shadow-glow transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' ? 
            'Manage your sports and sessions from the dashboard below.' :
            'View your sessions and join new activities.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sports"
          value={MOCK_STATS.totalSports}
          icon={Trophy}
          description="Active sports categories"
        />
        <StatCard
          title="Total Sessions"
          value={MOCK_STATS.totalSessions}
          icon={Calendar}
          description="All time sessions"
        />
        <StatCard
          title="Active Players"
          value={MOCK_STATS.totalPlayers}
          icon={Users}
          description="Registered users"
        />
        <StatCard
          title="Upcoming Sessions"
          value={MOCK_STATS.upcomingSessions}
          icon={TrendingUp}
          description="This week"
        />
      </div>

      {/* Recent Sessions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-accent" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_SESSIONS.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-background-secondary border border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{session.title}</h3>
                    <Badge 
                      variant={session.status === 'upcoming' ? 'default' : 'secondary'}
                      className={session.status === 'upcoming' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {session.sport}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.date} at {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {session.players}/{session.maxPlayers}
                  </div>
                  <div className="text-xs text-muted-foreground">players</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-primary border-0 text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90 mb-4">
              {user?.role === 'admin' ? 
                'Create new sports categories and manage upcoming sessions.' :
                'Join upcoming sessions or create your own activities.'
              }
            </p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                Create Session
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                {user?.role === 'admin' ? 'Manage Sports' : 'Browse Sessions'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-accent" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessions joined this month</span>
                <span className="font-medium text-foreground">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Favorite sport</span>
                <span className="font-medium text-foreground">Basketball</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total hours played</span>
                <span className="font-medium text-foreground">24h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}