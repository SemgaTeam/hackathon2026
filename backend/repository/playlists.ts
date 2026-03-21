import { UUID } from "node:crypto";
import { MediaItem } from "./mediaItems";
import { QueryResult, QueryResultRow } from "pg";

export interface Playlist {
    id: UUID;
    name: string;
}

export interface MediaLib {
    id: UUID;
    user_id: UUID;
}

export interface PlaylistItem {
    playlist_id: UUID;
    item_id: UUID;
    number: number;
}

export interface PlaylistInterface {
    savePlaylist(playlist: Playlist): Promise<void>;
    saveMedialib(lib: MediaLib): Promise<void>;

    getPlaylistByID(id: UUID): Promise<Playlist>;
    getMedialibByID(id: UUID): Promise<MediaLib>;
    getPlaylistByName(name: string): Promise<Playlist>;
    getMedialibByUserID(id: UUID): Promise<MediaLib>;

    getPlaylistItems(id: UUID): Promise<MediaItem[]>;
    getMedialibItems(id: UUID): Promise<MediaItem[]>;
}

type QueryFunction = <T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
) => Promise<QueryResult<T>>;

export class PlaylistRepository implements PlaylistInterface {
    private readonly query: QueryFunction;    

    constructor(query: QueryFunction) {
        this.query = query;
    }

    async savePlaylist(playlist: Playlist): Promise<void> {
        const sql = `
            INSERT INTO playlists (id, name)
            VALUES ($1, $2)
        `;
        await this.query(sql, [playlist.id, playlist.name]);
    }

    async saveMedialib(lib: MediaLib): Promise<void> {
        const sql = `
            INSERT INTO medialibs (id, user_id)
            VALUES ($1, $2)
        `;
        await this.query(sql, [lib.id, lib.user_id]);
    }

    async getPlaylistByID(id: UUID): Promise<Playlist> {
        const { rows } = await this.query<Playlist>(
            "SELECT * FROM playlists WHERE id = $1",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Playlist not found");
        }

        return rows[0];
    }

    async getMedialibByID(id: UUID): Promise<MediaLib> {
        const { rows } = await this.query<MediaLib>(
            "SELECT * FROM medialibs WHERE id = $1",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Medialib not found");
        }

        return rows[0];
    }

    async getPlaylistByName(name: string): Promise<Playlist> {
        const { rows } = await this.query<Playlist>(
            "SELECT * FROM playlists WHERE name = $1",
            [name]
        );

        if (rows.length === 0) {
            throw new Error("Playlist not found");
        }

        return rows[0];
    }

    async getMedialibByUserID(id: UUID): Promise<MediaLib> {
        const { rows } = await this.query<MediaLib>(
            "SELECT * FROM medialibs WHERE user_id = $1",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Medialib not found");
        }

        return rows[0];
    }

    async getPlaylistItems(id: UUID): Promise<MediaItem[]> {
        const { rows } = await this.query<MediaItem>(
            `
            SELECT mi.*
            FROM media_items mi
            JOIN playlist_items pi ON pi.item_id = mi.id
            WHERE pi.playlist_id = $1
            ORDER BY pi.number ASC
            `,
            [id]
        );

        return rows;
    }

    async getMedialibItems(id: UUID): Promise<MediaItem[]> {
        const { rows } = await this.query<MediaItem>(
            `
            SELECT mi.*
            FROM media_items mi
            JOIN playlist_items pi ON pi.item_id = mi.id
            WHERE pi.playlist_id = $1
            ORDER BY pi.number ASC
            `,
            [id]
        );

        return rows;
    }
}
