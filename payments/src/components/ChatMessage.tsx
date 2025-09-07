'use client'

interface ChatMessageProps {
  message: string
  sender: 'user' | 'assistant'
  timestamp?: string
}

export default function ChatMessage({ message, sender, timestamp }: ChatMessageProps) {
  return (
    <div className={`message ${sender}`}>
      <div className="text-sm font-medium mb-1">
        {sender === 'user' ? 'You' : 'Assistant'}
      </div>
      <div className="text-sm">{message}</div>
      {timestamp && (
        <div className="text-xs opacity-70 mt-1">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
