import { UUID } from "node:crypto";
import { Message } from "./message";

export interface MessageRepository {
    getAllByUserID(id: UUID): Promise<Message[]>;
    Save(msg: Message): Promise<void>;
}
