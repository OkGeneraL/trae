"use client";

import { useState } from "react";
import ChatLayout from "../components/ChatLayout";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";

type Message = {
  text: string;
  sender: "user" | "agent";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = { text: inputText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      const agentMessage: Message = { text: data.response, sender: "agent" };
      setMessages((prevMessages) => [...prevMessages, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        text: "Sorry, something went wrong.",
        sender: "agent",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatLayout>
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </ChatLayout>
  );
}
