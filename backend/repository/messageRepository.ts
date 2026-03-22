import WebSocket from "ws";
import { UUID, randomUUID } from "node:crypto";
import { Message } from "./message"; 
import { QueryFunction } from "./users";

interface ClientInfo {
  userId: UUID;
  role: string;
}

type MessageStatus = "new" | "in_progress" | "completed";

const clients = new Map<WebSocket, ClientInfo>();

export class MessageRepository {
  private readonly query: QueryFunction;
  private readonly wss: WebSocket.Server;

  constructor(query: QueryFunction) {
    this.query = query;
    const port = parseInt(process.env.WS_PORT || "8080");
    this.wss = new WebSocket.Server({ port });

    console.log(`[WS-SERVER] Initialized on port: ${port}`);

    this.wss.on("connection", (ws, req) => {
      ws.on("message", async (data) => {
        try {
          const payload = JSON.parse(data.toString());

          if (payload.type === "AUTH") {
            const res = await this.query<{role: string}>(
              `SELECT role FROM users WHERE id = $1`, [payload.user_id]
            );
            const role = res.rows[0]?.role || "user";
            clients.set(ws, { userId: payload.user_id as UUID, role });
            return;
          }

          if (payload.type === "UPDATE_STATUS") {
            const { messageId, status } = payload as { messageId: string, status: MessageStatus };
            await this.query(`UPDATE messages SET status = $1 WHERE id = $2`, [status, messageId]);
            
            const msgRes = await this.query<Message>(`SELECT * FROM messages WHERE id = $1`, [messageId]);
            const msg = msgRes.rows[0];
            if (msg) {
              this.broadcast({ 
                type: "STATUS_UPDATED", 
                messageId, 
                status, 
                sender_id: msg.sender_id, 
                user_id: msg.user_id 
              });
            }
            return;
          }

          const sender = clients.get(ws);
          if (!sender) return;

          await this.processMessage(sender.userId, payload.contents, sender.role, payload.to_user_id);

        } catch (err) {
          console.error(`[WS-ERROR]`, err);
        }
      });

      ws.on("close", () => clients.delete(ws));
    });
  }

  private async processMessage(senderId: UUID, contents: string, senderRole: string, toUserId?: UUID) {
    let targetId: UUID;

    if ((senderRole === 'admin' || senderRole === 'host') && toUserId) {
      targetId = toUserId; 
    } else {
      const hostRes = await this.query<{id: UUID}>(
        `SELECT id FROM users WHERE role = 'admin' OR role = 'host' LIMIT 1`
      );
      targetId = hostRes.rows[0]?.id || senderId; 
    }

    const newMessage: Message = {
      id: randomUUID() as UUID,
      user_id: targetId, 
      sender_id: senderId,
      status: "new",
      contents: contents
    };

    await this.saveToDb(newMessage);

    this.broadcast({
      id: newMessage.id,
      user_id: newMessage.user_id,
      sender_id: newMessage.sender_id,
      content: newMessage.contents,
      status: newMessage.status,
      role: senderRole
    });
  }

  private broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((info, clientWs) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        const isAdmin = info.role === 'admin' || info.role === 'host';
        const isParticipant = info.userId === data.sender_id || info.userId === data.user_id;

        if (isAdmin || isParticipant) {
          clientWs.send(message);
        }
      }
    });
  }

  private async saveToDb(msg: Message): Promise<void> {
    await this.query(
      `INSERT INTO messages (id, user_id, sender_id, status, contents, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [msg.id, msg.user_id, msg.sender_id, msg.status, msg.contents]
    );
  }
}