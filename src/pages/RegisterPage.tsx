import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Code, Heart, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, currentUser } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    skills: [] as string[],
    interests: [] as string[],
    experience: 'Intermediate' as const,
    bio: '',
    githubHandle: '',
    slackHandle: '',
    lookingForTeam: true,
  });

  const skillOptions = [
    'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'Go', 'Java', 'Kotlin',
    'Swift', 'Figma', 'Sketch', 'Adobe XD', 'UI/UX Design', 'Product Management',
    'Data Science', 'Machine Learning', 'AI', 'DevOps', 'AWS', 'Docker', 'Kubernetes',
    'GraphQL', 'REST APIs', 'Microservices', 'Mobile Development', 'Backend Development',
    'Frontend Development', 'Full Stack', 'QA Testing', 'Analytics'
  ];

  const interestOptions = [
    'AI/ML', 'Sustainability', 'Travel Tech', 'Mobile Apps', 'Web Development',
    'Data Visualization', 'User Experience', 'Accessibility', 'Performance',
    'Security', 'Blockchain', 'IoT', 'AR/VR', 'Gaming', 'Social Impact',
    'FinTech', 'HealthTech', 'EdTech', 'Climate Tech', 'Developer Tools'
  ];

  const departmentOptions = [
    'Engineering', 'Design', 'Product', 'Data Science', 'Marketing',
    'Operations', 'Legal', 'Finance', 'HR', 'Sales', 'Customer Support'
  ];

  React.useEffect(() => {
    if (currentUser) {
      navigate('/teams');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    registerUser(formData);
    toast.success('Welcome to Hack2024! 🎉');
    navigate('/teams');
  };

  const toggleSelection = (array: string[], value: string, maxSelections = 10) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else if (array.length < maxSelections) {
      return [...array, value];
    } else {
      toast.error(`You can select up to ${maxSelections} items`);
      return array;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-airbnb-red to-pink-600 text-white rounded-full px-6 py-3 mb-6">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Join the Adventure</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Register for Hack2024
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about yourself so we can help you find the perfect team and create something amazing together.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <User className="w-6 h-6 text-airbnb-red" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@airbnb.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role/Title *
              </label>
              <input
                type="text"
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                className="input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <div className="flex space-x-4">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experience"
                    value={level}
                    checked={formData.experience === level}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value as any })}
                    className="text-airbnb-red focus:ring-airbnb-red"
                  />
                  <span className="text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Code className="w-6 h-6 text-airbnb-red" />
            <span>Skills & Expertise</span>
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Technical Skills * (Select up to 10)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    skills: toggleSelection(formData.skills, skill, 10)
                  })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.skills.includes(skill)
                      ? 'bg-airbnb-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Heart className="w-6 h-6 text-airbnb-red" />
            <span>Interests & Goals</span>
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What interests you? (Select up to 5)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    interests: toggleSelection(formData.interests, interest, 5)
                  })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-airbnb-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about yourself
            </label>
            <textarea
              className="input h-24 resize-none"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="What drives you? What are you hoping to build or learn during the hackathon?"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Building className="w-6 h-6 text-airbnb-red" />
            <span>Connect & Collaborate</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Handle
              </label>
              <input
                type="text"
                className="input"
                value={formData.githubHandle}
                onChange={(e) => setFormData({ ...formData, githubHandle: e.target.value })}
                placeholder="@yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slack Handle
              </label>
              <input
                type="text"
                className="input"
                value={formData.slackHandle}
                onChange={(e) => setFormData({ ...formData, slackHandle: e.target.value })}
                placeholder="@your.name"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lookingForTeam}
                onChange={(e) => setFormData({ ...formData, lookingForTeam: e.target.checked })}
                className="text-airbnb-red focus:ring-airbnb-red rounded"
              />
              <span className="text-gray-700">I'm looking for a team to join</span>
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button type="submit" className="btn-primary text-lg px-12 py-4">
            Join Hack2024! 🚀
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;