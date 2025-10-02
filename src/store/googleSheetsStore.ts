import { create } from 'zustand';
import { User, Team, TeamRequest } from '../types';

interface GoogleSheetsState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  teamRequests: TeamRequest[];
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  registerUser: (user: Omit<User, 'id' | 'registrationTime'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'members'>) => Promise<void>;
  joinTeam: (teamId: string, userId: string) => Promise<void>;
  leaveTeam: (teamId: string, userId: string) => Promise<void>;
  sendTeamRequest: (teamId: string, userId: string, message: string) => Promise<void>;

  // Data fetching
  fetchUsers: () => Promise<void>;
  fetchTeams: () => Promise<void>;

  // Utility actions
  getAvailableTeams: () => Team[];
  getUsersLookingForTeam: () => User[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Replace this with your deployed Google Apps Script URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

class GoogleSheetsAPI {
  private async makeRequest(action: string, data: any = {}) {
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      return result.data;
    } catch (error) {
      console.error('Google Sheets API error:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    return this.makeRequest('getUsers');
  }

  async addUser(user: Omit<User, 'id' | 'registrationTime'>): Promise<User> {
    return this.makeRequest('addUser', { user });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    return this.makeRequest('updateUser', { userId, updates });
  }

  async getTeams(): Promise<Team[]> {
    return this.makeRequest('getTeams');
  }

  async addTeam(team: any): Promise<Team> {
    return this.makeRequest('addTeam', { team });
  }

  async joinTeam(teamId: string, userId: string): Promise<boolean> {
    return this.makeRequest('joinTeam', { teamId, userId });
  }

  async leaveTeam(teamId: string, userId: string): Promise<boolean> {
    return this.makeRequest('leaveTeam', { teamId, userId });
  }

  async sendTeamRequest(teamId: string, userId: string, message: string): Promise<any> {
    return this.makeRequest('sendTeamRequest', { teamId, userId, message });
  }
}

const api = new GoogleSheetsAPI();

export const useGoogleSheetsStore = create<GoogleSheetsState>((set, get) => ({
  currentUser: null,
  users: [],
  teams: [],
  teamRequests: [],
  loading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const users = await api.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTeams: async () => {
    try {
      set({ loading: true, error: null });
      const teams = await api.getTeams();
      set({ teams, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  registerUser: async (userData) => {
    try {
      set({ loading: true, error: null });
      const newUser = await api.addUser(userData);

      set((state) => ({
        users: [...state.users, newUser],
        currentUser: newUser,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      set({ loading: true, error: null });
      await api.updateUser(userId, updates);

      set((state) => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        ),
        currentUser: state.currentUser?.id === userId
          ? { ...state.currentUser, ...updates }
          : state.currentUser,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  createTeam: async (teamData) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No current user');

    try {
      set({ loading: true, error: null });

      const teamToCreate = {
        ...teamData,
        leaderId: currentUser.id,
      };

      const newTeam = await api.addTeam(teamToCreate);

      // The API handles updating the user's teamId
      await get().fetchUsers(); // Refresh to get updated user data
      await get().fetchTeams(); // Refresh to get updated team data

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  joinTeam: async (teamId, userId) => {
    try {
      set({ loading: true, error: null });
      await api.joinTeam(teamId, userId);

      // Refresh data
      await get().fetchUsers();
      await get().fetchTeams();

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  leaveTeam: async (teamId, userId) => {
    try {
      set({ loading: true, error: null });
      await api.leaveTeam(teamId, userId);

      // Refresh data
      await get().fetchUsers();
      await get().fetchTeams();

      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  sendTeamRequest: async (teamId, userId, message) => {
    try {
      set({ loading: true, error: null });
      const request = await api.sendTeamRequest(teamId, userId, message);

      set((state) => ({
        teamRequests: [...state.teamRequests, {
          id: request[0],
          teamId: request[1],
          userId: request[2],
          message: request[3],
          status: request[4] as 'pending',
          createdAt: parseInt(request[5])
        }],
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getAvailableTeams: () => {
    const { teams } = get();
    return teams.filter(team =>
      team.isOpen && team.members.length < team.maxMembers
    );
  },

  getUsersLookingForTeam: () => {
    const { users } = get();
    return users.filter(user => user.lookingForTeam && !user.teamId);
  },
}));