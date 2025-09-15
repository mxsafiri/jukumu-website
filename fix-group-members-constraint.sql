-- Add unique constraint to prevent duplicate group memberships
ALTER TABLE group_members 
ADD CONSTRAINT unique_group_member 
UNIQUE (group_id, member_id);

-- Create index for better performance on group membership queries
CREATE INDEX IF NOT EXISTS idx_group_members_unique ON group_members(group_id, member_id);
