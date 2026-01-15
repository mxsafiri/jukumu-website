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

type VoteSummary = {
  yes: number;
  no: number;
  abstain: number;
  total: number;
};

export default function MemberGroupProposalDetailsPage() {
  const router = useRouter();
  const routeParams = useParams<{ id?: string | string[]; proposalId?: string | string[] }>();

  const groupId = Array.isArray(routeParams?.id) ? routeParams?.id[0] : routeParams?.id;
  const proposalId = Array.isArray(routeParams?.proposalId) ? routeParams?.proposalId[0] : routeParams?.proposalId;

  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<ProposalRow | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({ yes: 0, no: 0, abstain: 0, total: 0 });
  const [myVote, setMyVote] = useState<'yes' | 'no' | 'abstain' | null>(null);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
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
        setVoteSummary((json?.voteSummary as VoteSummary) || { yes: 0, no: 0, abstain: 0, total: 0 });
        const v = json?.myVote;
        setMyVote(v === 'yes' || v === 'no' || v === 'abstain' ? v : null);
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
              <p className="text-sm font-medium text-gray-900">Voting</p>
              <p className="text-sm text-gray-600 mt-1">All group members can vote. One vote per member (you can change it).</p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={async () => {
                    if (!groupId || !proposalId) return;
                    if (proposal?.status !== 'open') return;
                    setVoteSubmitting(true);
                    setError('');
                    try {
                      const res = await fetch(`/api/member/groups/${groupId}/proposals/${proposalId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vote: 'yes' })
                      });

                      if (res.status === 401) {
                        router.push('/login');
                        return;
                      }

                      const json = await res.json().catch(() => null);
                      if (!res.ok) {
                        setError(json?.error || 'Imeshindikana kupiga kura.');
                        return;
                      }

                      setMyVote('yes');
                      setVoteSummary((json?.voteSummary as VoteSummary) || voteSummary);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Imeshindikana kupiga kura.');
                    } finally {
                      setVoteSubmitting(false);
                    }
                  }}
                  disabled={voteSubmitting || proposal?.status !== 'open'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    myVote === 'yes'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  } ${voteSubmitting || proposal?.status !== 'open' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Yes
                </button>

                <button
                  onClick={async () => {
                    if (!groupId || !proposalId) return;
                    if (proposal?.status !== 'open') return;
                    setVoteSubmitting(true);
                    setError('');
                    try {
                      const res = await fetch(`/api/member/groups/${groupId}/proposals/${proposalId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vote: 'no' })
                      });

                      if (res.status === 401) {
                        router.push('/login');
                        return;
                      }

                      const json = await res.json().catch(() => null);
                      if (!res.ok) {
                        setError(json?.error || 'Imeshindikana kupiga kura.');
                        return;
                      }

                      setMyVote('no');
                      setVoteSummary((json?.voteSummary as VoteSummary) || voteSummary);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Imeshindikana kupiga kura.');
                    } finally {
                      setVoteSubmitting(false);
                    }
                  }}
                  disabled={voteSubmitting || proposal?.status !== 'open'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    myVote === 'no'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  } ${voteSubmitting || proposal?.status !== 'open' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  No
                </button>

                <button
                  onClick={async () => {
                    if (!groupId || !proposalId) return;
                    if (proposal?.status !== 'open') return;
                    setVoteSubmitting(true);
                    setError('');
                    try {
                      const res = await fetch(`/api/member/groups/${groupId}/proposals/${proposalId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vote: 'abstain' })
                      });

                      if (res.status === 401) {
                        router.push('/login');
                        return;
                      }

                      const json = await res.json().catch(() => null);
                      if (!res.ok) {
                        setError(json?.error || 'Imeshindikana kupiga kura.');
                        return;
                      }

                      setMyVote('abstain');
                      setVoteSummary((json?.voteSummary as VoteSummary) || voteSummary);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Imeshindikana kupiga kura.');
                    } finally {
                      setVoteSubmitting(false);
                    }
                  }}
                  disabled={voteSubmitting || proposal?.status !== 'open'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    myVote === 'abstain'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  } ${voteSubmitting || proposal?.status !== 'open' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Abstain
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Yes</p>
                  <p className="text-lg font-semibold text-gray-900">{voteSummary.yes}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">No</p>
                  <p className="text-lg font-semibold text-gray-900">{voteSummary.no}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Abstain</p>
                  <p className="text-lg font-semibold text-gray-900">{voteSummary.abstain}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-gray-900">{voteSummary.total}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Your vote: <span className="font-medium">{myVote || 'not voted'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
