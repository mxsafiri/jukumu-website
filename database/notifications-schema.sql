-- Notifications table for JUKUMU platform
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    category VARCHAR(50) NOT NULL DEFAULT 'general', -- 'group', 'investment', 'system', 'general'
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255), -- Optional URL for action buttons
    action_text VARCHAR(100), -- Text for action button
    metadata JSONB, -- Additional data (group_id, investment_id, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    expires_at TIMESTAMP -- Optional expiration date
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id INTEGER,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50) DEFAULT 'info',
    p_category VARCHAR(50) DEFAULT 'general',
    p_action_url VARCHAR(255) DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_expires_at TIMESTAMP DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    notification_id INTEGER;
BEGIN
    INSERT INTO notifications (
        user_id, title, message, type, category, 
        action_url, action_text, metadata, expires_at
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_category,
        p_action_url, p_action_text, p_metadata, p_expires_at
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id INTEGER, p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE id = p_notification_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Sample notifications for testing
INSERT INTO notifications (user_id, title, message, type, category, metadata) VALUES
(1, 'Karibu JUKUMU!', 'Hongera kwa kujiunga na mfumo wa JUKUMU. Anza safari yako ya uwekezaji leo!', 'success', 'system', '{"welcome": true}'),
(1, 'Umepokea Mwaliko wa Kundi', 'Umealikwa kujiunga na kundi la "Solar Latern". Bonyeza hapa kuona maelezo zaidi.', 'info', 'group', '{"group_id": 1, "action": "join_group"}');
