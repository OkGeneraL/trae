import React, { useState } from 'react'
import { File, Folder, Eye } from 'lucide-react'
import { useAgent } from '../hooks/useAgent'

interface FileItem {
  name: string
  path: string
  size: number
  modified: number
  type: 'file' | 'folder'
}

export function FileExplorer() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { currentSession, getWorkspaceFiles, getFileContent } = useAgent()

  const loadFiles = async () => {
    if (!currentSession?.sessionId) return
    
    try {
      const result = await getWorkspaceFiles(currentSession.sessionId)
      setFiles(result.files || [])
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const loadFileContent = async (filePath: string) => {
    if (!currentSession?.sessionId) return
    
    setIsLoading(true)
    try {
      const result = await getFileContent(currentSession.sessionId, filePath)
      setFileContent(result.content || '')
      setSelectedFile(filePath)
    } catch (error) {
      console.error('Failed to load file content:', error)
      setFileContent('Error loading file content')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* File List */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Workspace Files</h3>
            <button 
              onClick={loadFiles}
              disabled={!currentSession?.sessionId}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {files.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {currentSession?.sessionId ? 'No files in workspace' : 'No active session'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div
                  key={file.path}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    selectedFile === file.path ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                  onClick={() => loadFileContent(file.path)}
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {file.path}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(file.modified)}
                        </span>
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Content */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium text-gray-900">
            {selectedFile ? selectedFile : 'Select a file to view'}
          </h3>
        </div>
        
        <div className="h-full overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : selectedFile ? (
            <pre className="h-full overflow-auto p-4 text-sm font-mono bg-gray-900 text-gray-100">
              {fileContent}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <File className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a file to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}