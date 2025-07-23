import React, { useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { ConfigPanel } from './components/ConfigPanel'
import { FileExplorer } from './components/FileExplorer'
import { Settings, MessageSquare, FolderOpen } from 'lucide-react'

interface Config {
  provider: string
  model: string
  apiKey: string
  maxSteps: number
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'config' | 'files'>('config')
  const [config, setConfig] = useState<Config>({
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: '',
    maxSteps: 20
  })
  const [isConfigValid, setIsConfigValid] = useState(false)

  const tabs = [
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'config', name: 'Config', icon: Settings },
    { id: 'files', name: 'Files', icon: FolderOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Code Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm ${
                isConfigValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConfigValid ? 'Ready' : 'Config Required'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'chat' && (
              <ChatInterface config={config} isConfigValid={isConfigValid} />
            )}
            {activeTab === 'config' && (
              <ConfigPanel 
                config={config} 
                setConfig={setConfig}
                setIsConfigValid={setIsConfigValid}
              />
            )}
            {activeTab === 'files' && (
              <FileExplorer />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App