'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function MemberDashboard() {
  const { } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<{id?: number; fullName?: string; email: string; role?: string} | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [memberInvestments, setMemberInvestments] = useState<any[]>([]);
  const [memberTraining, setMemberTraining] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication and load member data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect admins to admin dashboard
      if (parsedUser.role === 'admin') {
        router.push('/dashboard');
        return;
      }
      
      // Load member data
      loadMemberData(parsedUser.id);
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadMemberData = async (userId: number) => {
    try {
      setLoading(true);
      
      // Load member profile
      const profileResponse = await fetch(`/api/members/profile?userId=${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setMemberProfile(profileData);
      }
      
      // Load member investments
      const investmentsResponse = await fetch(`/api/members/investments?userId=${userId}`);
      if (investmentsResponse.ok) {
        const investmentsData = await investmentsResponse.json();
        setMemberInvestments(investmentsData);
      }
      
      // Load member training
      const trainingResponse = await fetch(`/api/members/training?userId=${userId}`);
      if (trainingResponse.ok) {
        const trainingData = await trainingResponse.json();
        setMemberTraining(trainingData);
      }
      
      // Load recent activities
      const activitiesResponse = await fetch(`/api/members/activities?userId=${userId}`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inapakia...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', name: 'Muhtasari', icon: ChartBarIcon },
    { id: 'profile', name: 'Wasifu', icon: UserIcon },
    { id: 'group', name: 'Kundi Langu', icon: UserGroupIcon },
    { id: 'investments', name: 'Uwekezaji Wangu', icon: CurrencyDollarIcon },
    { id: 'learning', name: 'Mafunzo', icon: AcademicCapIcon },
    { id: 'settings', name: 'Mipangilio', icon: CogIcon },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <MemberOverviewSection memberProfile={memberProfile} memberInvestments={memberInvestments} recentActivities={recentActivities} />;
      case 'profile':
        return <ProfileSection memberProfile={memberProfile} user={user} loadMemberData={() => loadMemberData(user?.id || 0)} />;
      case 'group':
        return <MyGroupSection memberProfile={memberProfile} />;
      case 'investments':
        return <MyInvestmentsSection memberInvestments={memberInvestments} />;
      case 'learning':
        return <LearningSection memberTraining={memberTraining} user={user} />;
      case 'settings':
        return <MemberSettingsSection />;
      default:
        return <MemberOverviewSection memberProfile={memberProfile} memberInvestments={memberInvestments} recentActivities={recentActivities} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <span className="text-lg font-bold text-white">J</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JUKUMU</h1>
                <p className="text-sm text-gray-600">Karibu, {user.fullName || user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Toka</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberOverviewSection({ memberProfile, memberInvestments, recentActivities }: { memberProfile: any; memberInvestments: any[]; recentActivities: any[] }) {
  const totalInvestment = memberInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const expectedReturns = memberInvestments.reduce((sum, inv) => sum + parseFloat(inv.expected_return || 0), 0);
  
  const stats = [
    { name: 'Hali ya Uanachama', value: memberProfile?.status === 'active' ? 'Hai' : 'Inasubiri', color: memberProfile?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500' },
    { name: 'Kundi Langu', value: memberProfile?.group_name || 'Hakuna', color: 'bg-blue-500' },
    { name: 'Uwekezaji Wangu', value: totalInvestment > 0 ? `TSH ${totalInvestment.toLocaleString()}` : 'TSH 0', color: 'bg-orange-500' },
    { name: 'Mapato Yanayotarajiwa', value: expectedReturns > 0 ? `TSH ${expectedReturns.toLocaleString()}` : 'TSH 0', color: 'bg-purple-500' },
  ];

  const displayActivities = recentActivities.length > 0 ? recentActivities.map(activity => ({
    action: activity.action_text,
    time: new Date(activity.activity_date).toLocaleDateString('sw-TZ')
  })) : [
    { action: 'Umejiunge na JUKUMU', time: memberProfile?.created_at ? new Date(memberProfile.created_at).toLocaleDateString('sw-TZ') : 'Leo' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shughuli za Hivi Karibuni</h3>
          <div className="space-y-4">
            {displayActivities.slice(0, 4).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitendo vya Haraka</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Soma Mafunzo Mapya</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Jiunge na Kundi</span>
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Ongeza Uwekezaji</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ memberProfile, user, loadMemberData }: { memberProfile: any; user: any; loadMemberData: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: memberProfile?.full_name || '',
    phone: memberProfile?.phone || '',
    location: memberProfile?.location || '',
    businessType: memberProfile?.business_type || '',
    businessName: memberProfile?.business_name || '',
    businessDescription: memberProfile?.business_description || '',
    monthlyRevenue: memberProfile?.monthly_revenue || '',
    employeeCount: memberProfile?.employee_count || ''
  });

  useEffect(() => {
    if (memberProfile) {
      setFormData({
        fullName: memberProfile.full_name || '',
        phone: memberProfile.phone || '',
        location: memberProfile.location || '',
        businessType: memberProfile.business_type || '',
        businessName: memberProfile.business_name || '',
        businessDescription: memberProfile.business_description || '',
        monthlyRevenue: memberProfile.monthly_revenue || '',
        employeeCount: memberProfile.employee_count || ''
      });
    }
  }, [memberProfile]);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/members/profile?userId=${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsEditing(false);
        loadMemberData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Wasifu Wangu</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          {isEditing ? 'Hifadhi' : 'Hariri'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jina Kamili</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barua Pepe</label>
          <input
            type="email"
            value={memberProfile?.email || user?.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Simu</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mahali</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aina ya Biashara</label>
          <input
            type="text"
            value={formData.businessType}
            onChange={(e) => setFormData({...formData, businessType: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jina la Biashara</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Maelezo ya Biashara</label>
        <textarea
          value={formData.businessDescription}
          onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
          disabled={!isEditing}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mapato ya Kila Mwezi (TSH)</label>
          <input
            type="number"
            value={formData.monthlyRevenue}
            onChange={(e) => setFormData({...formData, monthlyRevenue: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Idadi ya Wafanyakazi</label>
          <input
            type="number"
            value={formData.employeeCount}
            onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

function MyGroupSection({ memberProfile }: { memberProfile: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Kundi Langu</h2>
      {memberProfile?.group_name ? (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">{memberProfile.group_name}</h3>
            <p className="text-sm text-gray-600 mt-1">Nafasi: {memberProfile.group_role || 'Mwanachama'}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Hali</p>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Hai
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Haujajiunga na kundi lolote bado.</p>
          <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Jiunge na Kundi
          </button>
        </div>
      )}
    </div>
  );
}

function MyInvestmentsSection({ memberInvestments }: { memberInvestments: any[] }) {
  const totalInvestment = memberInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const totalReturns = memberInvestments.reduce((sum, inv) => sum + parseFloat(inv.actual_return || 0), 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Uwekezaji Wangu</h2>
      
      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900">Jumla ya Uwekezaji</h3>
          <p className="text-xl font-bold text-blue-600">TSH {totalInvestment.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-900">Mapato Halisi</h3>
          <p className="text-xl font-bold text-green-600">TSH {totalReturns.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-900">Kiwango cha Mapato</h3>
          <p className="text-xl font-bold text-orange-600">
            {totalInvestment > 0 ? ((totalReturns / totalInvestment) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
      
      {/* Investments List */}
      {memberInvestments.length > 0 ? (
        <div className="space-y-4">
          {memberInvestments.map((investment, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{investment.group_name}</h3>
                  <p className="text-sm text-gray-600">Tarehe: {new Date(investment.investment_date).toLocaleDateString('sw-TZ')}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  investment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {investment.status === 'active' ? 'Hai' : 'Inasubiri'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Kiasi</p>
                  <p className="font-medium">TSH {parseFloat(investment.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Asilimia</p>
                  <p className="font-medium">{investment.equity_percentage}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Mapato Yanayotarajiwa</p>
                  <p className="font-medium">TSH {parseFloat(investment.expected_return || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Mapato Halisi</p>
                  <p className="font-medium">TSH {parseFloat(investment.actual_return || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Huna uwekezaji wowote bado.</p>
        </div>
      )}
    </div>
  );
}

function LearningSection({ memberTraining, user }: { memberTraining: any[]; user: any }) {
  const handleStartTraining = async (trainingId: number) => {
    try {
      await fetch('/api/members/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, trainingId, action: 'start' })
      });
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };
  
  const handleCompleteTraining = async (trainingId: number) => {
    try {
      await fetch('/api/members/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, trainingId, action: 'complete' })
      });
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error completing training:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mafunzo</h2>
      
      {memberTraining.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberTraining.map((training, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{training.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  training.progress_status === 'completed' ? 'bg-green-100 text-green-800' :
                  training.progress_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {training.progress_status === 'completed' ? 'Umekamilisha' :
                   training.progress_status === 'in_progress' ? 'Unaendelea' :
                   'Haujajanza'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{training.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Kategoria: {training.category}</span>
                <span>Kiwango: {training.level}</span>
                <span>Muda: {training.duration_hours}h</span>
              </div>
              
              {training.progress_status === 'completed' ? (
                <div className="text-center py-2">
                  <span className="text-green-600 font-medium">✓ Umekamilisha</span>
                </div>
              ) : training.progress_status === 'in_progress' ? (
                <button
                  onClick={() => handleCompleteTraining(training.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kamilisha Mafunzo
                </button>
              ) : (
                <button
                  onClick={() => handleStartTraining(training.id)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Anza Mafunzo
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Hakuna mafunzo yaliyopatikana.</p>
        </div>
      )}
    </div>
  );
}

function MemberSettingsSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mipangilio</h2>
      <p className="text-gray-600">Mipangilio ya akaunti yako.</p>
    </div>
  );
}
