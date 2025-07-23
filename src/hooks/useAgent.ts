import { useState, useCallback } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

interface AgentConfig {
  provider: string
  model: string
  apiKey: string
  maxSteps: number
}

interface AgentSession {
  sessionId: string
  status: 'starting' | 'running' | 'completed' | 'failed' | 'error'
  messages: any[]
  result?: any
}

export function useAgent() {
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const executeTask = useCallback(async (task: string, config: AgentConfig) => {
    try {
      setIsExecuting(true)
      
      // Start task execution
      const response = await fetch(`${BACKEND_URL}/api/execute-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task,
          provider: config.provider,
          model: config.model,
          api_key: config.apiKey,
          max_steps: config.maxSteps,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start task execution')
      }

      const { session_id } = await response.json()
      
      // Initialize session
      setCurrentSession({
        sessionId: session_id,
        status: 'starting',
        messages: [],
      })

      // Start streaming updates
      streamSessionUpdates(session_id)

    } catch (error) {
      console.error('Error executing task:', error)
      setIsExecuting(false)
    }
  }, [])

  const streamSessionUpdates = useCallback((sessionId: string) => {
    const eventSource = new EventSource(`${BACKEND_URL}/api/session/${sessionId}/stream`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'session_complete') {
          setIsExecuting(false)
          eventSource.close()
          return
        }

        setCurrentSession(prev => {
          if (!prev) return null
          
          return {
            ...prev,
            messages: [...prev.messages, {
              id: Date.now() + Math.random(),
              ...data,
              timestamp: new Date()
            }]
          }
        })
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      setIsExecuting(false)
      eventSource.close()
    }

    return eventSource
  }, [])

  const validateConfig = useCallback(async (config: AgentConfig) => {
    try {
      console.log('Sending validation request to backend...')
      const response = await fetch(`${BACKEND_URL}/api/validate-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Validation request failed:', error)
      return { 
        valid: false, 
        message: `Failed to validate configuration: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }, [])

  const getWorkspaceFiles = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workspace/${sessionId}/files`)
      if (!response.ok) return { files: [] }
      return await response.json()
    } catch (error) {
      console.error('Error fetching workspace files:', error)
      return { files: [] }
    }
  }, [])

  const getFileContent = useCallback(async (sessionId: string, filePath: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/workspace/${sessionId}/file/${encodeURIComponent(filePath)}`)
      if (!response.ok) return { content: 'File not found', type: 'error' }
      return await response.json()
    } catch (error) {
      console.error('Error fetching file content:', error)
      return { content: 'Error loading file', type: 'error' }
    }
  }, [])

  return {
    currentSession,
    isExecuting,
    executeTask,
    validateConfig,
    getWorkspaceFiles,
    getFileContent,
  }
}