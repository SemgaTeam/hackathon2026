CREATE TABLE IF NOT EXISTS playlists(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_items(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket TEXT NOT NULL,
    key TEXT NOT NULL,
    mime_type VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS medialibs(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
)

CREATE TABLE IF NOT EXISTS playlist_items(
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    media_item_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,

    PRIMARY KEY (playlist_id, position)
    DEFERRABLE INITIALLY IMMEDIATE,
    UNIQUE (playlist_id, media_item_id)
);

CREATE INDEX idx_playlist_items_playlist
ON playlist_items (playlist_id, position);