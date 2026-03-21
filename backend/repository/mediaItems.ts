import { UUID } from "node:crypto";

export interface MediaItem {
    id: UUID;
    bucket: string;
    key: string;
    mime_type: string;
};