import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Get total members
    const membersResult = await client.query(`
      SELECT COUNT(*) as total_members
      FROM users 
      WHERE role = 'member' AND status = 'active'
    `);
    
    // Get total groups
    const groupsResult = await client.query(`
      SELECT COUNT(*) as total_groups
      FROM groups 
      WHERE status = 'active'
    `);
    
    // Get total investment and calculate average return
    const investmentResult = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_investment,
        COALESCE(SUM(actual_return), 0) as total_returns,
        COUNT(*) as investment_count
      FROM investments 
      WHERE status = 'active'
    `);
    
    // Get active regions (count distinct locations from members)
    const regionsResult = await client.query(`
      SELECT COUNT(DISTINCT location) as active_regions
      FROM users 
      WHERE role = 'member' AND status = 'active' AND location IS NOT NULL
    `);
    
    client.release();
    
    const totalMembers = parseInt(membersResult.rows[0].total_members) || 0;
    const totalGroups = parseInt(groupsResult.rows[0].total_groups) || 0;
    const totalInvestment = parseFloat(investmentResult.rows[0].total_investment) || 0;
    const totalReturns = parseFloat(investmentResult.rows[0].total_returns) || 0;
    const activeRegions = parseInt(regionsResult.rows[0].active_regions) || 0;
    
    // Calculate average return percentage
    const averageReturn = totalInvestment > 0 
      ? Math.round((totalReturns / totalInvestment) * 100) 
      : 0;
    
    const stats = {
      totalMembers,
      totalGroups,
      totalInvestment,
      totalReturns,
      averageReturn,
      activeRegions
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
