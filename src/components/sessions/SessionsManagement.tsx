import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, MapPin, Clock, Trophy, UserCheck, UserMinus, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Session, Sport } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const MOCK_SPORTS: Sport[] = [
  { id: '1', name: 'Basketball', description: '', maxPlayers: 10, createdBy: '1', createdAt: '' },
  { id: '2', name: 'Soccer', description: '', maxPlayers: 22, createdBy: '1', createdAt: '' },
  { id: '3', name: 'Tennis', description: '', maxPlayers: 4, createdBy: '1', createdAt: '' },
];

const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    sportId: '1',
    title: 'Basketball Tournament',
    description: 'Weekly basketball tournament for all skill levels',
    date: '2024-01-25',
    time: '18:00',
    duration: 120,
    maxPlayers: 10,
    location: 'Court A - Sports Complex',
    createdBy: '1',
    players: [
      { id: '1', sessionId: '1', userId: '1', joinedAt: '2024-01-20T10:00:00Z', status: 'joined' },
      { id: '2', sessionId: '1', userId: '2', joinedAt: '2024-01-20T11:00:00Z', status: 'joined' },
    ],
    status: 'upcoming',
    createdAt: '2024-01-20T09:00:00Z'
  },
  {
    id: '2',
    sportId: '2',
    title: 'Soccer Practice',
    description: 'Friendly soccer match and skills training',
    date: '2024-01-24',
    time: '16:30',
    duration: 90,
    maxPlayers: 22,
    location: 'Field B - Main Stadium',
    createdBy: '2',
    players: [
      { id: '3', sessionId: '2', userId: '1', joinedAt: '2024-01-21T10:00:00Z', status: 'joined' },
    ],
    status: 'upcoming',
    createdAt: '2024-01-21T09:00:00Z'
  },
  {
    id: '3',
    sportId: '1',
    title: 'Morning Basketball',
    description: 'Early morning basketball session',
    date: '2024-01-15',
    time: '08:00',
    duration: 60,
    maxPlayers: 8,
    location: 'Court B',
    createdBy: '1',
    players: [],
    status: 'completed',
    createdAt: '2024-01-10T09:00:00Z'
  },
];

export function SessionsManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [sports] = useState<Sport[]>(MOCK_SPORTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sportId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    maxPlayers: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedSport = sports.find(sport => sport.id === formData.sportId);
    if (!selectedSport) {
      toast({
        title: "Error",
        description: "Please select a sport",
        variant: "destructive",
      });
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      sportId: formData.sportId,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      maxPlayers: Math.min(formData.maxPlayers, selectedSport.maxPlayers),
      location: formData.location,
      createdBy: user?.id || '1',
      players: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    
    setSessions(prev => [...prev, newSession]);
    
    toast({
      title: "Session created",
      description: `${formData.title} has been scheduled successfully`,
    });

    // Reset form
    setFormData({
      sportId: '',
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      maxPlayers: 10,
    });
    setIsCreateDialogOpen(false);
  };

  const handleJoinSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const isAlreadyJoined = session.players.some(p => p.userId === user?.id);
        if (isAlreadyJoined) return session;
        
        if (session.players.length >= session.maxPlayers) {
          toast({
            title: "Session full",
            description: "This session has reached maximum capacity",
            variant: "destructive",
          });
          return session;
        }

        const newPlayer = {
          id: Date.now().toString(),
          sessionId,
          userId: user?.id || '1',
          joinedAt: new Date().toISOString(),
          status: 'joined' as const,
        };

        toast({
          title: "Joined session",
          description: `You've successfully joined ${session.title}`,
        });

        return {
          ...session,
          players: [...session.players, newPlayer]
        };
      }
      return session;
    }));
  };

  const handleLeaveSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const updatedPlayers = session.players.filter(p => p.userId !== user?.id);
        
        toast({
          title: "Left session",
          description: `You've left ${session.title}`,
        });

        return {
          ...session,
          players: updatedPlayers
        };
      }
      return session;
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const isSessionInPast = (date: string, time: string) => {
    const sessionDateTime = new Date(`${date}T${time}`);
    return sessionDateTime < new Date();
  };

  const isUserJoined = (session: Session) => {
    return session.players.some(p => p.userId === user?.id && p.status === 'joined');
  };

  const getSportName = (sportId: string) => {
    return sports.find(sport => sport.id === sportId)?.name || 'Unknown Sport';
  };

  const upcomingSessions = sessions.filter(session => 
    session.status === 'upcoming' && !isSessionInPast(session.date, session.time)
  );
  const pastSessions = sessions.filter(session => 
    session.status === 'completed' || isSessionInPast(session.date, session.time)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sessions</h1>
          <p className="text-muted-foreground">Browse and manage sports sessions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary-hover text-secondary-foreground gap-2 shadow-glow">
              <Plus className="w-4 h-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Session</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sportId" className="text-foreground">Sport</Label>
                <Select value={formData.sportId} onValueChange={(value) => setFormData(prev => ({ ...prev, sportId: value }))}>
                  <SelectTrigger className="bg-background-secondary border-border focus:ring-accent">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map(sport => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name} (Max {sport.maxPlayers} players)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Session Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Morning Basketball"
                  required
                  className="bg-background-secondary border-border focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the session"
                  className="bg-background-secondary border-border focus:ring-accent min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-background-secondary border-border focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-foreground">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="bg-background-secondary border-border focus:ring-accent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="bg-background-secondary border-border focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Court A - Sports Complex"
                  required
                  className="bg-background-secondary border-border focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers" className="text-foreground">Max Players</Label>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  max={sports.find(s => s.id === formData.sportId)?.maxPlayers || 50}
                  value={formData.maxPlayers}
                  onChange={handleChange}
                  required
                  className="bg-background-secondary border-border focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-accent-foreground"
                >
                  Create Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          Upcoming Sessions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingSessions.map(session => (
            <Card key={session.id} className="bg-card border-border hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      {session.title}
                    </CardTitle>
                    <p className="text-sm text-accent">{getSportName(session.sportId)}</p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={session.players.length >= session.maxPlayers ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground'}
                  >
                    {session.players.length >= session.maxPlayers ? 'Full' : 'Available'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{session.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date(session.date).toLocaleDateString()} at {session.time} ({session.duration}min)
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {session.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {session.players.length}/{session.maxPlayers} players
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  {isSessionInPast(session.date, session.time) ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">This session has passed</span>
                    </div>
                  ) : isUserJoined(session) ? (
                    <Button
                      onClick={() => handleLeaveSession(session.id)}
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave Session
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinSession(session.id)}
                      disabled={session.players.length >= session.maxPlayers}
                      size="sm"
                      className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Join Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {upcomingSessions.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming sessions</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create a new session or check back later for new activities
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-muted-foreground" />
          Past Sessions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pastSessions.slice(0, 6).map(session => (
            <Card key={session.id} className="bg-card border-border opacity-75">
              <CardHeader>
                <CardTitle className="text-foreground text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  {session.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {session.players.length} players participated
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}