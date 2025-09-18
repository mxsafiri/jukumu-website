import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get group leadership roles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        gm.id,
        gm.role,
        m.full_name,
        m.email,
        gm.joined_date,
        gm.status
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      WHERE gm.group_id = $1 AND gm.role IN ('mwenyekiti', 'katibu', 'mwekahazina', 'leader')
      ORDER BY 
        CASE gm.role 
          WHEN 'leader' THEN 1
          WHEN 'mwenyekiti' THEN 2
          WHEN 'katibu' THEN 3
          WHEN 'mwekahazina' THEN 4
        END
    `, [id]);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update group leadership roles
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, role } = body;
    
    // Validate role
    const validRoles = ['leader', 'member', 'mwenyekiti', 'katibu', 'mwekahazina'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Nafasi si sahihi. Chagua: Kiongozi, Mwanachama, Mwenyekiti, Katibu, au MwekaHazina' 
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if member is already in the group
      const memberCheck = await client.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND member_id = $2',
        [id, memberId]
      );
      
      if (memberCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Mwanachama hayupo kwenye kundi hili' 
        }, { status: 400 });
      }
      
      // For leadership roles (except member), check if role is already taken
      if (['mwenyekiti', 'katibu', 'mwekahazina'].includes(role)) {
        const roleCheck = await client.query(
          'SELECT id FROM group_members WHERE group_id = $1 AND role = $2 AND member_id != $3',
          [id, role, memberId]
        );
        
        if (roleCheck.rows.length > 0) {
          const roleNames = {
            'mwenyekiti': 'Mwenyekiti',
            'katibu': 'Katibu',
            'mwekahazina': 'MwekaHazina'
          };
          client.release();
          return NextResponse.json({ 
            error: `Nafasi ya ${roleNames[role as keyof typeof roleNames]} tayari imechukuliwa na mwanachama mwingine` 
          }, { status: 400 });
        }
      }
      
      // Update the member's role
      const result = await client.query(`
        UPDATE group_members 
        SET role = $1, updated_at = CURRENT_TIMESTAMP
        WHERE group_id = $2 AND member_id = $3
        RETURNING *
      `, [role, id, memberId]);
      
      client.release();
      
      const roleNames = {
        'leader': 'Kiongozi',
        'member': 'Mwanachama',
        'mwenyekiti': 'Mwenyekiti',
        'katibu': 'Katibu',
        'mwekahazina': 'MwekaHazina'
      };
      
      return NextResponse.json({ 
        success: true,
        message: `Nafasi ya mwanachama imebadilishwa kuwa ${roleNames[role as keyof typeof roleNames]} kwa mafanikio!`,
        data: result.rows[0]
      });
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kubadilisha nafasi ya uongozi' 
    }, { status: 500 });
  }
}
