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

type WalletSummary = {
  wallet: { id: number; network: string; address: string } | null;
  balances?: {
    usdc?: { amountBaseUnits: string; decimals: number };
    eth?: { amountBaseUnits: string; decimals: number };
  };
  recentTransfers?: {
    id: number;
    to_address: string;
    amount_base_units: string | number;
    status: string;
    approvals_required: number;
    executed_tx_hash?: string | null;
    created_at?: string;
  }[];
};

type WalletTransferRow = {
  id: number;
  to_address: string;
  amount_base_units: string | number;
  status: string;
  approvals_required: number;
  approval_count?: number;
  executed_tx_hash?: string | null;
  created_at?: string;
};

function shortAddress(addr?: string | null) {
  if (!addr) return '—';
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatBaseUnits(amountBaseUnits: string | number | null | undefined, decimals: number) {
  const raw = String(amountBaseUnits ?? '0').trim();
  const digits = raw.replace(/[^0-9]/g, '') || '0';
  const d = Math.max(0, Number.isFinite(decimals) ? decimals : 0);
  if (d === 0) return digits;

  const padded = digits.padStart(d + 1, '0');
  const intPartRaw = padded.slice(0, -d);
  const fracPartRaw = padded.slice(-d);
  const fracTrimmed = fracPartRaw.replace(/0+$/, '');

  const intPart = intPartRaw.replace(/^0+(?=\d)/, '');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fracTrimmed ? `${withCommas}.${fracTrimmed}` : withCommas;
}

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
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'leadership' | 'decisions'>('overview');
  const [error, setError] = useState<string>('');

  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string>('');

  const [walletTransfers, setWalletTransfers] = useState<WalletTransferRow[]>([]);
  const [walletTransfersLoading, setWalletTransfersLoading] = useState(false);
  const [walletTransfersError, setWalletTransfersError] = useState<string>('');

  const [transferToAddress, setTransferToAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalSubmitting, setProposalSubmitting] = useState(false);

  const canCreateProposal = useMemo(() => {
    const r = membership?.role;
    return r === 'leader' || r === 'mwenyekiti' || r === 'katibu' || r === 'mwekahazina';
  }, [membership?.role]);

  const canProposeTransfer = useMemo(() => {
    const r = membership?.role;
    return r === 'leader' || r === 'mwenyekiti' || r === 'katibu' || r === 'mwekahazina';
  }, [membership?.role]);

  const canApproveOrExecuteTransfer = useMemo(() => {
    const r = membership?.role;
    return r === 'mwenyekiti' || r === 'katibu' || r === 'mwekahazina';
  }, [membership?.role]);

  const recentProposals = useMemo(() => proposals.slice(0, 3), [proposals]);

  useEffect(() => {
    let cancelled = false;

    if (!groupId) {
      router.push('/member-dashboard?section=group');
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      setWalletError('');
      setWalletTransfersError('');

      try {
        const [groupRes, membersRes, leadershipRes, proposalsRes, walletRes, transfersRes] = await Promise.all([
          fetch(`/api/member/groups/${groupId}`),
          fetch(`/api/member/groups/${groupId}/members`),
          fetch(`/api/member/groups/${groupId}/leadership`),
          fetch(`/api/member/groups/${groupId}/proposals`),
          fetch(`/api/member/groups/${groupId}/wallet`),
          fetch(`/api/member/groups/${groupId}/wallet/transfers`)
        ]);

        if (cancelled) return;

        if (
          [groupRes.status, membersRes.status, leadershipRes.status, proposalsRes.status, walletRes.status, transfersRes.status].includes(
            401
          )
        ) {
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
        const proposalsJson = await proposalsRes.json().catch(() => null);
        const walletJson = await walletRes.json().catch(() => null);
        const transfersJson = await transfersRes.json().catch(() => null);

        if (!groupRes.ok) {
          setError(groupJson?.error || 'Imeshindikana kupakua taarifa za kundi.');
          return;
        }

        setGroup(groupJson?.group || null);
        setMembership(groupJson?.membership || null);

        setMembers(Array.isArray(membersJson?.members) ? membersJson.members : []);
        setLeadership(Array.isArray(leadershipJson?.leadership) ? leadershipJson.leadership : []);
        setProposals(Array.isArray(proposalsJson?.proposals) ? proposalsJson.proposals : []);

        if (walletRes.ok) {
          setWalletSummary((walletJson as WalletSummary) || null);
        } else {
          setWalletSummary(null);
          setWalletError(walletJson?.error || 'Imeshindikana kupakua taarifa za wallet.');
        }

        if (transfersRes.ok) {
          setWalletTransfers(Array.isArray(transfersJson?.transfers) ? (transfersJson.transfers as WalletTransferRow[]) : []);
        } else {
          setWalletTransfers([]);
          setWalletTransfersError(transfersJson?.error || 'Imeshindikana kupakua transfers za wallet.');
        }
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
              onClick={() => {
                setActiveTab('decisions');
                setShowCreateProposal(true);
              }}
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
              <div className="space-y-4">
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

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Group Wallet (USDC)</p>
                      <p className="text-sm text-gray-600 mt-1">Visible to all group members.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {walletSummary?.wallet === null && canCreateProposal && (
                        <button
                          disabled={walletLoading}
                          onClick={async () => {
                            if (!groupId) return;
                            setWalletLoading(true);
                            setWalletError('');
                            try {
                              const res = await fetch(`/api/member/groups/${groupId}/wallet`, { method: 'POST' });
                              const json = await res.json().catch(() => null);
                              if (!res.ok) {
                                setWalletError(json?.error || 'Imeshindikana kuunda wallet.');
                                return;
                              }
                              const refresh = await fetch(`/api/member/groups/${groupId}/wallet`);
                              const refreshJson = await refresh.json().catch(() => null);
                              if (refresh.ok) setWalletSummary((refreshJson as WalletSummary) || null);
                              else setWalletError(refreshJson?.error || 'Imeshindikana kupakua taarifa za wallet.');

                              const transfers = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                              const transfersJson = await transfers.json().catch(() => null);
                              if (transfers.ok) {
                                setWalletTransfers(
                                  Array.isArray(transfersJson?.transfers) ? (transfersJson.transfers as WalletTransferRow[]) : []
                                );
                              }
                            } catch (err) {
                              setWalletError(err instanceof Error ? err.message : 'Imeshindikana kuunda wallet.');
                            } finally {
                              setWalletLoading(false);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            walletLoading
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {walletLoading ? 'Creating...' : 'Create Wallet'}
                        </button>
                      )}
                      {walletSummary?.wallet && (
                        <button
                          disabled={walletLoading}
                          onClick={async () => {
                            if (!groupId) return;
                            setWalletLoading(true);
                            setWalletError('');
                            try {
                              const refresh = await fetch(`/api/member/groups/${groupId}/wallet`);
                              const refreshJson = await refresh.json().catch(() => null);
                              if (refresh.ok) setWalletSummary((refreshJson as WalletSummary) || null);
                              else setWalletError(refreshJson?.error || 'Imeshindikana kupakua taarifa za wallet.');

                              const transfers = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                              const transfersJson = await transfers.json().catch(() => null);
                              if (transfers.ok) {
                                setWalletTransfers(
                                  Array.isArray(transfersJson?.transfers) ? (transfersJson.transfers as WalletTransferRow[]) : []
                                );
                              }
                            } catch (err) {
                              setWalletError(err instanceof Error ? err.message : 'Imeshindikana kupakua taarifa za wallet.');
                            } finally {
                              setWalletLoading(false);
                            }
                          }}
                          className="px-3 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Refresh
                        </button>
                      )}
                    </div>
                  </div>

                  {walletError && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {walletError}
                    </div>
                  )}

                  {walletSummary?.wallet && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{shortAddress(walletSummary.wallet.address)}</p>
                        <p className="text-xs text-gray-500 mt-1">Network: {walletSummary.wallet.network}</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500">USDC Balance</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatBaseUnits(walletSummary.balances?.usdc?.amountBaseUnits, walletSummary.balances?.usdc?.decimals ?? 6)} USDC
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500">ETH (Gas)</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatBaseUnits(walletSummary.balances?.eth?.amountBaseUnits, walletSummary.balances?.eth?.decimals ?? 18)} ETH
                        </p>
                      </div>
                    </div>
                  )}

                  {walletSummary?.wallet && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">Recent Transfers</p>
                      <div className="mt-2 space-y-2">
                        {(walletSummary.recentTransfers || []).map((t) => (
                          <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  To: {shortAddress(t.to_address)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Amount: {formatBaseUnits(t.amount_base_units, 6)} USDC
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}

                        {(walletSummary.recentTransfers || []).length === 0 && (
                          <p className="text-sm text-gray-600">No transfers yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {walletSummary?.wallet && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Manage Transfers</p>
                          <p className="text-sm text-gray-600 mt-1">USDC only. Requires 2-of-3 approvals (Mwenyekiti/Katibu/MwekaHazina).</p>
                        </div>
                        <button
                          disabled={walletTransfersLoading}
                          onClick={async () => {
                            if (!groupId) return;
                            setWalletTransfersLoading(true);
                            setWalletTransfersError('');
                            try {
                              const transfers = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                              const transfersJson = await transfers.json().catch(() => null);
                              if (!transfers.ok) {
                                setWalletTransfersError(transfersJson?.error || 'Imeshindikana kupakua transfers za wallet.');
                                return;
                              }
                              setWalletTransfers(
                                Array.isArray(transfersJson?.transfers) ? (transfersJson.transfers as WalletTransferRow[]) : []
                              );
                            } catch (err) {
                              setWalletTransfersError(
                                err instanceof Error ? err.message : 'Imeshindikana kupakua transfers za wallet.'
                              );
                            } finally {
                              setWalletTransfersLoading(false);
                            }
                          }}
                          className="px-3 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Refresh
                        </button>
                      </div>

                      {walletTransfersError && (
                        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {walletTransfersError}
                        </div>
                      )}

                      {canProposeTransfer && (
                        <form
                          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!groupId) return;
                            if (!walletSummary?.wallet) return;

                            const to = transferToAddress.trim();
                            const amt = transferAmount.trim();
                            if (!to || !amt) {
                              setWalletTransfersError('To address and amount are required.');
                              return;
                            }

                            setTransferSubmitting(true);
                            setWalletTransfersError('');
                            try {
                              const res = await fetch(`/api/member/groups/${groupId}/wallet/transfers`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ toAddress: to, amount: amt })
                              });

                              const json = await res.json().catch(() => null);
                              if (!res.ok) {
                                setWalletTransfersError(json?.error || 'Imeshindikana kuanzisha transfer.');
                                return;
                              }

                              setTransferToAddress('');
                              setTransferAmount('');

                              const refresh = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                              const refreshJson = await refresh.json().catch(() => null);
                              if (refresh.ok) {
                                setWalletTransfers(
                                  Array.isArray(refreshJson?.transfers) ? (refreshJson.transfers as WalletTransferRow[]) : []
                                );
                              }
                            } catch (err) {
                              setWalletTransfersError(err instanceof Error ? err.message : 'Imeshindikana kuanzisha transfer.');
                            } finally {
                              setTransferSubmitting(false);
                            }
                          }}
                        >
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">To address</label>
                            <input
                              value={transferToAddress}
                              onChange={(e) => setTransferToAddress(e.target.value)}
                              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="0x..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (USDC)</label>
                            <input
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. 10.5"
                            />
                          </div>
                          <div className="md:col-span-3 flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={transferSubmitting}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                transferSubmitting
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                              }`}
                            >
                              {transferSubmitting ? 'Submitting...' : 'Propose Transfer'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="mt-4 space-y-2">
                        {walletTransfers.map((t) => (
                          <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Transfer #{t.id}</p>
                                <p className="text-xs text-gray-500 mt-1">To: {shortAddress(t.to_address)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Amount: {formatBaseUnits(t.amount_base_units, 6)} USDC
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Approvals: {t.approval_count ?? 0}/{t.approvals_required}
                                </p>
                                {t.executed_tx_hash && (
                                  <a
                                    href={`https://basescan.org/tx/${t.executed_tx_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-orange-700 hover:text-orange-800 mt-1 inline-block"
                                  >
                                    View on BaseScan
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                                  {t.status}
                                </span>

                                {canApproveOrExecuteTransfer && t.status !== 'executed' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={async () => {
                                        if (!groupId) return;
                                        setWalletTransfersLoading(true);
                                        setWalletTransfersError('');
                                        try {
                                          const res = await fetch(
                                            `/api/member/groups/${groupId}/wallet/transfers/${t.id}/approve`,
                                            { method: 'POST' }
                                          );
                                          const json = await res.json().catch(() => null);
                                          if (!res.ok) {
                                            setWalletTransfersError(json?.error || 'Imeshindikana ku-approve transfer.');
                                            return;
                                          }
                                          const refresh = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                                          const refreshJson = await refresh.json().catch(() => null);
                                          if (refresh.ok) {
                                            setWalletTransfers(
                                              Array.isArray(refreshJson?.transfers)
                                                ? (refreshJson.transfers as WalletTransferRow[])
                                                : []
                                            );
                                          }
                                        } catch (err) {
                                          setWalletTransfersError(
                                            err instanceof Error ? err.message : 'Imeshindikana ku-approve transfer.'
                                          );
                                        } finally {
                                          setWalletTransfersLoading(false);
                                        }
                                      }}
                                      disabled={walletTransfersLoading}
                                      className="px-3 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!groupId) return;
                                        setWalletTransfersLoading(true);
                                        setWalletTransfersError('');
                                        try {
                                          const res = await fetch(
                                            `/api/member/groups/${groupId}/wallet/transfers/${t.id}/execute`,
                                            { method: 'POST' }
                                          );
                                          const json = await res.json().catch(() => null);
                                          if (!res.ok) {
                                            setWalletTransfersError(json?.error || 'Imeshindikana ku-execute transfer.');
                                            return;
                                          }
                                          const refreshWallet = await fetch(`/api/member/groups/${groupId}/wallet`);
                                          const refreshWalletJson = await refreshWallet.json().catch(() => null);
                                          if (refreshWallet.ok) setWalletSummary((refreshWalletJson as WalletSummary) || null);

                                          const refresh = await fetch(`/api/member/groups/${groupId}/wallet/transfers`);
                                          const refreshJson = await refresh.json().catch(() => null);
                                          if (refresh.ok) {
                                            setWalletTransfers(
                                              Array.isArray(refreshJson?.transfers)
                                                ? (refreshJson.transfers as WalletTransferRow[])
                                                : []
                                            );
                                          }
                                        } catch (err) {
                                          setWalletTransfersError(
                                            err instanceof Error ? err.message : 'Imeshindikana ku-execute transfer.'
                                          );
                                        } finally {
                                          setWalletTransfersLoading(false);
                                        }
                                      }}
                                      disabled={walletTransfersLoading}
                                      className="px-3 py-2 rounded-lg text-sm font-medium border bg-orange-600 text-white border-orange-600 hover:bg-orange-700"
                                    >
                                      Execute
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {walletTransfers.length === 0 && (
                          <p className="text-sm text-gray-600">No transfer proposals yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {walletSummary?.wallet === null && !walletLoading && !walletError && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">No wallet created yet.</p>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Recent Proposals</p>
                      <p className="text-sm text-gray-600 mt-1">Visible to all group members.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('decisions')}
                      className="text-sm text-orange-700 hover:text-orange-800"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {recentProposals.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/member-dashboard/groups/${groupId}/proposals/${p.id}`)}
                        className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Created by: {p.created_by_name || '—'}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                            {String(p.status)}
                          </span>
                        </div>
                      </button>
                    ))}

                    {recentProposals.length === 0 && <p className="text-sm text-gray-600">No proposals yet.</p>}
                  </div>
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
                {showCreateProposal && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Create Proposal</p>
                        <p className="text-sm text-gray-600 mt-1">Only leadership roles can create proposals.</p>
                      </div>
                      <button
                        onClick={() => setShowCreateProposal(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Close
                      </button>
                    </div>

                    {!canCreateProposal && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                        You do not have permission to create proposals.
                      </div>
                    )}

                    <form
                      className="mt-4 space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!groupId) return;
                        if (!canCreateProposal) return;

                        const t = proposalTitle.trim();
                        const d = proposalDescription.trim();
                        if (!t) {
                          setError('Proposal title is required.');
                          return;
                        }

                        setProposalSubmitting(true);
                        setError('');
                        try {
                          const res = await fetch(`/api/member/groups/${groupId}/proposals`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: t, description: d })
                          });

                          if (res.status === 401) {
                            router.push('/login');
                            return;
                          }

                          const json = await res.json().catch(() => null);
                          if (!res.ok) {
                            setError(json?.error || 'Imeshindikana kuunda pendekezo.');
                            return;
                          }

                          const created = json?.proposal as ProposalRow | undefined;
                          if (created) {
                            setProposals((prev) => [created, ...prev]);
                          }
                          setProposalTitle('');
                          setProposalDescription('');
                          setShowCreateProposal(false);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Imeshindikana kuunda pendekezo.');
                        } finally {
                          setProposalSubmitting(false);
                        }
                      }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          value={proposalTitle}
                          onChange={(e) => setProposalTitle(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g. Increase monthly contribution"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={proposalDescription}
                          onChange={(e) => setProposalDescription(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Explain the proposal..."
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={proposalSubmitting || !canCreateProposal}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            proposalSubmitting || !canCreateProposal
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {proposalSubmitting ? 'Creating...' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateProposal(false)}
                          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-900">Proposals</p>
                  <p className="text-sm text-gray-600 mt-1">Latest proposals for this group.</p>
                </div>

                {proposals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/member-dashboard/groups/${groupId}/proposals/${p.id}`)}
                    className="w-full text-left border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                        {p.description && <p className="text-sm text-gray-700 mt-1">{p.description}</p>}
                        <p className="text-xs text-gray-500 mt-2">Created by: {p.created_by_name || '—'}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">
                        {String(p.status)}
                      </span>
                    </div>
                  </button>
                ))}

                {proposals.length === 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <p className="text-sm text-gray-600">No proposals yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
