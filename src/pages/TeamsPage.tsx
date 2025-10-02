import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, Star, Clock, MapPin, MessageCircle, UserPlus, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Team, User } from '../types';
import toast from 'react-hot-toast';

const TeamsPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    teams,
    users,
    createTeam,
    sendTeamRequest,
    joinTeam,
    getAvailableTeams,
    getUsersLookingForTeam
  } = useStore();

  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'people'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    maxMembers: 4,
    requiredSkills: [] as string[],
    tags: [] as string[],
    projectIdea: '',
    isOpen: true
  });

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/register');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const availableTeams = getAvailableTeams();
  const peopleForTeams = getUsersLookingForTeam();
  const allSkills = Array.from(new Set(users.flatMap(user => user.skills)));

  const filteredTeams = availableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkills = selectedSkills.length === 0 ||
                         selectedSkills.some(skill => team.requiredSkills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.description) {
      toast.error('Please fill in team name and description');
      return;
    }

    createTeam(newTeam);
    toast.success('Team created successfully! 🎉');
    setShowCreateForm(false);
    setNewTeam({
      name: '',
      description: '',
      maxMembers: 4,
      requiredSkills: [],
      tags: [],
      projectIdea: '',
      isOpen: true
    });
  };

  const handleJoinRequest = (teamId: string) => {
    sendTeamRequest(teamId, currentUser.id, `Hi! I'd love to join your team. I bring ${currentUser.skills.slice(0, 3).join(', ')} skills and I'm excited about your project!`);
    toast.success('Join request sent! 📤');
  };

  const currentUserTeam = teams.find(team => team.id === currentUser.teamId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {currentUserTeam ? 'Your Team & Discovery' : 'Find Your Dream Team'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {currentUserTeam
            ? `You're part of "${currentUserTeam.name}". Explore other teams and find new collaborators!`
            : 'Discover amazing teams, create your own, or find individual contributors to join your mission.'
          }
        </p>
      </div>

      {/* Current Team Display */}
      {currentUserTeam && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {currentUserTeam.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentUserTeam.name}</h3>
                  <p className="text-sm text-gray-600">Your Team</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{currentUserTeam.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentUserTeam.members.map(member => (
                  <div key={member.id} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex space-x-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-white text-airbnb-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Browse Teams
          </button>
          {!currentUserTeam && (
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-white text-airbnb-red shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Team
            </button>
          )}
          <button
            onClick={() => setActiveTab('people')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'people'
                ? 'bg-white text-airbnb-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Find People
          </button>
        </div>
      </div>

      {/* Browse Teams Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search teams by name or description..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="input min-w-48"
                  value={selectedSkills[0] || ''}
                  onChange={(e) => setSelectedSkills(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Filter by skill</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} onJoinRequest={handleJoinRequest} currentUser={currentUser} />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or create a new team!</p>
              {!currentUserTeam && (
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Create Your Team
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Team Tab */}
      {activeTab === 'create' && !currentUserTeam && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleCreateTeam} className="card space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Your Team</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                className="input"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter your team name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                className="input h-24 resize-none"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                placeholder="Describe your team's mission and what you plan to build"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Idea
              </label>
              <textarea
                className="input h-20 resize-none"
                value={newTeam.projectIdea}
                onChange={(e) => setNewTeam({ ...newTeam, projectIdea: e.target.value })}
                placeholder="Share your initial project idea (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Team Size
              </label>
              <select
                className="input"
                value={newTeam.maxMembers}
                onChange={(e) => setNewTeam({ ...newTeam, maxMembers: parseInt(e.target.value) })}
              >
                <option value={2}>2 members</option>
                <option value={3}>3 members</option>
                <option value={4}>4 members</option>
                <option value={5}>5 members</option>
                <option value={6}>6 members</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Skills
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allSkills.slice(0, 15).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setNewTeam({
                      ...newTeam,
                      requiredSkills: newTeam.requiredSkills.includes(skill)
                        ? newTeam.requiredSkills.filter(s => s !== skill)
                        : [...newTeam.requiredSkills, skill]
                    })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newTeam.requiredSkills.includes(skill)
                        ? 'bg-airbnb-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Create Team 🚀
            </button>
          </form>
        </div>
      )}

      {/* Find People Tab */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peopleForTeams.slice(0, 12).map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TeamCard: React.FC<{
  team: Team;
  onJoinRequest: (teamId: string) => void;
  currentUser: User;
}> = ({ team, onJoinRequest, currentUser }) => {
  const spotsLeft = team.maxMembers - team.members.length;
  const isUserInTeam = team.members.some(m => m.id === currentUser.id);
  const hasUserRequested = false; // TODO: Implement request tracking

  return (
    <div className="card hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-600">{spotsLeft} spots left</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Open
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{team.description}</p>

      {team.projectIdea && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium">Project Idea:</p>
          <p className="text-sm text-gray-700 mt-1">{team.projectIdea}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {team.requiredSkills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {skill}
          </span>
        ))}
        {team.requiredSkills.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{team.requiredSkills.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.members.slice(0, 3).map(member => (
            <div
              key={member.id}
              className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
              title={member.name}
            >
              {member.name.charAt(0)}
            </div>
          ))}
          {team.members.length > 3 && (
            <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">
              +{team.members.length - 3}
            </div>
          )}
        </div>

        {!isUserInTeam && !currentUser.teamId && (
          <button
            onClick={() => onJoinRequest(team.id)}
            disabled={hasUserRequested}
            className="btn-primary text-sm px-4 py-2"
          >
            {hasUserRequested ? 'Requested' : 'Join Team'}
          </button>
        )}
      </div>
    </div>
  );
};

const PersonCard: React.FC<{ person: User }> = ({ person }) => {
  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
          {person.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-600">{person.role}</p>
          <p className="text-xs text-gray-500">{person.department}</p>
        </div>
      </div>

      {person.bio && (
        <p className="text-sm text-gray-700 mt-3 line-clamp-2">{person.bio}</p>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {person.skills.slice(0, 4).map(skill => (
          <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {skill}
          </span>
        ))}
        {person.skills.length > 4 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{person.skills.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">{person.experience}</span>
        <button className="btn-secondary text-sm px-4 py-2">
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Connect
        </button>
      </div>
    </div>
  );
};

export default TeamsPage;