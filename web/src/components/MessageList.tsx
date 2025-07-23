import Message from "./Message";

type Message = {
  text: string;
  sender: "user" | "agent";
};

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <Message key={index} text={message.text} sender={message.sender} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
              ...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
