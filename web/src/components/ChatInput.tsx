type ChatInputProps = {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
};

export default function ChatInput({
  inputText,
  setInputText,
  handleSendMessage,
  isLoading,
}: ChatInputProps) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm sm:text-base"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
