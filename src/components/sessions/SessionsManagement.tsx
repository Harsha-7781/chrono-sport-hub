import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, MapPin, Clock, Trophy, UserCheck, UserMinus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Session, Sport } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { sportsApi, sessionsApi, SessionCreatePayload } from '@/services/api'; // <--- NEW IMPORTS & TYPE

// NOTE: Mock data removed, logic updated to use API

export function SessionsManagement() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sportId: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    duration: 60,
    location: '',
    maxPlayers: 10,
  });
  
  // --- Data Fetching Logic (Replace with React Query's useQuery for best results) ---
  const fetchAllData = useCallback(async () => {
    const token = localStorage.getItem('sportsapp_token'); 
    if (!token) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
        // Fetch Sports
        const sportsResponse = await sportsApi.getSports(token);
        setSports(sportsResponse.sports);

        // Fetch Sessions
        const sessionsResponse = await sessionsApi.getSessions(token);
        setSessions(sessionsResponse.sessions); 
        
    } catch (err) {
        toast({ title: "Error", description: "Failed to load sessions and sports.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  // --- End Data Fetching Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('sportsapp_token');

    const selectedSport = sports.find(sport => sport.id === formData.sportId);
    if (!selectedSport || !token) {
      toast({
        title: "Error",
        description: "Please select a sport and ensure you are logged in.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the imported SessionCreatePayload type from api.ts
      const newSessionData: SessionCreatePayload = {
        sportId: formData.sportId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        // Enforce maxPlayers limit from the selected sport
        maxPlayers: Math.min(formData.maxPlayers, selectedSport.maxPlayers), 
        location: formData.location,
      };

      await sessionsApi.createSession(newSessionData, token);
    
      toast({
        title: "Session created",
        description: `${formData.title} has been scheduled successfully`,
      });

      // Refresh data
      fetchAllData(); 

      // Reset form
      setFormData({
        sportId: '', title: '', description: '', 
        date: new Date().toISOString().split('T')[0], time: '18:00', 
        duration: 60, location: '', maxPlayers: 10,
      });
      setIsCreateDialogOpen(false);
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Creation Failed",
            description: message,
            variant: "destructive"
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    const sessionToJoin = sessions.find(s => s.id === sessionId);
    const token = localStorage.getItem('sportsapp_token');
    
    if (!user || !token) {
        toast({ title: "Error", description: "You must be logged in to join.", variant: "destructive" });
        return;
    }
    
    // Safety check: ensure session exists
    if (!sessionToJoin) {
        toast({ title: "Error", description: "Session not found.", variant: "destructive" });
        return;
    }

    if (isUserJoined(sessionToJoin)) return;
    
    if (sessionToJoin.players.length >= sessionToJoin.maxPlayers) { 
        toast({ title: "Session full", description: "This session has reached maximum capacity", variant: "destructive" });
        return;
    }

    try {
      // --- API CALL TO JOIN SESSION ---
      await sessionsApi.joinSession(sessionId, token);

      toast({
        title: "Joined session",
        description: `You've successfully joined ${sessionToJoin.title}`,
      });
      
      // Refresh data
      fetchAllData(); 

    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Join Failed",
            description: message,
            variant: "destructive"
        });
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    const sessionToLeave = sessions.find(s => s.id === sessionId);
    const token = localStorage.getItem('sportsapp_token');
    
    if (!user || !token) {
        toast({ title: "Error", description: "You must be logged in to leave.", variant: "destructive" });
        return;
    }

    try {
      // --- API CALL TO LEAVE SESSION ---
      await sessionsApi.leaveSession(sessionId, token);
        
      toast({
        title: "Left session",
        description: `You've left ${sessionToLeave?.title}`,
      });
      
      // Refresh data
      fetchAllData();

    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Leave Failed",
            description: message,
            variant: "destructive"
        });
    }
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
    // Correct logic to check against current date/time
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
        <p className="text-muted-foreground mt-2">Loading sessions and sports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (Creation Dialog uses new data/API logic) */}
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
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent-hover text-accent-foreground"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions (View Logic uses new 'sessions' state) */}
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
                      disabled={session.players.length >= session.maxPlayers || !user}
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

      {/* Past Sessions (View Logic uses new 'sessions' state) */}
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