import { MediaItem } from "./mediaItems"

export type Queue = {
    mediaItems: MediaItem[];
    options: PlaybackOptions;
}

export type PlaybackOptions = {
    loop: boolean;
    shuffle: boolean;
    isPlaying: boolean;
}

export interface QueueInterface {
    SaveItems(items: MediaItem[]): Promise<void>;
    SaveOptions(options: PlaybackOptions): Promise<void>;
    GetQueue(): Promise<Queue>;
}

export class InMemoryQueueRepository implements QueueInterface {
    private queue: Queue;

    constructor(initial?: Partial<Queue>) {
        this.queue = {
            mediaItems: initial?.mediaItems ? [...initial.mediaItems] : [],
            options: initial?.options ?? {
                loop: false,
                shuffle: false,
                isPlaying: false
            }
        };
    }

    async SaveItems(items: MediaItem[]): Promise<void> {
        this.queue.mediaItems = [...items];
    }

    async SaveOptions(options: PlaybackOptions): Promise<void> {
        this.queue.options = { ...options };
    }

    async GetQueue(): Promise<Queue> {
        return {
            mediaItems: [...this.queue.mediaItems],
            options: { ...this.queue.options }
        };
    }
}
