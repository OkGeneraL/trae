import React, { useState, useRef } from 'react'
import { Send, Square } from 'lucide-react'
import { MessageList } from './MessageList'
import { useAgent } from '../hooks/useAgent'

interface ChatInterfaceProps {
  config: {
    provider: string
    model: string
    apiKey: string
    maxSteps: number
  }
  isConfigValid: boolean
}

export function ChatInterface({ config, isConfigValid }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const { currentSession, isExecuting, executeTask } = useAgent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isConfigValid || isExecuting) return

    // Execute task using real Trae Agent
    await executeTask(input.trim(), config)

    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isExecuting ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <span className="text-sm text-gray-600">
            {isExecuting ? 'Executing...' : 'Ready'}
          </span>
          {currentSession && (
            <span className="text-xs text-gray-500">
              Session: {currentSession.sessionId.slice(0, 8)}
            </span>
          )}
        </div>
        {!isConfigValid && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
            Please configure your API settings first
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={currentSession?.messages || []} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isConfigValid 
                  ? "Describe what you want to build or fix..." 
                  : "Configure your API settings first"
              }
              disabled={!isConfigValid || isExecuting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || !isConfigValid || isExecuting}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExecuting ? (
              <>
                <Square className="h-5 w-5" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}