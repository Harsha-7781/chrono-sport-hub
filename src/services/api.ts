import { User, Sport, Session, SessionPlayer } from "@/types";

// READ: Get base URL from environment variable VITE_API_BASE_URL (set in .env.local).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// --- MOCK DATA STORE (Moved outside to allow persistence for the current session) ---
const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@sports.com', password: 'admin123', name: 'Admin User', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', email: 'player@sports.com', password: 'player123', name: 'John Player', role: 'player', createdAt: '2024-01-01T00:00:00Z' },
];

const MOCK_SPORTS_LIST: Sport[] = [
  { id: '1', name: 'Basketball', description: 'Fast-paced team sport played on a court with hoops', maxPlayers: 10, createdBy: '1', createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Soccer', description: 'Popular team sport played with a ball on a grass field', maxPlayers: 22, createdBy: '1', createdAt: '2024-01-15T11:00:00Z' },
  { id: '3', name: 'Tennis', description: 'Racket sport played individually or in pairs', maxPlayers: 4, createdBy: '1', createdAt: '2024-01-15T12:00:00Z' },
];

const MOCK_SESSIONS_LIST: Session[] = [
  {
      id: '1', sportId: '1', title: 'Basketball Tournament', description: 'Weekly tournament', date: '2025-10-01', time: '18:00', duration: 120, maxPlayers: 10, location: 'Court A', createdBy: '1', status: 'upcoming', createdAt: '2024-09-28T09:00:00Z',
      players: [{ id: '1', sessionId: '1', userId: '1', joinedAt: '2024-09-29T10:00:00Z', status: 'joined' }],
  },
  {
      id: '2', sportId: '2', title: 'Soccer Practice', description: 'Friendly match', date: '2025-10-05', time: '16:30', duration: 90, maxPlayers: 22, location: 'Field B', createdBy: '2', status: 'upcoming', createdAt: '2024-09-29T09:00:00Z',
      players: [{ id: '3', sessionId: '2', userId: '1', joinedAt: '2024-09-29T10:00:00Z', status: 'joined' }],
  },
  {
      id: '3', sportId: '1', title: 'Past Game', description: 'Completed match', date: '2024-01-15', time: '08:00', duration: 60, maxPlayers: 8, location: 'Court B', createdBy: '1', players: [], status: 'completed', createdAt: '2024-01-10T09:00:00Z'
  },
];
// --- END MOCK DATA STORE ---


// --- API Utility (Placeholder for Axios/Fetch) ---

async function apiFetch<T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  token: string | null = null
): Promise<T> {
  // *** In a real application, the fetch implementation would go here. ***
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (endpoint === '/auth/login' && method === 'POST') {
    // Check against the mutable MOCK_USERS array
    const foundUser = MOCK_USERS.find(u => u.email === data.email && u.password === data.password);
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    const { password, ...userWithoutPassword } = foundUser;
    return { user: userWithoutPassword, token: 'mock-jwt-token-for-user-' + foundUser.id } as T;
  }

  if (endpoint === '/auth/register' && method === 'POST') {
    if (MOCK_USERS.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }
    
    // ACTION: Add the new user to the mock storage for the session
    const newUser: User & { password: string } = { 
        id: Date.now().toString(), 
        email: data.email, 
        password: data.password, // Store password for mock login check
        name: data.name, 
        role: data.role, 
        createdAt: new Date().toISOString() 
    };
    MOCK_USERS.push(newUser); 

    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token: 'mock-jwt-token-for-user-' + newUser.id } as T;
  }
  

  if (endpoint === '/sports' && method === 'GET') {
      return { sports: MOCK_SPORTS_LIST } as T;
  }

  if (endpoint === '/sports' && method === 'POST') {
    // Add the new sport to the mock list
    const newSport = {
      id: Date.now().toString(),
      ...data,
      createdBy: '1', // or use a mock user id
      createdAt: new Date().toISOString(),
    };
    MOCK_SPORTS_LIST.push(newSport);
    return newSport as T;
  }


  if (endpoint === '/sessions' && method === 'GET') {
      return { sessions: MOCK_SESSIONS_LIST } as T;
  }

  if (endpoint === '/sessions' && method === 'POST') {
    // Add the new session to the mock list
    const newSession = {
      id: Date.now().toString(),
      ...data,
      createdBy: '1', // or use a mock user id
      createdAt: new Date().toISOString(),
      players: [],
      status: 'upcoming',
    };
    MOCK_SESSIONS_LIST.push(newSession);
    return newSession as T;
  }

  // Mock join session logic
  if (endpoint.match(/^\/sessions\/(\d+)\/join$/) && method === 'POST') {
    const sessionId = endpoint.match(/^\/sessions\/(\d+)\/join$/)[1];
    const session = MOCK_SESSIONS_LIST.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    // For mock, always use userId '2' (player)
    const userId = '2';
    if (!session.players.some(p => p.userId === userId)) {
      session.players.push({
        id: Date.now().toString(),
        sessionId,
        userId,
        joinedAt: new Date().toISOString(),
        status: 'joined',
      });
    }
    return session as T;
  }
  
  if (endpoint.startsWith('/sports/') && method === 'DELETE') {
      return {} as T;
  }

  // Fallback for other calls
  return {} as T;
}


// --- Auth API ---

interface AuthResponse {
  user: User;
  token: string; // The JWT token from the backend
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', 'POST', { email, password }),
  
  register: (email: string, password: string, name: string, role: 'admin' | 'player') =>
    apiFetch<AuthResponse>('/auth/register', 'POST', { email, password, name, role }),
};

// --- Sports API ---

interface SportsResponse {
    sports: Sport[];
}

export const sportsApi = {
    getSports: (token: string) => 
        apiFetch<SportsResponse>('/sports', 'GET', null, token),
    
    createSport: (sportData: Omit<Sport, 'id' | 'createdBy' | 'createdAt'>, token: string) => 
        apiFetch<Sport>('/sports', 'POST', sportData, token),

    updateSport: (sportId: string, sportData: Partial<Omit<Sport, 'id' | 'createdBy' | 'createdAt'>>, token: string) => 
        apiFetch<Sport>(`/sports/${sportId}`, 'PUT', sportData, token),

    deleteSport: (sportId: string, token: string) => 
        apiFetch<void>(`/sports/${sportId}`, 'DELETE', null, token),
}

// --- Sessions API (Using explicit payload interface for type safety) ---

interface SessionsResponse {
    sessions: Session[];
}

export interface SessionCreatePayload {
    sportId: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number; // in minutes
    maxPlayers: number;
    location: string;
}

export const sessionsApi = {
    getSessions: (token: string) => 
        apiFetch<SessionsResponse>('/sessions', 'GET', null, token),
    
    createSession: (sessionData: SessionCreatePayload, token: string) => 
        apiFetch<Session>('/sessions', 'POST', sessionData, token),

    joinSession: (sessionId: string, token: string) => 
        apiFetch<SessionPlayer>(`/sessions/${sessionId}/join`, 'POST', null, token),
    
    leaveSession: (sessionId: string, token: string) => 
        apiFetch<void>(`/sessions/${sessionId}/leave`, 'POST', null, token),
}