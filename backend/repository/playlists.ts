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
    position: number;
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

    moveItemBefore(
        playlistId: UUID, 
        itemPosition: number, 
        beforePosition: number
    ): Promise<void>;
    normalizePositions(playlistId: UUID): Promise<void>;
}

type QueryFunction = <T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
) => Promise<QueryResult<T>>;

export class PlaylistRepository implements PlaylistInterface {
    private readonly query: QueryFunction;    
    private static readonly positionStep = 1000;

    constructor(query: QueryFunction) {
        this.query = query;
    }

    async savePlaylist(playlist: Playlist): Promise<void> {
        const sql = `
            INSERT INTO playlists (id, name, items)
            VALUES ($1, $2, $3)
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
    
    async addItemToEnd(playlistId: UUID, itemId: UUID): Promise<void> { // works for playlists and medialibs
        const sql = `
            INSERT INTO playlist_items (playlist_id, media_item_id, position)
            SELECT $1, $2, COALESCE(MAX(position), 0) + 1000
            FROM playlist_items
            WHERE playlist_id = $1;
        `;
        await this.query(sql, [playlistId, itemId])
    }

    async moveItemBefore(
        playlistId: UUID, 
        itemPosition: number, 
        beforePosition: number
    ): Promise<void> {
        if (itemPosition === beforePosition) {
            return;
        }

        const { rows } = await this.query<{ media_item_id: UUID; position: number }>(
            `
            SELECT media_item_id, position
            FROM playlist_items
            WHERE playlist_id = $1
            ORDER BY position ASC
            `,
            [playlistId]
        );

        if (rows.length === 0) {
            throw new Error("Playlist is empty");
        }

        const itemIndex = rows.findIndex(r => r.position === itemPosition);
        const beforeIndex = rows.findIndex(r => r.position === beforePosition);

        if (itemIndex === -1) {
            throw new Error("Item position not found");
        }
        if (beforeIndex === -1) {
            throw new Error("Before position not found");
        }

        const moving = rows[itemIndex];
        const rowsWithoutMoving = rows.filter(r => r.position !== itemPosition);
        const beforeIndexWithoutMoving = rowsWithoutMoving.findIndex(r => r.position === beforePosition);
        const prevPosition = beforeIndexWithoutMoving <= 0
            ? 0
            : rowsWithoutMoving[beforeIndexWithoutMoving - 1].position;

        if (beforePosition - prevPosition > 1 && (beforePosition - prevPosition) % 2 == 0) {
            const newPosition = (beforePosition + prevPosition) / 2;
            await this.query(
                `
                UPDATE playlist_items
                SET position = $1
                WHERE playlist_id = $2 AND media_item_id = $3
                `,
                [newPosition, playlistId, moving.media_item_id]
            );
            return;
        }

        const reordered = rows.slice();
        reordered.splice(itemIndex, 1);
        const targetIndex = reordered.findIndex(r => r.position === beforePosition);
        reordered.splice(targetIndex, 0, moving);
        await this.normalizePositionsWithOrder(
            playlistId, 
            reordered.map(r => r.media_item_id)
        );
    }

    async normalizePositions(playlistId: UUID): Promise<void> {
        const { rows } = await this.query<{ media_item_id: UUID }>(
            `
            SELECT media_item_id
            FROM playlist_items
            WHERE playlist_id = $1
            ORDER BY position ASC
            `,
            [playlistId]
        );

        await this.normalizePositionsWithOrder(
            playlistId, 
            rows.map(r => r.media_item_id)
        );
    }

    private async normalizePositionsWithOrder(
        playlistId: UUID, 
        orderedItemIds: UUID[]
    ): Promise<void> {
        if (orderedItemIds.length === 0) {
            return;
        }

        const cases = orderedItemIds
            .map((_, index) => `WHEN $${index + 2} THEN ${(index + 1) * PlaylistRepository.positionStep}`)
            .join(" ");

        const sql = `
            UPDATE playlist_items
            SET position = CASE media_item_id
                ${cases}
                ELSE position
            END
            WHERE playlist_id = $1
        `;

        await this.query(sql, [playlistId, ...orderedItemIds]);
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
            ORDER BY pi.position ASC
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
            ORDER BY pi.position ASC
            `,
            [id]
        );

        return rows;
    }
}
