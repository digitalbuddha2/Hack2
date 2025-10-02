export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  skills: string[];
  interests: string[];
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  avatar?: string;
  bio?: string;
  githubHandle?: string;
  slackHandle?: string;
  lookingForTeam: boolean;
  teamId?: string;
  registrationTime: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: User[];
  maxMembers: number;
  requiredSkills: string[];
  tags: string[];
  isOpen: boolean;
  createdAt: number;
  projectIdea?: string;
}

export interface TeamRequest {
  id: string;
  userId: string;
  teamId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface HackathonStats {
  totalParticipants: number;
  totalTeams: number;
  availableSpots: number;
  popularSkills: string[];
}