"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  role: string;
  content: string;
}

const ChatMessage = ({ role, content }: Message) => {
  return (
    <div className={`flex items-start gap-3 ${role === 'user' ? 'justify-end' : ''}`}>
      <div
        className={`rounded-lg px-3 py-2 ${
          role === 'user'
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const createSession = async () => {
      const response = await fetch("http://localhost:8000/sessions/new", {
        method: "POST",
      });
      const data = await response.json();
      setSessionId(data.session_id);
    };
    createSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    ws.current = new WebSocket(`ws://localhost:8000/ws/${sessionId}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'history') {
        setMessages(message.data);
      } else {
        setMessages((prevMessages) => [...prevMessages, {role: message.type === 'user_message' ? 'user' : 'agent', content: message.data}]);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionId]);

  const handleSend = () => {
    if (input.trim() && ws.current) {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <Card className="w-full h-[70vh] grid grid-rows-[auto,1fr,auto]">
      <CardHeader>
        <CardTitle>Trae Agent Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
