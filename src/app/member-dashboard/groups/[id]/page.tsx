'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Membership = {
  member_id: number;
  role: string;
  status: string;
};

type Group = {
  id: number;
  name: string;
  founded_date: string | null;
  total_investment: string | number | null;
  monthly_contribution: string | number | null;
  status: string;
  created_at?: string;
  leader_name?: string | null;
  member_count?: number;
};

type MemberRow = {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  joined_date?: string | null;
  status?: string | null;
};

type LeadershipRow = {
  id: number;
  role: string;
  full_name: string;
  email?: string | null;
  joined_date?: string | null;
  status?: string | null;
};

function roleLabel(role?: string) {
  switch (role) {
    case 'leader':
      return 'Kiongozi';
    case 'mwenyekiti':
      return 'Mwenyekiti';
    case 'katibu':
      return 'Katibu';
    case 'mwekahazina':
      return 'MwekaHazina';
    case 'member':
    default:
      return 'Mwanachama';
  }
}

export default function MemberGroupDetailsPage() {
  const router = useRouter();
  const routeParams = useParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(routeParams?.id) ? routeParams?.id[0] : routeParams?.id;

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [leadership, setLeadership] = useState<LeadershipRow[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'leadership' | 'decisions'>('overview');
  const [error, setError] = useState<string>('');

  const canCreateProposal = useMemo(() => {
    const r = membership?.role;
    return r === 'leader' || r === 'mwenyekiti' || r === 'katibu' || r === 'mwekahazina';
  }, [membership?.role]);

  useEffect(() => {
    let cancelled = false;

    if (!groupId) {
      router.push('/member-dashboard?section=group');
      return;
    }

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [groupRes, membersRes, leadershipRes] = await Promise.all([
          fetch(`/api/member/groups/${groupId}`),
          fetch(`/api/member/groups/${groupId}/members`),
          fetch(`/api/member/groups/${groupId}/leadership`)
        ]);

        if (cancelled) return;

        if ([groupRes.status, membersRes.status, leadershipRes.status].includes(401)) {
          router.push('/login');
          return;
        }

        if (groupRes.status === 403) {
          setError('Huruhusiwi kuona taarifa za kundi hili.');
          return;
        }

        const groupJson = await groupRes.json().catch(() => null);
        const membersJson = await membersRes.json().catch(() => null);
        const leadershipJson = await leadershipRes.json().catch(() => null);

        if (!groupRes.ok) {
          setError(groupJson?.error || 'Imeshindikana kupakua taarifa za kundi.');
          return;
        }

        setGroup(groupJson?.group || null);
        setMembership(groupJson?.membership || null);

        setMembers(Array.isArray(membersJson?.members) ? membersJson.members : []);
        setLeadership(Array.isArray(leadershipJson?.leadership) ? leadershipJson.leadership : []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Imeshindikana kupakua taarifa.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [groupId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/member-dashboard?section=group')}
              className="text-sm text-orange-700 hover:text-orange-800"
            >
              ← Back to My Groups
            </button>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{group?.name || 'Group'}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Role: <span className="font-medium">{roleLabel(membership?.role)}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => alert('Coming soon: Create proposal')}
              disabled={!canCreateProposal}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                canCreateProposal
                  ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              Create Proposal
            </button>
            <button
              onClick={() => alert('Coming soon: Vote on proposals')}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-50"
            >
              Vote
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-4">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'overview' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'members' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-600'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('leadership')}
                className={`py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'leadership' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-600'
                }`}
              >
                Leadership
              </button>
              <button
                onClick={() => setActiveTab('decisions')}
                className={`py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'decisions' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-600'
                }`}
              >
                Decisions
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Monthly Contribution</p>
                  <p className="text-lg font-semibold text-gray-900">
                    TSH {Number.parseFloat(String(group?.monthly_contribution || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="text-lg font-semibold text-gray-900">{group?.member_count ?? members.length}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Leader</p>
                  <p className="text-lg font-semibold text-gray-900">{group?.leader_name || '—'}</p>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{m.full_name}</div>
                          <div className="text-xs text-gray-500">{m.email || m.phone || ''}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{roleLabel(m.role)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{m.status || 'active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {members.length === 0 && <p className="text-sm text-gray-600">No members found.</p>}
              </div>
            )}

            {activeTab === 'leadership' && (
              <div className="space-y-3">
                {leadership.map((l) => (
                  <div key={l.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{l.full_name}</p>
                        <p className="text-xs text-gray-500">{l.email || ''}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                        {roleLabel(l.role)}
                      </span>
                    </div>
                  </div>
                ))}

                {leadership.length === 0 && <p className="text-sm text-gray-600">No leadership assigned yet.</p>}
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">Proposals & Voting</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coming next: create proposals, open voting, vote, and view results. UI will be role-based.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
