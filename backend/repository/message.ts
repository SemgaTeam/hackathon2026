import { UUID } from "node:crypto";
export interface Message {
    id: UUID;
    user_id: UUID;
    sender_id: UUID;
    status: string;
    contents: string;
}