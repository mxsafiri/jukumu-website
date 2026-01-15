import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

let cachedGroupMembersHasUpdatedAt: boolean | null = null;
let cachedRoleConstraintUpgraded: boolean | null = null;

async function getGroupMembersHasUpdatedAt(client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }) {
  if (cachedGroupMembersHasUpdatedAt !== null) return cachedGroupMembersHasUpdatedAt;

  const res = await client.query(
    `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'group_members'
      AND column_name = 'updated_at'
    LIMIT 1
    `
  );

  cachedGroupMembersHasUpdatedAt = res.rows.length > 0;
  return cachedGroupMembersHasUpdatedAt;
}

async function ensureGroupMembersRoleConstraint(client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }) {
  if (cachedRoleConstraintUpgraded) return;

  await client.query(`ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_role_check;`);
  await client.query(`
    ALTER TABLE group_members
    ADD CONSTRAINT group_members_role_check
    CHECK (role IN ('leader', 'member', 'mwenyekiti', 'katibu', 'mwekahazina'))
  `);

  cachedRoleConstraintUpgraded = true;
}

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
      const hasUpdatedAt = await getGroupMembersHasUpdatedAt(client);
      const updateSql = hasUpdatedAt
        ? `
          UPDATE group_members
          SET role = $1, updated_at = CURRENT_TIMESTAMP
          WHERE group_id = $2 AND member_id = $3
          RETURNING *
          `
        : `
          UPDATE group_members
          SET role = $1
          WHERE group_id = $2 AND member_id = $3
          RETURNING *
          `;

      let result;
      try {
        result = await client.query(updateSql, [role, id, memberId]);
      } catch (e) {
        if (e instanceof Error && e.message.includes('check constraint')) {
          try {
            await ensureGroupMembersRoleConstraint(client);
            result = await client.query(updateSql, [role, id, memberId]);
          } catch (upgradeErr) {
            client.release();
            const msg = upgradeErr instanceof Error ? upgradeErr.message : 'Unknown error';
            return NextResponse.json(
              {
                error: 'Nafasi hii haijaidhinishwa bado. Tafadhali sasisha mfumo wa data (schema) kisha jaribu tena.',
                details: msg
              },
              { status: 400 }
            );
          }
        } else {
          throw e;
        }
      }
      
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
      console.error('Database error in leadership update:', dbError);
      
      // Check if it's a constraint violation (likely the role constraint)
      if (dbError instanceof Error && dbError.message.includes('check constraint')) {
        return NextResponse.json({ 
          error: 'Nafasi hii haijaidhinishwa bado. Tumia "/api/admin/update-schema" kwanza kubadilisha mfumo wa data.',
          details: 'Database schema needs to be updated to support new leadership roles'
        }, { status: 400 });
      }

      if (dbError instanceof Error && dbError.message.includes('updated_at')) {
        return NextResponse.json({
          error: 'Tafadhali sasisha mfumo wa data (schema) kisha jaribu tena.',
          details: dbError.message
        }, { status: 400 });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kubadilisha nafasi ya uongozi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
