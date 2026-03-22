import { MediaItem } from "./mediaItems";

export interface Storage {
    get(bucket: string, key: string): Promise<MediaItem>;
    delete(bucket: string, key: string): Promise<void>;
}