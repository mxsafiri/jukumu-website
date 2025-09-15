-- Create join_requests table for managing group join requests
CREATE TABLE IF NOT EXISTS join_requests (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES members(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_join_requests_member_id ON join_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_group_id ON join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Create unique constraint to prevent duplicate pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_join_requests_unique_pending 
ON join_requests(member_id, group_id) 
WHERE status = 'pending';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_join_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_join_requests_updated_at ON join_requests;
CREATE TRIGGER trigger_join_requests_updated_at
    BEFORE UPDATE ON join_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_join_requests_updated_at();

-- Function to approve join request and add member to group
CREATE OR REPLACE FUNCTION approve_join_request(request_id INTEGER, reviewer_id INTEGER, notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    req_record RECORD;
    existing_membership INTEGER;
BEGIN
    -- Get the join request details
    SELECT * INTO req_record FROM join_requests WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found or already processed';
    END IF;
    
    -- Check if member is already in the group
    SELECT COUNT(*) INTO existing_membership 
    FROM group_members 
    WHERE member_id = req_record.member_id AND group_id = req_record.group_id AND status = 'active';
    
    IF existing_membership > 0 THEN
        RAISE EXCEPTION 'Member is already in this group';
    END IF;
    
    -- Add member to group
    INSERT INTO group_members (group_id, member_id, joined_date, role, status)
    VALUES (req_record.group_id, req_record.member_id, CURRENT_DATE, 'member', 'active');
    
    -- Update join request status
    UPDATE join_requests 
    SET status = 'approved', 
        reviewed_by = reviewer_id, 
        reviewed_at = CURRENT_TIMESTAMP,
        review_notes = notes
    WHERE id = request_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject join request
CREATE OR REPLACE FUNCTION reject_join_request(request_id INTEGER, reviewer_id INTEGER, notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update join request status
    UPDATE join_requests 
    SET status = 'rejected', 
        reviewed_by = reviewer_id, 
        reviewed_at = CURRENT_TIMESTAMP,
        review_notes = notes
    WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found or already processed';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
