type Config = {
  default_provider: string;
  model_providers: {
    [key: string]: {
      model: string;
      base_url?: string;
      api_key?: string;
    };
  };
};

type ProviderListProps = {
  config: Config | null;
};

export default function ProviderList({ config }: ProviderListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Existing Providers</h2>
      {config ? (
        <div className="space-y-4">
          {Object.entries(config.model_providers).map(
            ([name, provider]) => (
              <div
                key={name}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <p>
                  <strong>Name:</strong> {name}
                </p>
                <p>
                  <strong>Model:</strong> {provider.model}
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
