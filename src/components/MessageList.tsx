import React, { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, Settings, User } from 'lucide-react'

interface Message {
  id: number
  type: 'user' | 'system' | 'step' | 'result' | 'error'
  content: any
  timestamp: Date
  success?: boolean
  executionTime?: number
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-primary-50 rounded-lg px-4 py-3">
                <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        )

      case 'system':
        return (
          <div key={message.id} className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-blue-900">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        )

      case 'step':
        return (
          <div key={message.id} className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{message.content.step_number}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-yellow-50 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-yellow-800">
                    Step {message.content.step_number}: {message.content.state}
                  </span>
                </div>
                {message.content.content && (
                  <p className="text-gray-700 text-sm whitespace-pre-wrap mb-2">
                    {message.content.content}
                  </p>
                )}
                {message.content.tool_calls && message.content.tool_calls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Tool Calls:</p>
                    {message.content.tool_calls.map((call: any, idx: number) => (
                      <div key={idx} className="bg-white rounded px-2 py-1 text-xs">
                        <span className="font-mono text-blue-600">{call.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        )

      case 'result':
        return (
          <div key={message.id} className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.success ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {message.success ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <XCircle className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className={`rounded-lg px-4 py-3 ${
                message.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className={`whitespace-pre-wrap ${
                  message.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {message.content}
                </p>
                {message.executionTime && (
                  <p className="text-xs text-gray-600 mt-2">
                    Execution time: {message.executionTime.toFixed(2)}s
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div key={message.id} className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-red-50 rounded-lg px-4 py-3">
                <p className="text-red-900 whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-2">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Ready to help you code!</p>
            <p className="text-sm">Describe what you want to build and I'll get started.</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}