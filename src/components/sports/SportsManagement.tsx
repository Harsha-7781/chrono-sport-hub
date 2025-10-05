import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Users, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Sport } from '@/types';
import { sportsApi } from '@/services/api'; // <--- NEW IMPORT
import { useAuth } from '@/contexts/AuthContext'; // <--- NEW IMPORT

// NOTE: Mock data removed, logic updated to use API

export function SportsManagement() {
  const { user } = useAuth();
  // State variables for fetching and UI
  const [sports, setSports] = useState<Sport[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxPlayers: 10,
  });

  // --- Data Fetching Logic (Replace with React Query's useQuery for best results) ---
  const fetchSports = useCallback(async () => {
    const token = localStorage.getItem('sportsapp_token'); 
    if (!token) {
        setError("Authentication required.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        const response = await sportsApi.getSports(token);
        // Assuming your API returns { sports: Sport[] }
        setSports(response.sports); 
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(`Failed to fetch sports: ${message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);
  // --- End Data Fetching Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('sportsapp_token');

    if (!token) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      if (editingSport) {
        // --- API CALL FOR UPDATE ---
        const updateData: Partial<Omit<Sport, 'id' | 'createdBy' | 'createdAt'>> = {
            name: formData.name,
            description: formData.description,
            maxPlayers: formData.maxPlayers,
        }
        await sportsApi.updateSport(editingSport.id, updateData, token);
        
        toast({ title: "Sport updated", description: `${formData.name} has been updated successfully` });

      } else {
        // --- API CALL FOR CREATE ---
        const newSportData: Omit<Sport, 'id' | 'createdBy' | 'createdAt'> = {
          name: formData.name,
          description: formData.description,
          maxPlayers: formData.maxPlayers,
        };
        await sportsApi.createSport(newSportData, token);
        
        toast({ title: "Sport created", description: `${formData.name} has been added to the system` });
      }
      
      // Refresh the list after successful operation
      fetchSports(); 
      
      // Reset form
      setFormData({ name: '', description: '', maxPlayers: 10 });
      setEditingSport(null);
      setIsCreateDialogOpen(false);
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: editingSport ? "Update Failed" : "Creation Failed",
            description: message,
            variant: "destructive"
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description,
      maxPlayers: sport.maxPlayers,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (sportId: string) => {
    const token = localStorage.getItem('sportsapp_token');
    if (!window.confirm("Are you sure you want to delete this sport?")) return;
    if (!token) {
        toast({ title: "Error", description: "Authentication required.", variant: "destructive" });
        return;
    }
    
    try {
        // --- API CALL FOR DELETE ---
        await sportsApi.deleteSport(sportId, token);
        
        // Refresh the list after successful deletion
        fetchSports(); 
        
        toast({ title: "Sport deleted", description: "Sport has been removed from the system" });
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Deletion Failed",
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

  return (
    <div className="space-y-6">
      {/* Header (Dialog and Trigger logic remains the same) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sports Management</h1>
          <p className="text-muted-foreground">Create and manage sports categories</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground gap-2 shadow-glow"
              onClick={() => {
                setEditingSport(null);
                setFormData({ name: '', description: '', maxPlayers: 10 });
              }}
            >
              <Plus className="w-4 h-4" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingSport ? 'Edit Sport' : 'Create New Sport'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Sport Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Basketball"
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
                  placeholder="Brief description of the sport"
                  required
                  className="bg-background-secondary border-border focus:ring-accent min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers" className="text-foreground">Maximum Players</Label>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  max="50"
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
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingSport(null);
                  }}
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
                  {editingSport ? 'Update Sport' : 'Create Sport'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" />
          <p className="text-muted-foreground mt-2">Loading sports...</p>
        </div>
      )}

      {error && (
        <Card className="bg-destructive border-destructive/50">
          <CardContent className="py-4 text-destructive-foreground flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Sports Grid (Logic remains the same, using the new 'sports' state) */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sports.map(sport => (
            <Card key={sport.id} className="bg-card border-border hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <CardTitle className="text-foreground">{sport.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(sport)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(sport.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{sport.description}</p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm text-foreground">Max {sport.maxPlayers} players</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Created {new Date(sport.createdAt).toLocaleDateString()}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {/* Placeholder data needs to be replaced with data from the Sessions API */}
                    <span>Active Sessions: ?</span>
                    <span>Total Players: ?</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State (Logic remains the same, using the new 'sports' state) */}
      {!isLoading && !error && sports.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sports created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first sport category to organize sessions
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Sport
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}