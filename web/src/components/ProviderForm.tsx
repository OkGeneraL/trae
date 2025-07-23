type Provider = {
  name: string;
  apiKey: string;
  model: string;
  baseURL: string;
};

type ProviderFormProps = {
  newProvider: Provider;
  setNewProvider: (provider: Provider) => void;
  onAddProvider: () => void;
};

export default function ProviderForm({
  newProvider,
  setNewProvider,
  onAddProvider,
}: ProviderFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Provider</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Provider Name (e.g., OpenAI)"
          value={newProvider.name}
          onChange={(e) =>
            setNewProvider({ ...newProvider, name: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="password"
          placeholder="API Key"
          value={newProvider.apiKey}
          onChange={(e) =>
            setNewProvider({ ...newProvider, apiKey: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Model (e.g., gpt-4)"
          value={newProvider.model}
          onChange={(e) =>
            setNewProvider({ ...newProvider, model: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Base URL (optional)"
          value={newProvider.baseURL}
          onChange={(e) =>
            setNewProvider({ ...newProvider, baseURL: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <button
        onClick={onAddProvider}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Provider
      </button>
    </div>
  );
}
