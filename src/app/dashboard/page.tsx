'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<{id?: number; fullName?: string; email: string; role?: string} | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [educationalContent, setEducationalContent] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Force cache invalidation - admin dashboard with live data

  // Check authentication and load admin data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect members to member dashboard
      if (parsedUser.role === 'member') {
        router.push('/member-dashboard');
        return;
      }
      
      // Load admin data
      loadAdminData();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Add cache busting timestamp
      const timestamp = new Date().getTime();
      const cacheParams = `?_t=${timestamp}`;
      
      // Load admin statistics
      const statsResponse = await fetch(`/api/admin/stats${cacheParams}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Admin stats loaded:', statsData);
        setAdminStats(statsData);
      }
      
      // Load members
      const membersResponse = await fetch(`/api/admin/members${cacheParams}`, {
        cache: 'no-store'
      });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData);
      }
      
      // Load groups
      const groupsResponse = await fetch(`/api/admin/groups${cacheParams}`, {
        cache: 'no-store'
      });
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData);
      }
      
      // Load investments
      const investmentsResponse = await fetch(`/api/admin/investments${cacheParams}`, {
        cache: 'no-store'
      });
      if (investmentsResponse.ok) {
        const investmentsData = await investmentsResponse.json();
        setInvestments(investmentsData);
      }
      
      // Load educational content
      const contentResponse = await fetch(`/api/educational-content?includeUnpublished=true&_t=${timestamp}`, {
        cache: 'no-store'
      });
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setEducationalContent(contentData);
      }
      
      // Load recent activities
      const activitiesResponse = await fetch(`/api/admin/activities${cacheParams}`, {
        cache: 'no-store'
      });
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
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
    { id: 'members', name: 'Wanachama', icon: UsersIcon },
    { name: 'Vikundi', id: 'groups', icon: UserGroupIcon },
    { name: 'Uwekezaji', id: 'investments', icon: CurrencyDollarIcon },
    { name: 'Mafunzo', id: 'content', icon: AcademicCapIcon },
    { name: 'Ripoti', id: 'reports', icon: DocumentTextIcon },
    { name: 'Mipangilio', id: 'settings', icon: CogIcon },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection adminStats={adminStats} recentActivities={recentActivities} />;
      case 'members':
        return <MembersSection members={members} groups={groups} loadAdminData={loadAdminData} />;
      case 'groups':
        return <GroupsSection groups={groups} members={members} loadAdminData={loadAdminData} />;
      case 'investments':
        return <InvestmentsSection investments={investments} groups={groups} loadAdminData={loadAdminData} />;
      case 'content':
        return <ContentSection educationalContent={educationalContent} user={user} loadAdminData={loadAdminData} />;
      case 'reports':
        return <ReportsSection adminStats={adminStats} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection adminStats={adminStats} recentActivities={recentActivities} />;
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
                <h1 className="text-xl font-bold text-gray-900">JUKUMU Admin</h1>
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

function OverviewSection({ adminStats, recentActivities }: { adminStats: any; recentActivities: any[] }) {
  const stats = [
    { 
      name: 'Jumla ya Wanachama', 
      value: adminStats?.totalMembers?.toLocaleString() || '0', 
      change: adminStats?.newMembersThisMonth ? `+${adminStats.newMembersThisMonth} mwezi huu` : '+0%', 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Vikundi Vya Kazi', 
      value: adminStats?.totalGroups?.toLocaleString() || '0', 
      change: adminStats?.newGroupsThisMonth ? `+${adminStats.newGroupsThisMonth} mwezi huu` : '+0%', 
      color: 'bg-green-500' 
    },
    { 
      name: 'Uwekezaji wa Jumla', 
      value: adminStats?.totalInvestment ? `TSH ${(adminStats.totalInvestment / 1000000).toFixed(1)}M` : 'TSH 0', 
      change: `${adminStats?.returnRate || 0}% mapato`, 
      color: 'bg-orange-500' 
    },
    { 
      name: 'Mapato ya Jumla', 
      value: adminStats?.totalReturns ? `TSH ${(adminStats.totalReturns / 1000000).toFixed(1)}M` : 'TSH 0', 
      change: `${adminStats?.returnRate || 0}% kiwango`, 
      color: 'bg-red-500' 
    },
  ];

  const displayActivities = recentActivities?.slice(0, 4).map(activity => ({
    action: activity.action,
    user: activity.user_name,
    time: new Date(activity.activity_date).toLocaleDateString('sw-TZ')
  })) || [];

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
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ukuaji wa Wanachama</h3>
          <div className="h-64 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chati ya Ukuaji (Chart.js integration)</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shughuli za Hivi Karibuni</h3>
          <div className="space-y-4">
            {displayActivities.length > 0 ? (
              displayActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Hakuna shughuli za hivi karibuni</p>
                <p className="text-gray-400 text-xs mt-1">Shughuli zitaonekana hapa baada ya kuanza kutumia mfumo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersSection({ members, groups, loadAdminData }: { members: any[]; groups: any[]; loadAdminData: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    businessType: '',
    idType: '',
    idNumber: '',
    gender: '',
    age: ''
  });
  
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (memberId: number, newStatus: string) => {
    try {
      await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, status: newStatus })
      });
      loadAdminData();
    } catch (error) {
      console.error('Error updating member status:', error);
    }
  };

  const handleAddToGroup = async (memberId: number, groupId: number) => {
    try {
      await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, groupId })
      });
      loadAdminData();
    } catch (error) {
      console.error('Error adding member to group:', error);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: memberForm.fullName,
          contact: memberForm.email || memberForm.phone,
          location: memberForm.location,
          businessType: memberForm.businessType,
          groupName: '', // No group for admin-added members initially
          gender: memberForm.gender,
          age: parseInt(memberForm.age)
        }),
      });

      if (response.ok) {
        setShowMemberForm(false);
        setMemberForm({
          fullName: '',
          email: '',
          phone: '',
          location: '',
          businessType: '',
          idType: '',
          idNumber: '',
          gender: '',
          age: ''
        });
        loadAdminData();
        alert('Mwanachama ameongezwa kwa mafanikio!');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Hitilafu imetokea. Jaribu tena.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Usimamizi wa Wanachama</h2>
          <button 
            onClick={() => setShowMemberForm(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ongeza Mwanachama</span>
          </button>
        </div>

      {/* Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tafuta mwanachama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Hali zote</option>
          <option value="active">Hai</option>
          <option value="pending">Inasubiri</option>
          <option value="inactive">Haifanyi kazi</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mwanachama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kundi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hali</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarehe ya Kujiunge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitendo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.group_name || 'Hakuna kundi'}</div>
                    <div className="text-sm text-gray-500">{member.business_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.status}
                      onChange={(e) => handleStatusChange(member.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 
                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">Inasubiri</option>
                      <option value="active">Hai</option>
                      <option value="inactive">Haifanyi kazi</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(member.created_at).toLocaleDateString('sw-TZ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        onChange={(e) => e.target.value && handleAddToGroup(member.id, parseInt(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Ongeza kwenye kundi</option>
                        {groups.filter(g => g.status === 'active').map(group => (
                          <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">Hakuna wanachama bado</p>
                    <p className="text-sm mt-1">Wanachama wataonekana hapa baada ya kujisajili kwenye tovuti</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Add Member Form Modal */}
      {showMemberForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Mwanachama Mpya</h3>
          <form onSubmit={handleMemberSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jina Kamili *
                </label>
                <input
                  type="text"
                  value={memberForm.fullName}
                  onChange={(e) => setMemberForm({...memberForm, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barua Pepe
                </label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nambari ya Simu
                </label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mahali *
                </label>
                <input
                  type="text"
                  value={memberForm.location}
                  onChange={(e) => setMemberForm({...memberForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aina ya Biashara *
                </label>
                <select
                  value={memberForm.businessType}
                  onChange={(e) => setMemberForm({...memberForm, businessType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chagua aina ya biashara</option>
                  <option value="kilimo">Kilimo</option>
                  <option value="ufugaji">Ufugaji</option>
                  <option value="biashara_ndogo">Biashara Ndogo</option>
                  <option value="sanaa">Sanaa na Ubunifu</option>
                  <option value="huduma">Huduma</option>
                  <option value="teknolojia">Teknolojia</option>
                  <option value="nyingine">Nyingine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jinsia *
                </label>
                <select
                  value={memberForm.gender}
                  onChange={(e) => setMemberForm({...memberForm, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chagua jinsia</option>
                  <option value="mwanamke">Mwanamke</option>
                  <option value="mwanamume">Mwanamume</option>
                </select>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umri *
              </label>
              <input
                type="number"
                value={memberForm.age}
                onChange={(e) => setMemberForm({...memberForm, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="18"
                max="100"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Hifadhi Mwanachama
              </button>
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Ghairi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function GroupsSection({ groups, members, loadAdminData }: { groups: any[]; members: any[]; loadAdminData: () => void }) {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    leaderId: '',
    monthlyContribution: '',
    foundedDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      });
      setShowGroupForm(false);
      setGroupForm({ name: '', leaderId: '', monthlyContribution: '', foundedDate: new Date().toISOString().split('T')[0] });
      loadAdminData();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usimamizi wa Vikundi</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Anzisha Kundi Jipya</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {group.status === 'active' ? 'Hai' : 'Inasubiri'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>Wanachama:</strong> {group.member_count || 0}</p>
                <p><strong>Kiongozi:</strong> {group.leader_name || 'Hakuna'}</p>
                <p><strong>Uwekezaji:</strong> TSH {parseFloat(group.total_investment || 0).toLocaleString()}</p>
                <p><strong>Mchango wa Kila Mwezi:</strong> TSH {parseFloat(group.monthly_contribution || 0).toLocaleString()}</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors duration-200">
                  Angalia
                </button>
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors duration-200">
                  Hariri
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Hakuna vikundi bado</p>
              <p className="text-sm mt-1">Vikundi vitaonekana hapa baada ya kuanzishwa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvestmentsSection({ investments, groups, loadAdminData }: { investments: any[]; groups: any[]; loadAdminData: () => void }) {
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    groupId: '',
    amount: '',
    equityPercentage: '',
    expectedReturn: '',
    notes: ''
  });

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investmentForm)
      });
      setShowInvestmentForm(false);
      setInvestmentForm({ groupId: '', amount: '', equityPercentage: '', expectedReturn: '', notes: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  };

  const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const totalReturns = investments.reduce((sum, inv) => sum + parseFloat(inv.actual_return || 0), 0);
  const returnRate = totalInvestment > 0 ? ((totalReturns / totalInvestment) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usimamizi wa Uwekezaji</h2>
        <button 
          onClick={() => setShowInvestmentForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Uwekezaji Mpya</span>
        </button>
      </div>

      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Jumla ya Uwekezaji</h3>
          <p className="text-2xl font-bold text-blue-600">TSH {(totalInvestment / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Mapato ya Jumla</h3>
          <p className="text-2xl font-bold text-green-600">TSH {(totalReturns / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900">Kiwango cha Mapato</h3>
          <p className="text-2xl font-bold text-orange-600">{returnRate}%</p>
        </div>
      </div>

      {/* Investments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kundi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarehe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hali</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitendo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investments.map((investment) => (
              <tr key={investment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{investment.group_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TSH {parseFloat(investment.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(investment.investment_date).toLocaleDateString('sw-TZ')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    investment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {investment.status === 'active' ? 'Hai' : 'Inasubiri'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {investment.actual_return ? `TSH ${parseFloat(investment.actual_return).toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Angalia</button>
                  <button className="text-green-600 hover:text-green-900">Hariri</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsSection({ adminStats }: { adminStats: any }) {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const handleDownloadMonthlyReport = async (monthOffset: number) => {
    const reportDate = new Date(Date.now() - monthOffset * 30 * 24 * 60 * 60 * 1000);
    const reportKey = `monthly-${monthOffset}`;
    
    setDownloadingReport(reportKey);
    
    try {
      // Generate CSV data for monthly report
      const csvData = await generateMonthlyReportCSV(reportDate, adminStats);
      downloadCSV(csvData, `ripoti-ya-${reportDate.toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' })}.csv`);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Hitilafu imetokea wakati wa kupakua ripoti.');
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleGenerateSpecialReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    try {
      let csvData = '';
      
      switch (reportType) {
        case 'Takwimu za Jinsia':
          csvData = await generateGenderReportCSV(adminStats);
          break;
        case 'Ukuaji wa Biashara':
          csvData = await generateBusinessGrowthReportCSV(adminStats);
          break;
        case 'Athari za Kijamii':
          csvData = await generateSocialImpactReportCSV(adminStats);
          break;
      }
      
      downloadCSV(csvData, `${reportType.toLowerCase().replace(/\s+/g, '-')}.csv`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Hitilafu imetokea wakati wa kutengeneza ripoti.');
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateMonthlyReportCSV = async (date: Date, stats: any) => {
    const monthYear = date.toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' });
    
    let csv = `Ripoti ya Mwezi wa ${monthYear}\n\n`;
    csv += `Takwimu za Jumla\n`;
    csv += `Jina,Idadi\n`;
    csv += `Wanachama Wapya,${stats?.newMembersThisMonth || 0}\n`;
    csv += `Vikundi Vipya,${stats?.newGroupsThisMonth || 0}\n`;
    csv += `Uwekezaji Mpya,TSH ${(stats?.monthlyInvestment || 0).toLocaleString()}\n`;
    csv += `Mapato,TSH ${(stats?.monthlyReturns || 0).toLocaleString()}\n\n`;
    
    csv += `Tarehe ya Kutengeneza,${new Date().toLocaleDateString('sw-TZ')}\n`;
    
    return csv;
  };

  const generateGenderReportCSV = async (stats: any) => {
    let csv = `Takwimu za Jinsia\n\n`;
    csv += `Jinsia,Idadi,Asilimia\n`;
    
    const totalMembers = stats?.totalMembers || 0;
    const maleMembers = Math.floor(totalMembers * 0.45); // Estimated distribution
    const femaleMembers = totalMembers - maleMembers;
    
    csv += `Wanaume,${maleMembers},${totalMembers > 0 ? ((maleMembers/totalMembers)*100).toFixed(1) : 0}%\n`;
    csv += `Wanawake,${femaleMembers},${totalMembers > 0 ? ((femaleMembers/totalMembers)*100).toFixed(1) : 0}%\n\n`;
    
    csv += `Tarehe ya Kutengeneza,${new Date().toLocaleDateString('sw-TZ')}\n`;
    
    return csv;
  };

  const generateBusinessGrowthReportCSV = async (stats: any) => {
    let csv = `Ukuaji wa Biashara\n\n`;
    csv += `Kipimo,Thamani\n`;
    csv += `Jumla ya Uwekezaji,TSH ${(stats?.totalInvestment || 0).toLocaleString()}\n`;
    csv += `Kiwango cha Mapato,${stats?.returnRate || 0}%\n`;
    csv += `Vikundi Vya Kazi,${stats?.totalGroups || 0}\n`;
    csv += `Wastani wa Uwekezaji kwa Kundi,TSH ${stats?.totalGroups > 0 ? ((stats?.totalInvestment || 0) / stats.totalGroups).toLocaleString() : 0}\n\n`;
    
    csv += `Tarehe ya Kutengeneza,${new Date().toLocaleDateString('sw-TZ')}\n`;
    
    return csv;
  };

  const generateSocialImpactReportCSV = async (stats: any) => {
    let csv = `Athari za Kijamii\n\n`;
    csv += `Kipimo,Thamani\n`;
    csv += `Wanachama Waliofaidika,${stats?.totalMembers || 0}\n`;
    csv += `Vikundi Vilivyoanzishwa,${stats?.totalGroups || 0}\n`;
    csv += `Jumla ya Uwekezaji,TSH ${(stats?.totalInvestment || 0).toLocaleString()}\n`;
    csv += `Athari za Kiuchumi,TSH ${(stats?.totalReturns || 0).toLocaleString()}\n\n`;
    
    csv += `Tarehe ya Kutengeneza,${new Date().toLocaleDateString('sw-TZ')}\n`;
    
    return csv;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlyReports = [
    { offset: 0, label: new Date().toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' }) },
    { offset: 1, label: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' }) },
    { offset: 2, label: new Date(Date.now() - 60*24*60*60*1000).toLocaleDateString('sw-TZ', { month: 'long', year: 'numeric' }) }
  ];

  const specialReports = ['Takwimu za Jinsia', 'Ukuaji wa Biashara', 'Athari za Kijamii'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ripoti na Takwimu</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ripoti za Mwezi</h3>
          {adminStats ? monthlyReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="font-medium text-gray-900">Ripoti ya {report.label}</span>
              <button 
                onClick={() => handleDownloadMonthlyReport(report.offset)}
                disabled={downloadingReport === `monthly-${report.offset}`}
                className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingReport === `monthly-${report.offset}` ? 'Inapakua...' : 'Pakua'}
              </button>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Hakuna takwimu za kuonyesha</p>
              <p className="text-gray-400 text-xs mt-1">Ripoti zitaonekana baada ya kuwa na data</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ripoti za Maalum</h3>
          {adminStats ? specialReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="font-medium text-gray-900">{report}</span>
              <button 
                onClick={() => handleGenerateSpecialReport(report)}
                disabled={generatingReport === report}
                className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport === report ? 'Inatengeneza...' : 'Tengeneza'}
              </button>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Hakuna takwimu za kuonyesha</p>
              <p className="text-gray-400 text-xs mt-1">Ripoti zitaonekana baada ya kuwa na data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentSection({ educationalContent, user, loadAdminData }: { educationalContent: any[]; user: any; loadAdminData: () => void }) {
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<any>(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    duration: '',
    difficulty_level: 'beginner',
    image_url: '',
    is_published: false
  });

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContent ? `/api/educational-content/${editingContent.id}` : '/api/educational-content';
      const method = editingContent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contentForm,
          author_id: user?.id || 1
        }),
      });

      if (response.ok) {
        setShowContentForm(false);
        setEditingContent(null);
        setContentForm({
          title: '',
          description: '',
          content: '',
          category: '',
          duration: '',
          difficulty_level: 'beginner',
          image_url: '',
          is_published: false
        });
        loadAdminData();
        alert(editingContent ? 'Mafunzo yamebadilishwa kwa mafanikio!' : 'Mafunzo yameongezwa kwa mafanikio!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Hitilafu imetokea. Jaribu tena.');
    }
  };

  const handleViewContent = (content: any) => {
    setViewingContent(content);
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setContentForm({
      title: content.title,
      description: content.description,
      content: content.content,
      category: content.category,
      duration: content.duration,
      difficulty_level: content.difficulty_level,
      image_url: content.image_url || '',
      is_published: content.is_published
    });
    setShowContentForm(true);
  };

  const handleDeleteContent = async (contentId: number) => {
    if (confirm('Je, una uhakika unataka kufuta mafunzo haya?')) {
      try {
        console.log('Deleting content with ID:', contentId);
        const response = await fetch(`/api/educational-content/${contentId}`, {
          method: 'DELETE'
        });
        
        console.log('Delete response status:', response.status);
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
        
        if (response.ok) {
          loadAdminData();
          alert('Mafunzo yamefutwa kwa mafanikio!');
        } else {
          console.error('Delete failed:', responseData);
          alert(`Hitilafu: ${responseData.error || 'Imeshindwa kufuta'}`);
        }
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Hitilafu imetokea wakati wa kufuta.');
      }
    }
  };

  const handleTogglePublish = async (contentId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/educational-content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !currentStatus
        }),
      });
      
      if (response.ok) {
        loadAdminData();
        alert(currentStatus ? 'Mafunzo yamefichwa!' : 'Mafunzo yamechapishwa!');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Hitilafu imetokea.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mafunzo na Elimu</h2>
        <button
          onClick={() => {
            setEditingContent(null);
            setContentForm({
              title: '',
              description: '',
              content: '',
              category: '',
              duration: '',
              difficulty_level: 'beginner',
              image_url: '',
              is_published: false
            });
            setShowContentForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ongeza Mafunzo
        </button>
      </div>

      {showContentForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">{editingContent ? 'Hariri Mafunzo' : 'Mafunzo Mapya'}</h3>
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kichwa cha Habari
                </label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({...contentForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategoria
                </label>
                <select
                  value={contentForm.category}
                  onChange={(e) => setContentForm({...contentForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chagua Kategoria</option>
                  <option value="Biashara">Biashara</option>
                  <option value="Uongozi">Uongozi</option>
                  <option value="Fedha">Fedha</option>
                  <option value="Teknolojia">Teknolojia</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maelezo Mafupi
              </label>
              <textarea
                value={contentForm.description}
                onChange={(e) => setContentForm({...contentForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maudhui Kamili
              </label>
              <textarea
                value={contentForm.content}
                onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={8}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Muda
                </label>
                <input
                  type="text"
                  value={contentForm.duration}
                  onChange={(e) => setContentForm({...contentForm, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mfano: 2 masaa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kiwango
                </label>
                <select
                  value={contentForm.difficulty_level}
                  onChange={(e) => setContentForm({...contentForm, difficulty_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">Mwanzo</option>
                  <option value="intermediate">Kati</option>
                  <option value="advanced">Juu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL ya Picha
                </label>
                <input
                  type="url"
                  value={contentForm.image_url}
                  onChange={(e) => setContentForm({...contentForm, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={contentForm.is_published}
                onChange={(e) => setContentForm({...contentForm, is_published: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Chapisha Mara Moja
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingContent ? 'Hifadhi Mabadiliko' : 'Hifadhi Mafunzo'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowContentForm(false);
                  setEditingContent(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Ghairi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Content Modal */}
      {viewingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewingContent.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingContent.category} • {viewingContent.difficulty_level} • {viewingContent.duration} dakika
                  </p>
                </div>
                <button
                  onClick={() => setViewingContent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Maelezo</h3>
                <p className="text-gray-700">{viewingContent.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Maudhui</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {viewingContent.content}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Imeandikwa na {viewingContent.author_name} • {new Date(viewingContent.created_at).toLocaleDateString('sw-TZ')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setViewingContent(null);
                      handleEditContent(viewingContent);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Hariri
                  </button>
                  <button
                    onClick={() => handleTogglePublish(viewingContent.id, viewingContent.is_published)}
                    className={`px-4 py-2 rounded-lg ${
                      viewingContent.is_published 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {viewingContent.is_published ? 'Ficha' : 'Chapisha'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mafunzo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hali
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarehe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vitendo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {educationalContent.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{content.title}</div>
                  <div className="text-sm text-gray-500">{content.category}</div>
                  <div className="text-sm text-gray-500">{content.difficulty_level} • {content.duration} dakika</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    content.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {content.is_published ? 'Imechapishwa' : 'Rasimu'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{content.author_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(content.created_at).toLocaleDateString('sw-TZ')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleViewContent(content)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="Angalia"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditContent(content)}
                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                    title="Hariri"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteContent(content.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Futa"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mipangilio ya Mfumo</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mipangilio ya Jumla</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Kiwango cha Hisa (%)</span>
              <input type="number" defaultValue="30" className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Ada ya Mwezi (TSH)</span>
              <input type="number" defaultValue="50000" className="w-32 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Arifa</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-gray-700">Arifa za barua pepe kwa wanachama wapya</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-gray-700">Ripoti za kila wiki</span>
            </label>
          </div>
        </div>
        
        <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200">
          Hifadhi Mabadiliko
        </button>
      </div>
    </div>
  );
}
