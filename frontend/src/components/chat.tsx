import { useEffect, useRef, useState } from "react";
import { Send, Shield, MessageSquare, Clock, CheckCircle2, Check } from "lucide-react";

type Message = {
  id: string;
  user_id: string;
  sender_id: string;
  content: string;
  status: "new" | "in_progress" | "completed";
};

export default function Chat({ currentUser }: { currentUser: { id: string, role: string } }) {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'host';

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const connect = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8080";
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: "AUTH", user_id: currentUser.id }));
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "STATUS_UPDATED") {
            setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, status: data.status } : m));
          } else {
            setMessages((prev) => {
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, { ...data, content: data.content || data.contents }];
            });
          }
        } catch (e) { console.error(e); }
      };
    };
    connect();
    return () => wsRef.current?.close();
  }, [currentUser.id]);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!wsRef.current || !content.trim()) return;

    const payload: any = { contents: content };

    // Если админ — отвечаем последнему пользователю в чате
    if (isAdmin) {
      const lastUserMsg = [...messages].reverse().find(m => m.sender_id !== currentUser.id);
      if (lastUserMsg) payload.to_user_id = lastUserMsg.sender_id;
    }

    wsRef.current.send(JSON.stringify(payload));
    setContent("");
  };

  const updateStatus = (msgId: string, status: Message["status"]) => {
    wsRef.current?.send(JSON.stringify({ type: "UPDATE_STATUS", messageId: msgId, status }));
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-[#0A1F33] rounded-[32px] overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isAdmin ? 'bg-amber-500/20 text-amber-500' : 'bg-[#FF4231]/20 text-[#FF4231]'}`}>
            {isAdmin ? <Shield size={18} /> : <MessageSquare size={18} />}
          </div>
          <h2 className="text-white font-bold text-xs uppercase tracking-widest">{isAdmin ? "Admin" : "Support"}</h2>
        </div>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isMyMessage = msg.sender_id === currentUser.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}>
              <div className={`flex items-end gap-3 max-w-[85%] ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`p-4 rounded-[22px] text-sm font-medium border ${isMyMessage ? "bg-[#FF4231] text-white border-transparent rounded-br-none" : "bg-slate-800 text-slate-200 border-slate-700 rounded-bl-none"}`}>
                  {msg.content}
                </div>
                {isAdmin && !isMyMessage && msg.status !== "completed" && (
                  <div className="flex flex-col gap-1">
                    {msg.status === "new" && <button onClick={() => updateStatus(msg.id, "in_progress")} className="p-1.5 text-amber-500 bg-amber-500/10 rounded-lg"><Clock size={14}/></button>}
                    <button onClick={() => updateStatus(msg.id, "completed")} className="p-1.5 text-emerald-500 bg-emerald-500/10 rounded-lg"><CheckCircle2 size={14}/></button>
                  </div>
                )}
              </div>
              <div className={`mt-1 flex items-center gap-2 text-[8px] font-bold uppercase ${isMyMessage ? "flex-row-reverse text-slate-500" : "text-slate-400"}`}>
                <span>{isMyMessage ? "You" : `ID: ${msg.sender_id.slice(0,4)}`}</span>
                <span className={msg.status === 'in_progress' ? 'text-amber-500' : msg.status === 'completed' ? 'text-emerald-500' : ''}>
                  {msg.status === "new" ? "• New" : msg.status === "in_progress" ? "Working" : "Done"}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#FF4231]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type..." />
        <button type="submit" className="bg-[#FF4231] w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 transition-all"><Send size={20} className="text-white" /></button>
      </form>
    </div>
  );
}