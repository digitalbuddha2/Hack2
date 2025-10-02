import React, { useState } from 'react';
import { User, Edit, Save, X, Github, MessageSquare, Users, Star, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { currentUser, updateUser, teams } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(currentUser || {} as any);

  if (!currentUser) return null;

  const userTeam = teams.find(team => team.id === currentUser.teamId);

  const handleSave = () => {
    updateUser(currentUser.id, editData);
    setIsEditing(false);
    toast.success('Profile updated successfully! ✨');
  };

  const handleCancel = () => {
    setEditData(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Profile</h1>
        <p className="text-lg text-gray-600">
          Manage your information and showcase your skills to potential teammates
        </p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-airbnb-red to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.role}</p>
              <p className="text-sm text-gray-500">{currentUser.department}</p>
            </div>
          </div>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="btn-primary"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {isEditing && (
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="btn-secondary mr-3"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900">{currentUser.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editData.role || ''}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900">{currentUser.role}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                {isEditing ? (
                  <select
                    className="input"
                    value={editData.experience || 'Intermediate'}
                    onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-900">{currentUser.experience}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Handle</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editData.githubHandle || ''}
                    onChange={(e) => setEditData({ ...editData, githubHandle: e.target.value })}
                    placeholder="@username"
                  />
                ) : currentUser.githubHandle ? (
                  <div className="flex items-center space-x-2">
                    <Github className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">@{currentUser.githubHandle}</span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Not provided</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slack Handle</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    value={editData.slackHandle || ''}
                    onChange={(e) => setEditData({ ...editData, slackHandle: e.target.value })}
                    placeholder="@your.name"
                  />
                ) : currentUser.slackHandle ? (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">{currentUser.slackHandle}</span>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">About Me</h3>
          {isEditing ? (
            <textarea
              className="input h-24 resize-none"
              value={editData.bio || ''}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="Tell everyone about yourself, your interests, and what you're hoping to achieve in the hackathon..."
            />
          ) : currentUser.bio ? (
            <p className="text-gray-700">{currentUser.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio provided yet</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {currentUser.skills.map(skill => (
            <span key={skill} className="px-3 py-1 bg-airbnb-red text-white rounded-full text-sm font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {currentUser.interests.map(interest => (
            <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Current Team */}
      {userTeam && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Your Team: {userTeam.name}
          </h3>
          <p className="text-gray-700 mb-4">{userTeam.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Team Members</h4>
              <div className="space-y-2">
                {userTeam.members.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                    {member.id === userTeam.leaderId && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-1">
                {userTeam.requiredSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Info */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Registration Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Registration Date</p>
            <p className="font-medium text-gray-900">
              {new Date(currentUser.registrationTime).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="font-medium text-green-700">Registered</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">Team Status</p>
            <p className="font-medium text-gray-900">
              {userTeam ? 'In Team' : 'Looking for Team'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;