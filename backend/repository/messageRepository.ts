import { UUID } from "node:crypto";
import { Message } from "./message";
import { QueryFunction } from "./users";
import WebSocket from "ws";
import { error } from "node:console";
import test from "node:test";
import { stat } from "node:fs";

export interface MessageInterface {
  getAllByUserID(id: UUID): Promise<Message[]>;
  Save(msg: Message): Promise<void>;
}
const clients = new Map<WebSocket, { userId: string; role: string }>();

export class MessageRepository implements MessageInterface {
  private readonly query: QueryFunction;
  private readonly ws: WebSocket.Server;
  constructor(query: QueryFunction) {
    this.query = query;
    this.ws = new WebSocket.Server({ port: 8080 });
    this.ws.on("connection", (ws, req) => {
      console.log("Новый клиент подключился");

      ws.on("message", async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          const role = await this.query(
            `SELECT role FROM users WHERE user_id = $1 RETURNING *`,
            [msg.user_id],
          );
          if (!clients.has(ws)) {
            clients.set(ws, { userId: msg.user_id, role: role.toString() });
          }
          await this.sendMessage(msg.user_id, msg.contents, role);
        } catch {
          console.error("Ошибка обработки ообщения:", error);
        }
      });
      ws.on("close", () => {
        clients.delete(ws);
        console.log("Клиент отключился");
      });
    });
  }

  async Save(msg: Message): Promise<void> {
    await this.query<Message>(
      `INSERT INTO messages (user_id, sender_id, status, contents, created_ad) VALUES ($1,$2,$3,$4)`,
      [msg.user_id, msg.sender_id, msg.status, msg.contents, Date.now()],
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
  private async sendMessage(
    senderId: string,
    content: string,
    status: string,
    senderRole: string,
  ) {
    const getHostId = await this.query(
      'SELECT user_id FROM users WHERE role LIKE "%host%"',
    );
    const msg: Message = {
      user_id: getHostId,
      sender_id: senderId,
      status: "Новый",
      contents: content,
    };
    await this.Save(msg);
    clients.forEach((clientData, clientWs) => {
      if (
        clientWs.readyState === WebSocket.OPEN &&
        clientData.role === "host"
      ) {
        clientWs.send(
          JSON.stringify({
            user_id: msg.sender_id,
            content: msg.contents,
          }),
        );
      }
    });
  }
}
