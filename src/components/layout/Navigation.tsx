import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Trophy, Calendar, Settings, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const adminSections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sports', label: 'Manage Sports', icon: Trophy },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const playerSections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'my-sessions', label: 'My Sessions', icon: User },
  ];

  const sections = user?.role === 'admin' ? adminSections : playerSections;

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Sports Scheduler</h1>
            <p className="text-sm text-muted-foreground">Manage your sports</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 transition-smooth ${
                  activeSection === section.id 
                    ? "bg-accent text-accent-foreground shadow-glow" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-accent capitalize">{user?.role}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}