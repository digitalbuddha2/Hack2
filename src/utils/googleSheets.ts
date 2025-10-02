// Google Sheets API configuration and utilities
const GOOGLE_SHEETS_CONFIG = {
  // You'll need to replace these with your actual values
  SHEET_ID: 'your-google-sheet-id-here',
  API_KEY: 'your-google-api-key-here',
  USERS_RANGE: 'Users!A:M',
  TEAMS_RANGE: 'Teams!A:J',
  REQUESTS_RANGE: 'Requests!A:F'
};

class GoogleSheetsAPI {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(private sheetId: string, private apiKey: string) {}

  private async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Sheets API error:', error);
      throw error;
    }
  }

  // Read data from a range
  async readRange(range: string) {
    const url = `${this.baseUrl}/${this.sheetId}/values/${range}?key=${this.apiKey}`;
    const data = await this.makeRequest(url);
    return data.values || [];
  }

  // Append data to a sheet
  async appendData(range: string, values: any[][]) {
    const url = `${this.baseUrl}/${this.sheetId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`;

    const response = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        values: values
      }),
    });

    return response;
  }

  // Update specific cells
  async updateRange(range: string, values: any[][]) {
    const url = `${this.baseUrl}/${this.sheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;

    const response = await this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        values: values
      }),
    });

    return response;
  }

  // Clear a range
  async clearRange(range: string) {
    const url = `${this.baseUrl}/${this.sheetId}/values/${range}:clear?key=${this.apiKey}`;

    const response = await this.makeRequest(url, {
      method: 'POST',
    });

    return response;
  }
}

// Helper functions to convert between objects and sheet rows
export const userToRow = (user: User): any[] => [
  user.id,
  user.name,
  user.email,
  user.role,
  user.department,
  user.skills.join(','),
  user.interests.join(','),
  user.experience,
  user.bio || '',
  user.githubHandle || '',
  user.slackHandle || '',
  user.lookingForTeam ? 'TRUE' : 'FALSE',
  user.teamId || '',
  user.registrationTime.toString()
];

export const rowToUser = (row: any[]): User => ({
  id: row[0] || '',
  name: row[1] || '',
  email: row[2] || '',
  role: row[3] || '',
  department: row[4] || '',
  skills: row[5] ? row[5].split(',').filter(Boolean) : [],
  interests: row[6] ? row[6].split(',').filter(Boolean) : [],
  experience: (row[7] || 'Intermediate') as User['experience'],
  bio: row[8] || '',
  githubHandle: row[9] || '',
  slackHandle: row[10] || '',
  lookingForTeam: row[11] === 'TRUE',
  teamId: row[12] || undefined,
  registrationTime: parseInt(row[13]) || Date.now()
});

export const teamToRow = (team: Team): any[] => [
  team.id,
  team.name,
  team.description,
  team.leaderId,
  team.members.map(m => m.id).join(','),
  team.maxMembers.toString(),
  team.requiredSkills.join(','),
  team.tags.join(','),
  team.isOpen ? 'TRUE' : 'FALSE',
  team.createdAt.toString(),
  team.projectIdea || ''
];

export const rowToTeam = (row: any[], allUsers: User[]): Team => ({
  id: row[0] || '',
  name: row[1] || '',
  description: row[2] || '',
  leaderId: row[3] || '',
  members: row[4] ? row[4].split(',').map((id: string) =>
    allUsers.find(u => u.id === id)).filter(Boolean) : [],
  maxMembers: parseInt(row[5]) || 4,
  requiredSkills: row[6] ? row[6].split(',').filter(Boolean) : [],
  tags: row[7] ? row[7].split(',').filter(Boolean) : [],
  isOpen: row[8] === 'TRUE',
  createdAt: parseInt(row[9]) || Date.now(),
  projectIdea: row[10] || ''
});

// Initialize the API client
export const sheetsAPI = new GoogleSheetsAPI(
  GOOGLE_SHEETS_CONFIG.SHEET_ID,
  GOOGLE_SHEETS_CONFIG.API_KEY
);

export { GOOGLE_SHEETS_CONFIG };