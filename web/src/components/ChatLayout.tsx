import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function ChatLayout({ children }: Props) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Trae Agent
          </h1>
          <nav className="space-x-4">
            <Link href="/">
              <p className="text-blue-500 hover:underline">Chat</p>
            </Link>
            <Link href="/workspace">
              <p className="text-blue-500 hover:underline">Workspace</p>
            </Link>
            <Link href="/settings">
              <p className="text-blue-500 hover:underline">Settings</p>
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
