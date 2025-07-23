type MessageProps = {
  text: string;
  sender: "user" | "agent";
};

export default function Message({ text, sender }: MessageProps) {
  return (
    <div
      className={`flex mb-4 ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`rounded-lg px-4 py-2 text-sm sm:text-base ${
          sender === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
