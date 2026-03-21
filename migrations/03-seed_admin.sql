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
    'FTie0G4NOYkEC73IWEUkguJgk/VvAeh2mhu1TZeRjQoLLi6gwHqfa', 
    false, 
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;