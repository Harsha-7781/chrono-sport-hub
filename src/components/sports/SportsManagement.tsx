import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Sport } from '@/types';

// Mock sports data
const MOCK_SPORTS: Sport[] = [
  {
    id: '1',
    name: 'Basketball',
    description: 'Fast-paced team sport played on a court with hoops',
    maxPlayers: 10,
    createdBy: '1',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Soccer',
    description: 'Popular team sport played with a ball on a grass field',
    maxPlayers: 22,
    createdBy: '1',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '3',
    name: 'Tennis',
    description: 'Racket sport played individually or in pairs',
    maxPlayers: 4,
    createdBy: '1',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '4',
    name: 'Volleyball',
    description: 'Team sport where players hit a ball over a net',
    maxPlayers: 12,
    createdBy: '1',
    createdAt: '2024-01-15T13:00:00Z'
  },
];

export function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>(MOCK_SPORTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxPlayers: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSport) {
      // Update existing sport
      const updatedSport: Sport = {
        ...editingSport,
        name: formData.name,
        description: formData.description,
        maxPlayers: formData.maxPlayers,
      };
      
      setSports(prev => prev.map(sport => 
        sport.id === editingSport.id ? updatedSport : sport
      ));
      
      toast({
        title: "Sport updated",
        description: `${formData.name} has been updated successfully`,
      });
    } else {
      // Create new sport
      const newSport: Sport = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        maxPlayers: formData.maxPlayers,
        createdBy: '1', // Current user ID
        createdAt: new Date().toISOString(),
      };
      
      setSports(prev => [...prev, newSport]);
      
      toast({
        title: "Sport created",
        description: `${formData.name} has been added to the system`,
      });
    }

    // Reset form
    setFormData({ name: '', description: '', maxPlayers: 10 });
    setEditingSport(null);
    setIsCreateDialogOpen(false);
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

  const handleDelete = (sportId: string) => {
    setSports(prev => prev.filter(sport => sport.id !== sportId));
    toast({
      title: "Sport deleted",
      description: "Sport has been removed from the system",
    });
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
      {/* Header */}
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
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-accent-foreground"
                >
                  {editingSport ? 'Update Sport' : 'Create Sport'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sports Grid */}
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
                  <span>Active Sessions: 3</span>
                  <span>Total Players: 45</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sports.length === 0 && (
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