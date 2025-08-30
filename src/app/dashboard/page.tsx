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
  const [user, setUser] = useState<{fullName?: string; email: string} | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

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
        return <OverviewSection />;
      case 'members':
        return <MembersSection />;
      case 'groups':
        return <GroupsSection />;
      case 'investments':
        return <InvestmentsSection />;
      case 'content':
        return <ContentSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection() {
  const stats = [
    { name: 'Jumla ya Wanachama', value: '1,247', change: '+12%', color: 'bg-blue-500' },
    { name: 'Vikundi Vya Kazi', value: '120', change: '+8%', color: 'bg-green-500' },
    { name: 'Uwekezaji wa Jumla', value: 'TSH 45M', change: '+15%', color: 'bg-orange-500' },
    { name: 'Mapato ya Mwezi', value: 'TSH 2.8M', change: '+5%', color: 'bg-red-500' },
  ];

  const recentActivities = [
    { action: 'Mwanachama mpya amejiunge', user: 'Amina Hassan', time: '2 masaa zilizopita' },
    { action: 'Kundi jipya limeanzishwa', user: 'Kundi la Kilimo Dodoma', time: '4 masaa zilizopita' },
    { action: 'Uwekezaji umeidhinishwa', user: 'Kundi la Ufugaji Mwanza', time: '6 masaa zilizopita' },
    { action: 'Ripoti ya mwezi imewasilishwa', user: 'John Massawe', time: '1 siku iliyopita' },
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
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMemberForm, setShowMemberForm] = useState(false);
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
  
  const members = [
    { id: 1, name: 'Amina Mwalimu', email: 'amina@example.com', group: 'Kundi la Kilimo Mwanza', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'John Massawe', email: 'john@example.com', group: 'Kundi la Ufugaji Arusha', status: 'active', joinDate: '2024-02-20' },
    { id: 3, name: 'Fatuma Hassan', email: 'fatuma@example.com', group: 'Kundi la Biashara DSM', status: 'pending', joinDate: '2024-08-25' },
    { id: 4, name: 'Peter Kimaro', email: 'peter@example.com', group: 'Kundi la Kilimo Mwanza', status: 'active', joinDate: '2024-03-10' },
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        // Refresh members list here
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tafuta mwanachama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
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
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.group}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.status === 'active' ? 'Hai' : 'Inasubiri'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
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

function GroupsSection() {
  const groups = [
    { id: 1, name: 'Kundi la Kilimo Mwanza', members: 12, leader: 'Amina Mwalimu', investment: 'TSH 2.5M', status: 'active' },
    { id: 2, name: 'Kundi la Ufugaji Arusha', members: 8, leader: 'John Massawe', investment: 'TSH 1.8M', status: 'active' },
    { id: 3, name: 'Kundi la Biashara DSM', members: 15, leader: 'Fatuma Hassan', investment: 'TSH 3.2M', status: 'pending' },
    { id: 4, name: 'Kundi la Sanaa Mbeya', members: 6, leader: 'Peter Kimaro', investment: 'TSH 900K', status: 'active' },
  ];

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
        {groups.map((group) => (
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
              <p><strong>Wanachama:</strong> {group.members}</p>
              <p><strong>Kiongozi:</strong> {group.leader}</p>
              <p><strong>Uwekezaji:</strong> {group.investment}</p>
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
        ))}
      </div>
    </div>
  );
}

function InvestmentsSection() {
  const investments = [
    { id: 1, group: 'Kundi la Kilimo Mwanza', amount: 'TSH 2.5M', date: '2024-01-15', status: 'active', returns: 'TSH 375K' },
    { id: 2, group: 'Kundi la Ufugaji Arusha', amount: 'TSH 1.8M', date: '2024-02-20', status: 'active', returns: 'TSH 270K' },
    { id: 3, group: 'Kundi la Biashara DSM', amount: 'TSH 3.2M', date: '2024-08-25', status: 'pending', returns: '-' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usimamizi wa Uwekezaji</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Uwekezaji Mpya</span>
        </button>
      </div>

      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Jumla ya Uwekezaji</h3>
          <p className="text-2xl font-bold text-blue-600">TSH 45.2M</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Mapato ya Jumla</h3>
          <p className="text-2xl font-bold text-green-600">TSH 6.8M</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900">Kiwango cha Mapato</h3>
          <p className="text-2xl font-bold text-orange-600">15.1%</p>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{investment.group}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    investment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {investment.status === 'active' ? 'Hai' : 'Inasubiri'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.returns}</td>
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

function ReportsSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ripoti na Takwimu</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ripoti za Mwezi</h3>
          {['Agosti 2024', 'Julai 2024', 'Juni 2024'].map((month, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="font-medium text-gray-900">Ripoti ya {month}</span>
              <button className="text-orange-600 hover:text-orange-700 font-medium">Pakua</button>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ripoti za Maalum</h3>
          {['Takwimu za Jinsia', 'Ukuaji wa Biashara', 'Athari za Kijamii'].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="font-medium text-gray-900">{report}</span>
              <button className="text-orange-600 hover:text-orange-700 font-medium">Tengeneza</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSection() {
  const [showContentForm, setShowContentForm] = useState(false);
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
      const response = await fetch('/api/educational-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contentForm,
          author_id: 1 // Default admin user ID
        }),
      });

      if (response.ok) {
        setShowContentForm(false);
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
        // Refresh content list here
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mafunzo na Elimu</h2>
        <button
          onClick={() => setShowContentForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ongeza Mafunzo
        </button>
      </div>

      {showContentForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Mafunzo Mapya</h3>
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
                Hifadhi Mafunzo
              </button>
              <button
                type="button"
                onClick={() => setShowContentForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Ghairi
              </button>
            </div>
          </form>
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
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Msingi wa Biashara</div>
                    <div className="text-sm text-gray-500">Jifunze misingi ya kuanzisha biashara</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  Biashara
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Imechapishwa
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Leo
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900 mr-3">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
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
