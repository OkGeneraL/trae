type Props = {
  children: React.ReactNode;
};

export default function SettingsLayout({ children }: Props) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">LLM Providers</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
