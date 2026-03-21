import { UUID } from "node:crypto";
import { Message } from "./message";
import { QueryFunction } from "./users";

export interface MessageInterface {
  getAllByUserID(id: UUID): Promise<Message[]>;
  Save(msg: Message): Promise<void>;
}
export class MessageRepository implements MessageInterface {
  private readonly query: QueryFunction;

  constructor(query: QueryFunction) {
    this.query = query;
  }
  async Save(msg: Message): Promise<void> {
    await this.query<Message>(
      `INSERT INTO messages (user_id, sender_id, status, contents)`,
    );
  }
  async getAllByUserID(id: UUID): Promise<Message[]> {
    const { rows } = await this.query<Message[]>(
      `SELECT * FROM messages WHERE id =$1 RETURNING *`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      throw new Error("error creating playlist");
    }
    return row;
  }
}
