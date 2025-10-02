// Google Apps Script to handle CORS and provide API endpoints
// Deploy this as a Web App in Google Apps Script

// Sheet configuration
const SHEET_ID = 'your-google-sheet-id-here'; // Replace with your sheet ID
const USERS_SHEET = 'Users';
const TEAMS_SHEET = 'Teams';
const REQUESTS_SHEET = 'Requests';

// CORS headers
function setCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Main function that handles all requests
function doPost(e) {
  const headers = setCorsHeaders();

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result;

    switch (action) {
      case 'getUsers':
        result = getUsers();
        break;
      case 'addUser':
        result = addUser(data.user);
        break;
      case 'updateUser':
        result = updateUser(data.userId, data.updates);
        break;
      case 'getTeams':
        result = getTeams();
        break;
      case 'addTeam':
        result = addTeam(data.team);
        break;
      case 'updateTeam':
        result = updateTeam(data.teamId, data.updates);
        break;
      case 'joinTeam':
        result = joinTeam(data.teamId, data.userId);
        break;
      case 'leaveTeam':
        result = leaveTeam(data.teamId, data.userId);
        break;
      case 'sendTeamRequest':
        result = sendTeamRequest(data.teamId, data.userId, data.message);
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Handle OPTIONS requests for CORS
function doGet(e) {
  const headers = setCorsHeaders();
  return ContentService
    .createTextOutput('')
    .setHeaders(headers);
}

// User functions
function getUsers() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(USERS_SHEET);
  const data = sheet.getDataRange().getValues();

  // Skip header row
  return data.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    email: row[2],
    role: row[3],
    department: row[4],
    skills: row[5] ? row[5].split(',') : [],
    interests: row[6] ? row[6].split(',') : [],
    experience: row[7] || 'Intermediate',
    bio: row[8] || '',
    githubHandle: row[9] || '',
    slackHandle: row[10] || '',
    lookingForTeam: row[11] === 'TRUE',
    teamId: row[12] || null,
    registrationTime: parseInt(row[13]) || Date.now()
  }));
}

function addUser(user) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(USERS_SHEET);

  // Generate ID if not provided
  if (!user.id) {
    user.id = 'user_' + Date.now();
  }

  const row = [
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
    Date.now().toString()
  ];

  sheet.appendRow(row);
  return user;
}

function updateUser(userId, updates) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(USERS_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      // Update specific cells
      Object.keys(updates).forEach(key => {
        switch (key) {
          case 'name': sheet.getRange(i + 1, 2).setValue(updates[key]); break;
          case 'lookingForTeam':
            sheet.getRange(i + 1, 12).setValue(updates[key] ? 'TRUE' : 'FALSE');
            break;
          case 'teamId': sheet.getRange(i + 1, 13).setValue(updates[key] || ''); break;
        }
      });
      return true;
    }
  }
  return false;
}

// Team functions
function getTeams() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TEAMS_SHEET);
  const data = sheet.getDataRange().getValues();
  const users = getUsers(); // Get users to populate team members

  return data.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    description: row[2],
    leaderId: row[3],
    members: row[4] ? row[4].split(',').map(id =>
      users.find(u => u.id === id)).filter(Boolean) : [],
    maxMembers: parseInt(row[5]) || 4,
    requiredSkills: row[6] ? row[6].split(',') : [],
    tags: row[7] ? row[7].split(',') : [],
    isOpen: row[8] === 'TRUE',
    createdAt: parseInt(row[9]) || Date.now(),
    projectIdea: row[10] || ''
  }));
}

function addTeam(team) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TEAMS_SHEET);

  if (!team.id) {
    team.id = 'team_' + Date.now();
  }

  const row = [
    team.id,
    team.name,
    team.description,
    team.leaderId,
    team.leaderId, // Initial member is the leader
    team.maxMembers.toString(),
    team.requiredSkills.join(','),
    team.tags.join(','),
    'TRUE',
    Date.now().toString(),
    team.projectIdea || ''
  ];

  sheet.appendRow(row);

  // Update leader's teamId
  updateUser(team.leaderId, { teamId: team.id, lookingForTeam: false });

  return team;
}

function joinTeam(teamId, userId) {
  const teamsSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TEAMS_SHEET);
  const data = teamsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === teamId) {
      const currentMembers = data[i][4] ? data[i][4].split(',') : [];
      const maxMembers = parseInt(data[i][5]) || 4;

      if (currentMembers.length < maxMembers && !currentMembers.includes(userId)) {
        currentMembers.push(userId);
        teamsSheet.getRange(i + 1, 5).setValue(currentMembers.join(','));

        // Update user's team
        updateUser(userId, { teamId: teamId, lookingForTeam: false });
        return true;
      }
    }
  }
  return false;
}

function leaveTeam(teamId, userId) {
  const teamsSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TEAMS_SHEET);
  const data = teamsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === teamId) {
      const currentMembers = data[i][4] ? data[i][4].split(',') : [];
      const updatedMembers = currentMembers.filter(id => id !== userId);

      teamsSheet.getRange(i + 1, 5).setValue(updatedMembers.join(','));

      // Update user
      updateUser(userId, { teamId: '', lookingForTeam: true });
      return true;
    }
  }
  return false;
}

function sendTeamRequest(teamId, userId, message) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(REQUESTS_SHEET);

  const request = [
    'request_' + Date.now(),
    teamId,
    userId,
    message,
    'pending',
    Date.now().toString()
  ];

  sheet.appendRow(request);
  return request;
}

// Initialize sheets with headers
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Users sheet
  let usersSheet = ss.getSheetByName(USERS_SHEET);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(USERS_SHEET);
    usersSheet.getRange(1, 1, 1, 14).setValues([[
      'ID', 'Name', 'Email', 'Role', 'Department', 'Skills', 'Interests',
      'Experience', 'Bio', 'GitHub', 'Slack', 'Looking for Team', 'Team ID', 'Registration Time'
    ]]);
  }

  // Teams sheet
  let teamsSheet = ss.getSheetByName(TEAMS_SHEET);
  if (!teamsSheet) {
    teamsSheet = ss.insertSheet(TEAMS_SHEET);
    teamsSheet.getRange(1, 1, 1, 11).setValues([[
      'ID', 'Name', 'Description', 'Leader ID', 'Member IDs', 'Max Members',
      'Required Skills', 'Tags', 'Is Open', 'Created At', 'Project Idea'
    ]]);
  }

  // Requests sheet
  let requestsSheet = ss.getSheetByName(REQUESTS_SHEET);
  if (!requestsSheet) {
    requestsSheet = ss.insertSheet(REQUESTS_SHEET);
    requestsSheet.getRange(1, 1, 1, 6).setValues([[
      'ID', 'Team ID', 'User ID', 'Message', 'Status', 'Created At'
    ]]);
  }
}