import { PlaylistInterface, Playlist } from "../repository/playlists";
import { QueueInterface } from "../repository/queue";
import { UUID } from "node:crypto";
import { MediaItem } from "../repository/mediaItems";
 
export class Service {
    private readonly queue: QueueInterface;
    private readonly playlist: PlaylistInterface;

    constructor(queue: QueueInterface, playlist: PlaylistInterface) {
        this.queue = queue;
        this.playlist = playlist;
    }

    async toggleLoop(): Promise<void> {
        let queue = await this.queue.GetQueue()
        queue.options.loop = !queue.options.loop;

        await this.queue.SaveOptions(queue.options);
    }

    async runPlaylist(playlistId: UUID, shuffle: boolean): Promise<void> {
        const playlistItems = await this.playlist.getPlaylistItems(playlistId);

        let queue = await this.queue.GetQueue();
        queue.mediaItems = playlistItems;
        queue.options.shuffle = shuffle;

        await this.queue.SaveItems(queue.mediaItems);
        await this.queue.SaveOptions(queue.options);
    }

    async togglePlayback(): Promise<void> {
        let queue = await this.queue.GetQueue();
        queue.options.isPlaying = !queue.options.isPlaying;

        await this.queue.SaveOptions(queue.options);
    }

    async createPlaylist(playlist: Playlist): Promise<Playlist> {
        if (playlist.name.length === 0) {
            throw new Error("playlist name is empty");
        }

        await this.playlist.savePlaylist(playlist);
        return playlist;
    }

    async addItemToPlaylist(playlistId: UUID, mediaItemId: UUID): Promise<void> {
        this.playlist.getPlaylistByID(playlistId);
        this.playlist.addToEnd(playlistId, mediaItemId);
    }

    async moveItemBefore(playlistId: UUID, itemIndex: number, beforeIndex: number): Promise<void> {
        await this.playlist.moveItemBefore(playlistId, itemIndex, beforeIndex);
    }

    async removeFromPlaylist(playlistId: UUID, itemId: UUID): Promise<MediaItem> {
        let item = await this.playlist.getMediaItemByID(itemId);
        let items = await this.playlist.getPlaylistItems(playlistId);

        if (!items.includes(item)) {
            throw new Error("playlist does not contain this item");
        }

        this.playlist.removeFromPlaylist(playlistId, itemId);
        return item;
    }
}