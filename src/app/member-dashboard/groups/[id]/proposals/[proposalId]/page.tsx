'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type ProposalRow = {
  id: number;
  group_id: number;
  title: string;
  description?: string | null;
  status: 'open' | 'closed' | string;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
  created_by_member_id?: number;
};

export default function MemberGroupProposalDetailsPage() {
  const router = useRouter();
  const routeParams = useParams<{ id?: string | string[]; proposalId?: string | string[] }>();

  const groupId = Array.isArray(routeParams?.id) ? routeParams?.id[0] : routeParams?.id;
  const proposalId = Array.isArray(routeParams?.proposalId) ? routeParams?.proposalId[0] : routeParams?.proposalId;

  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<ProposalRow | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!groupId || !proposalId) {
      router.push('/member-dashboard?section=group');
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/member/groups/${groupId}/proposals/${proposalId}`);

        if (cancelled) return;

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const json = await res.json().catch(() => null);

        if (res.status === 403) {
          setError('Huruhusiwi kuona pendekezo hili.');
          return;
        }

        if (!res.ok) {
          setError(json?.error || 'Imeshindikana kupakua pendekezo.');
          return;
        }

        setProposal((json?.proposal as ProposalRow) || null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Imeshindikana kupakua pendekezo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [groupId, proposalId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push(`/member-dashboard/groups/${groupId}`)}
          className="text-sm text-orange-700 hover:text-orange-800"
        >
          ← Back to Group
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {!error && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{proposal?.title || 'Proposal'}</h1>
                <p className="text-sm text-gray-600 mt-1">Created by: {proposal?.created_by_name || '—'}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                {proposal?.status || '—'}
              </span>
            </div>

            {proposal?.description && <p className="text-sm text-gray-800 mt-4 whitespace-pre-wrap">{proposal.description}</p>}

            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Voting: coming next.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
