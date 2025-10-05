export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'player';
  createdAt: string;
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  maxPlayers: number;
  createdBy: string;
  createdAt: string;
}

export interface Session {
  id: string;
  sportId: string;
  sport?: Sport;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // in minutes
  maxPlayers: number;
  location: string;
  createdBy: string;
  createdByUser?: User;
  players: SessionPlayer[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface SessionPlayer {
  id: string;
  sessionId: string;
  userId: string;
  user?: User;
  joinedAt: string;
  status: 'joined' | 'cancelled';
  cancellationReason?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'admin' | 'player') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}