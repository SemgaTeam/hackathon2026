import { useEffect, useRef, useState } from "react";
import "../App.css";

type Message = {
  user_id: string;
  content: string;
};

export default function Chat() {
  const [userId, setUserId] = useState("123");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Подключено к серверу");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      setMessages((prev) => [
        ...prev,
        {
          user_id: msg.user_id,
          content: msg.content,
        },
      ]);
    };

    ws.onclose = () => {
      console.log("Соединение закрыто");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        user_id: userId,
        contents: content,
      }),
    );

    setContent("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4">WebSocket Chat</h2>

        {/* user id */}
        <input
          className="w-full mb-2 p-2 rounded bg-gray-700"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
        />

        {/* input */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 p-2 rounded bg-gray-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите сообщение"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
          >
            ➤
          </button>
        </div>

        {/* messages */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded">
              <span className="text-blue-400">{msg.user_id}:</span>{" "}
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
