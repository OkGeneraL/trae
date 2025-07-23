type Props = {
  children: React.ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {children}
      </div>
    </div>
  );
}
