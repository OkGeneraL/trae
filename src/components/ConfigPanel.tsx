import React, { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ConfigPanelProps {
  config: {
    provider: string
    model: string
    apiKey: string
    maxSteps: number
  }
  setConfig: (config: any) => void
  setIsConfigValid: (valid: boolean) => void
}

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: [
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022'
    ]
  },
  openai: {
    name: 'OpenAI',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'o1-preview',
      'o1-mini'
    ]
  },
  google: {
    name: 'Google',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-pro'
    ]
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      'openai/gpt-4o',
      'anthropic/claude-3-5-sonnet',
      'google/gemini-pro'
    ]
  }
}

export function ConfigPanel({ config, setConfig, setIsConfigValid }: ConfigPanelProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
  } | null>(null)

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    setValidationResult(null)
    setIsConfigValid(false)
  }

  const validateConfig = async () => {
    if (!config.apiKey.trim()) {
      setValidationResult({
        valid: false,
        message: 'API key is required'
      })
      return
    }

    setIsValidating(true)
    
    // Simulate validation (in real implementation, this would call the backend)
    setTimeout(() => {
      const isValid = config.apiKey.length > 10 // Simple validation
      setValidationResult({
        valid: isValid,
        message: isValid ? 'Configuration is valid' : 'Invalid API key format'
      })
      setIsConfigValid(isValid)
      setIsValidating(false)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-600">Configure your LLM provider and API settings.</p>
        </div>

        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <select
            value={config.provider}
            onChange={(e) => {
              handleConfigChange('provider', e.target.value)
              // Reset model when provider changes
              const firstModel = PROVIDERS[e.target.value as keyof typeof PROVIDERS].models[0]
              handleConfigChange('model', firstModel)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {Object.entries(PROVIDERS).map(([key, provider]) => (
              <option key={key} value={key}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={config.model}
            onChange={(e) => handleConfigChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {PROVIDERS[config.provider as keyof typeof PROVIDERS].models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>

        {/* Max Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Steps
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={config.maxSteps}
            onChange={(e) => handleConfigChange('maxSteps', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum number of execution steps (1-100).
          </p>
        </div>

        {/* Validation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={validateConfig}
            disabled={isValidating || !config.apiKey.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Validate Configuration'}
          </button>

          {validationResult && (
            <div className={`flex items-center space-x-2 ${
              validationResult.valid ? 'text-green-600' : 'text-red-600'
            }`}>
              {validationResult.valid ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{validationResult.message}</span>
            </div>
          )}
        </div>

        {/* Provider-specific instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Getting your API key:</h3>
          <div className="text-sm text-blue-800">
            {config.provider === 'anthropic' && (
              <p>Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Console</a></p>
            )}
            {config.provider === 'openai' && (
              <p>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></p>
            )}
            {config.provider === 'google' && (
              <p>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></p>
            )}
            {config.provider === 'openrouter' && (
              <p>Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter</a></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}