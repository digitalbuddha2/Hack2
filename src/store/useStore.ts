import { create } from 'zustand';
import { User, Team, TeamRequest } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  teamRequests: TeamRequest[];

  // User actions
  setCurrentUser: (user: User | null) => void;
  registerUser: (user: Omit<User, 'id' | 'registrationTime'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Team actions
  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'members'>) => void;
  joinTeam: (teamId: string, userId: string) => void;
  leaveTeam: (teamId: string, userId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;

  // Team request actions
  sendTeamRequest: (teamId: string, userId: string, message: string) => void;
  respondToRequest: (requestId: string, status: 'accepted' | 'rejected') => void;

  // Utility actions
  getAvailableTeams: () => Team[];
  getTeamRequests: (teamId?: string) => TeamRequest[];
  getUsersLookingForTeam: () => User[];
}

// Generate mock data for demo
const generateMockUsers = (): User[] => {
  const names = ['Alex Chen', 'Maya Patel', 'Jordan Smith', 'Casey Wong', 'Riley Johnson', 'Taylor Brown', 'Morgan Davis', 'Avery Wilson'];
  const departments = ['Engineering', 'Design', 'Product', 'Data Science', 'Marketing', 'Operations'];
  const skills = ['React', 'Node.js', 'Python', 'Figma', 'TypeScript', 'AWS', 'Docker', 'GraphQL', 'Machine Learning', 'UI/UX'];

  return names.map((name, i) => ({
    id: `user_${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@airbnb.com`,
    role: ['Senior Engineer', 'Product Manager', 'Designer', 'Data Scientist'][i % 4],
    department: departments[i % departments.length],
    skills: skills.slice(i % 3, (i % 3) + 3),
    interests: ['AI/ML', 'Sustainability', 'Travel Tech', 'Mobile Apps'][i % 4] ? [['AI/ML', 'Sustainability', 'Travel Tech', 'Mobile Apps'][i % 4]] : [],
    experience: ['Beginner', 'Intermediate', 'Advanced'][i % 3] as User['experience'],
    lookingForTeam: i % 3 !== 0,
    registrationTime: Date.now() - (i * 100000),
    bio: `Passionate about building amazing products that help people belong anywhere!`,
    githubHandle: `${name.toLowerCase().replace(' ', '')}`,
    slackHandle: `@${name.toLowerCase().replace(' ', '.')}`
  }));
};

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: generateMockUsers(),
  teams: [],
  teamRequests: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  registerUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      registrationTime: Date.now(),
    };

    set((state) => ({
      users: [...state.users, newUser],
      currentUser: newUser,
    }));
  },

  updateUser: (userId, updates) => {
    set((state) => ({
      users: state.users.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      ),
      currentUser: state.currentUser?.id === userId
        ? { ...state.currentUser, ...updates }
        : state.currentUser,
    }));
  },

  createTeam: (teamData) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const newTeam: Team = {
      ...teamData,
      id: `team_${Date.now()}`,
      createdAt: Date.now(),
      members: [currentUser],
    };

    set((state) => ({
      teams: [...state.teams, newTeam],
      users: state.users.map(user =>
        user.id === currentUser.id
          ? { ...user, teamId: newTeam.id, lookingForTeam: false }
          : user
      ),
      currentUser: { ...currentUser, teamId: newTeam.id, lookingForTeam: false },
    }));
  },

  joinTeam: (teamId, userId) => {
    set((state) => {
      const team = state.teams.find(t => t.id === teamId);
      const user = state.users.find(u => u.id === userId);

      if (!team || !user || team.members.length >= team.maxMembers) return state;

      return {
        teams: state.teams.map(t =>
          t.id === teamId
            ? { ...t, members: [...t.members, user] }
            : t
        ),
        users: state.users.map(u =>
          u.id === userId
            ? { ...u, teamId, lookingForTeam: false }
            : u
        ),
        currentUser: state.currentUser?.id === userId
          ? { ...state.currentUser, teamId, lookingForTeam: false }
          : state.currentUser,
      };
    });
  },

  leaveTeam: (teamId, userId) => {
    set((state) => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== userId) }
          : team
      ),
      users: state.users.map(user =>
        user.id === userId
          ? { ...user, teamId: undefined, lookingForTeam: true }
          : user
      ),
      currentUser: state.currentUser?.id === userId
        ? { ...state.currentUser, teamId: undefined, lookingForTeam: true }
        : state.currentUser,
    }));
  },

  updateTeam: (teamId, updates) => {
    set((state) => ({
      teams: state.teams.map(team =>
        team.id === teamId ? { ...team, ...updates } : team
      ),
    }));
  },

  sendTeamRequest: (teamId, userId, message) => {
    const newRequest: TeamRequest = {
      id: `request_${Date.now()}`,
      teamId,
      userId,
      message,
      status: 'pending',
      createdAt: Date.now(),
    };

    set((state) => ({
      teamRequests: [...state.teamRequests, newRequest],
    }));
  },

  respondToRequest: (requestId, status) => {
    set((state) => {
      const request = state.teamRequests.find(r => r.id === requestId);
      if (!request) return state;

      const updatedRequests = state.teamRequests.map(r =>
        r.id === requestId ? { ...r, status } : r
      );

      if (status === 'accepted') {
        get().joinTeam(request.teamId, request.userId);
      }

      return { teamRequests: updatedRequests };
    });
  },

  getAvailableTeams: () => {
    const { teams } = get();
    return teams.filter(team =>
      team.isOpen && team.members.length < team.maxMembers
    );
  },

  getTeamRequests: (teamId) => {
    const { teamRequests } = get();
    return teamId
      ? teamRequests.filter(r => r.teamId === teamId)
      : teamRequests;
  },

  getUsersLookingForTeam: () => {
    const { users } = get();
    return users.filter(user => user.lookingForTeam && !user.teamId);
  },
}));