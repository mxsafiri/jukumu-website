import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Get comprehensive admin statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM members WHERE status = 'active') as total_members,
        (SELECT COUNT(*) FROM groups WHERE status = 'active') as total_groups,
        (SELECT COALESCE(SUM(total_investment), 0) FROM groups) as total_investment,
        (SELECT COALESCE(SUM(actual_return), 0) FROM investments WHERE status = 'active') as total_returns,
        (SELECT COUNT(*) FROM members WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_members_month,
        (SELECT COUNT(*) FROM groups WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_groups_month
    `;
    
    const result = await client.query(statsQuery);
    client.release();
    
    const stats = result.rows[0];
    
    return NextResponse.json({
      totalMembers: parseInt(stats.total_members),
      totalGroups: parseInt(stats.total_groups),
      totalInvestment: parseFloat(stats.total_investment),
      totalReturns: parseFloat(stats.total_returns),
      newMembersThisMonth: parseInt(stats.new_members_month),
      newGroupsThisMonth: parseInt(stats.new_groups_month),
      returnRate: stats.total_investment > 0 ? (stats.total_returns / stats.total_investment * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
