'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { useWallet } from '@/providers/WalletProvider'
import { useDevice } from '@/providers/DeviceProvider'
import { usePayment } from '@/providers/PaymentProvider'
import { PaymentApprovalModal } from './PaymentApprovalModal'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: string
}

export default function ChatInterface() {
  const { accountId } = useWallet()
  const { selectedDevice, uuid } = useDevice()
  const { payHostingFee, checkPaymentRequirements, addTransaction } = usePayment()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentApproval, setShowPaymentApproval] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText: string) => {
    // Check if device is selected
    if (!selectedDevice || !selectedDevice.ngrokLink) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'No device selected or device ngrok link not available. Please select a device first.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    // Check payment requirements first
    const canPay = await checkPaymentRequirements();
    if (!canPay) {
      setShowPaymentApproval(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Make API call to device's ngrok URL
      // The device server will handle payment automatically using the approved allowance
      const response = await fetch(selectedDevice.ngrokLink, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          uuid: uuid,
          userAddress: accountId,
          hostingFee: selectedDevice.hostingFee,
          deviceWalletAddress: selectedDevice.walletAddress
        }),
      })

      if (!response.ok) {
        throw new Error(`Device server responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle payment response
      if (data.payment) {
        console.log('Payment processed:', data.payment);
        // Add payment transaction to tracking
        if (data.payment.success && data.payment.txHash) {
          // Use the real transaction hash from the device server
          const txHash = data.payment.txHash;
          
          console.log('🔗 REAL TRANSACTION HASH FROM DEVICE:', txHash);
          console.log('📊 Payment Details:', {
            txHash: txHash,
            simulated: data.payment.simulated,
            blockNumber: data.payment.blockNumber,
            gasUsed: data.payment.gasUsed
          });
          
          // Add payment transaction to tracking
          addTransaction({
            type: 'payment',
            amount: selectedDevice.hostingFee,
            to: selectedDevice.walletAddress,
            txHash: txHash,
            status: 'confirmed'
          });
          
          console.log('✅ Payment transaction added to tracking with real hash');
        }
      }
      
      // Handle different response formats from the device server
      let responseText = '';
      if (typeof data === 'string') {
        responseText = data;
      } else if (data.response) {
        responseText = data.response;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.text) {
        responseText = data.text;
      } else if (data.content) {
        responseText = data.content;
      } else if (data.answer) {
        responseText = data.answer;
      } else if (data.reply) {
        responseText = data.reply;
      } else {
        // If none of the above, try to stringify the entire response
        responseText = JSON.stringify(data);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message to device:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, there was an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentApproved = () => {
    setShowPaymentApproval(false);
    // Retry sending the last message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.sender === 'user') {
      handleSendMessage(lastUserMessage.text);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="text-sm font-medium mb-1">Assistant</div>
            <div className="text-sm">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      
      {showPaymentApproval && (
        <PaymentApprovalModal
          onApproved={handlePaymentApproved}
          onCancel={() => setShowPaymentApproval(false)}
        />
      )}
    </div>
  )
}
