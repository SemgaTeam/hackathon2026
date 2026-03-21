CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (
    id, 
    username, 
    fullname, 
    role, 
    password, 
    is_deleted, 
    created_at
) 
VALUES (
    uuid_generate_v4(), 
    'admin', 
    'System Administrator', 
    'admin', 
    '$2b$10$IJIpucmZ/gXX2Dhj0iUO9.J70PJrCTkGsvMYz6CIqNJT7S3lRA6.e', 
    false, 
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;