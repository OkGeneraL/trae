import React, { useState, useRef } from 'react'
import { Send, Square } from 'lucide-react'
import { MessageList } from './MessageList'

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
  const [messages, setMessages] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !isConfigValid || isExecuting) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsExecuting(true)

    // Simulate agent execution (in real implementation, this would call the backend)
    setTimeout(() => {
      const systemMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: `Started executing: ${input.trim()}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMessage])

      // Simulate steps
      setTimeout(() => {
        const stepMessage = {
          id: Date.now() + 2,
          type: 'step',
          content: {
            step_number: 1,
            state: 'thinking',
            content: 'Analyzing the task and planning the implementation...',
            tool_calls: []
          },
          timestamp: new Date()
        }
        setMessages(prev => [...prev, stepMessage])

        // Simulate completion
        setTimeout(() => {
          const resultMessage = {
            id: Date.now() + 3,
            type: 'result',
            content: 'Task completed successfully! The code has been generated and is ready for use.',
            success: true,
            executionTime: 15.5,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, resultMessage])
          setIsExecuting(false)
        }, 3000)
      }, 2000)
    }, 1000)

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
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Ready</span>
        </div>
        {!isConfigValid && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
            Please configure your API settings first
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
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