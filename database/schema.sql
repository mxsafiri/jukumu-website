-- JUKUMU Fund Database Schema

-- Users table (for authentication)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    business_type VARCHAR(100),
    business_name VARCHAR(255),
    business_description TEXT,
    group_name VARCHAR(255),
    gender VARCHAR(20),
    age INTEGER,
    monthly_revenue DECIMAL(15,2),
    employee_count INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    leader_id INTEGER REFERENCES users(id),
    founded_date DATE,
    total_investment DECIMAL(15,2) DEFAULT 0,
    monthly_contribution DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members relationship
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    member_id INTEGER REFERENCES members(id),
    joined_date DATE DEFAULT CURRENT_DATE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    amount DECIMAL(15,2) NOT NULL,
    equity_percentage DECIMAL(5,2) DEFAULT 30.00,
    investment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    expected_return DECIMAL(15,2),
    actual_return DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training modules
CREATE TABLE training_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours DECIMAL(4,2),
    content_url VARCHAR(500),
    category VARCHAR(100),
    level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member training progress
CREATE TABLE member_training (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    training_id INTEGER REFERENCES training_modules(id),
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly contributions tracking
CREATE TABLE monthly_contributions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    group_id INTEGER REFERENCES groups(id),
    amount DECIMAL(15,2) NOT NULL,
    contribution_month DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'members', 'groups', 'specific')),
    target_group_id INTEGER REFERENCES groups(id),
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Business reports
CREATE TABLE business_reports (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    reporting_month DATE NOT NULL,
    revenue DECIMAL(15,2),
    expenses DECIMAL(15,2),
    profit DECIMAL(15,2),
    employee_count INTEGER,
    customers_served INTEGER,
    challenges TEXT,
    achievements TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educational Content
CREATE TABLE educational_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration VARCHAR(50),
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    image_url VARCHAR(500),
    author_id INTEGER REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Progress Tracking
CREATE TABLE content_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content_id INTEGER REFERENCES educational_content(id),
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

-- System Settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@jukumu.co.tz', '$2b$10$rQZ8kqH9mV7nF2pL3wX8.eK5mN9oP1qR2sT3uV4wX5yZ6aB7cD8eF', 'JUKUMU Admin', 'admin');

-- Insert sample educational content
INSERT INTO educational_content (title, description, content, category, duration, difficulty_level, image_url, author_id, is_published) VALUES
('Msingi wa Biashara', 'Jifunze misingi ya kuanzisha na kuendesha biashara yenye mafanikio', 'Mafunzo haya yanalenga kuwafundisha wajasiriamali misingi muhimu ya biashara...', 'Biashara', '2 masaa', 'beginner', '/PXL_20250618_095258793.PORTRAIT.jpg', 1, true),
('Uongozi wa Kikundi', 'Mbinu za uongozi bora na jinsi ya kuongoza timu kwa ufanisi', 'Uongozi ni ufunguo wa mafanikio ya kila kundi...', 'Uongozi', '1.5 masaa', 'intermediate', '/PXL_20250621_095639982.PORTRAIT.jpg', 1, true),
('Usimamizi wa Fedha', 'Jifunze jinsi ya kusimamia fedha za biashara na makundi', 'Usimamizi mzuri wa fedha ni muhimu kwa mafanikio...', 'Fedha', '3 masaa', 'intermediate', '/PXL_20250707_142902155.PORTRAIT.jpg', 1, true);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('default_equity_percentage', '30.00', 'Default equity percentage for investments'),
('minimum_monthly_contribution', '50000', 'Minimum monthly contribution in TSH'),
('minimum_group_size', '5', 'Minimum number of members required to form a group'),
('maximum_group_size', '20', 'Maximum number of members allowed in a group');

-- Insert sample training modules
INSERT INTO training_modules (title, description, duration_hours, category, level) VALUES
('Uongozi wa Biashara', 'Jifunze jinsi ya kuongoza biashara yako kwa ufanisi', 2.0, 'Leadership', 'beginner'),
('Utunzaji wa Fedha', 'Mafunzo ya jinsi ya kutunza na kupanga fedha za biashara', 1.5, 'Finance', 'beginner'),
('Masoko na Uuzaji', 'Jinsi ya kupata na kuwashawishi wateja', 3.0, 'Marketing', 'intermediate'),
('Teknolojia katika Biashara', 'Matumizi ya teknolojia kuongeza ufanisi', 2.5, 'Technology', 'intermediate');

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_member_id ON group_members(member_id);
CREATE INDEX idx_investments_group_id ON investments(group_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_monthly_contributions_member_id ON monthly_contributions(member_id);
CREATE INDEX idx_monthly_contributions_status ON monthly_contributions(status);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_business_reports_member_id ON business_reports(member_id);
