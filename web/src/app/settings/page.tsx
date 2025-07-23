"use client";

import { useState, useEffect } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import ProviderForm from "../../components/ProviderForm";
import ProviderList from "../../components/ProviderList";

type Provider = {
  name: string;
  apiKey: string;
  model: string;
  baseURL: string;
};

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

export default function Settings() {
  const [config, setConfig] = useState<Config | null>(null);
  const [newProvider, setNewProvider] = useState<Provider>({
    name: "",
    apiKey: "",
    model: "",
    baseURL: "",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleAddProvider = async () => {
    if (!config) return;

    const updatedConfig: Config = {
      ...config,
      model_providers: {
        ...config.model_providers,
        [newProvider.name]: {
          model: newProvider.model,
          base_url: newProvider.baseURL,
          api_key: newProvider.apiKey,
        },
      },
    };

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });
      setConfig(updatedConfig);
      setNewProvider({
        name: "",
        apiKey: "",
        model: "",
        baseURL: "",
      });
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  return (
    <SettingsLayout>
      <ProviderForm
        newProvider={newProvider}
        setNewProvider={setNewProvider}
        onAddProvider={handleAddProvider}
      />
      <ProviderList config={config} />
    </SettingsLayout>
  );
}
