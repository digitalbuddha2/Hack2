import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Target, Trophy, ArrowRight, Clock, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';

const HomePage = () => {
  const { users, teams, currentUser } = useStore();
  const totalParticipants = users.length;
  const totalTeams = teams.length;
  const availableSpots = teams.reduce((sum, team) => sum + (team.maxMembers - team.members.length), 0);

  const stats = [
    { label: 'Registered Hackers', value: totalParticipants, icon: Users, color: 'text-blue-600' },
    { label: 'Active Teams', value: totalTeams, icon: Zap, color: 'text-green-600' },
    { label: 'Available Spots', value: availableSpots, icon: Target, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-airbnb-red/10 via-pink-500/5 to-orange-400/10 rounded-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-airbnb-red/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Live Registration Open</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-airbnb-red via-pink-600 to-orange-500 bg-clip-text text-transparent mb-6">
            Hack2024
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join Airbnb's biggest hackathon yet! Build, innovate, and create the future of travel with your dream team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>December 8-10, 2024</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>Global • Remote & In-Person</span>
            </div>
          </div>

          {!currentUser ? (
            <div className="space-y-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
                <span>Join the Adventure</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500">
                🎉 7,000+ Airbnb employees expected to participate
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-4">
                Welcome back, <span className="font-semibold text-airbnb-red">{currentUser.name}</span>! 👋
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {currentUser.teamId ? (
                  <Link to="/teams" className="btn-primary inline-flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>View My Team</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/teams" className="btn-primary inline-flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Find a Team</span>
                    </Link>
                    <Link to="/teams" className="btn-secondary inline-flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Create Team</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Join Hack2024?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            More than just coding - it's about building connections, learning new skills, and creating impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Smart Team Matching',
              description: 'Find teammates with complementary skills and shared interests using our AI-powered matching system.',
              color: 'text-blue-600'
            },
            {
              icon: Zap,
              title: 'Real-time Collaboration',
              description: 'Connect instantly with team members, share ideas, and track your project progress in real-time.',
              color: 'text-green-600'
            },
            {
              icon: Trophy,
              title: 'Amazing Prizes',
              description: '$50K in prizes, mentorship opportunities, and potential product launches await the winning teams.',
              color: 'text-purple-600'
            }
          ].map((feature, index) => (
            <div key={index} className="card group hover:scale-105 transition-transform">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="bg-gradient-to-r from-airbnb-red to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of Airbnb engineers, designers, and product managers in the ultimate hackathon experience.
          </p>
          <Link to="/register" className="bg-white text-airbnb-red hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2">
            <span>Register Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      )}
    </div>
  );
};

export default HomePage;