import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const response = await axios.get(`${API}/chat-history/${sessionId}`);
        if (response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };
    loadHistory();
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", message: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        message: userMessage
      });

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          message: response.data.response,
          confidence: response.data.confidence,
          escalated: response.data.escalated
        }
      ]);

      if (response.data.escalated) {
        toast.warning("This query has been escalated to HR team");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            data-testid="back-button"
            variant="ghost"
            onClick={() => navigate("/")}
            style={{ color: '#94a3b8' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
              HR Assistant Chat
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Ask me anything about HR policies, leaves, payroll, and more</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card
          className="glass"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            height: 'calc(100vh - 280px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
            {messages.length === 0 && (
              <div className="text-center" style={{ color: '#64748b', marginTop: '100px' }}>
                <p className="text-lg">Start a conversation with the HR Assistant</p>
                <p className="text-sm mt-2">Try asking: "What is the leave policy?" or "How do I apply for benefits?"</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                data-testid={`message-${msg.role}-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : 'bg-slate-700'}`}
                  style={{ animation: 'slideIn 0.4s ease-out' }}
                >
                  <p style={{ color: 'white', fontSize: '15px', lineHeight: '1.6' }}>
                    {msg.message}
                  </p>
                  {msg.escalated && (
                    <div className="flex items-center gap-2 mt-2" style={{ color: '#fbbf24' }}>
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Escalated to HR</span>
                    </div>
                  )}
                  {msg.confidence && (
                    <div className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Confidence: {(msg.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-4 rounded-2xl bg-slate-700">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
            <div className="flex gap-3">
              <Input
                data-testid="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1"
                style={{
                  background: 'rgba(51, 65, 85, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#e2e8f0',
                  padding: '12px 16px',
                  borderRadius: '12px'
                }}
                disabled={loading}
              />
              <Button
                data-testid="send-button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none'
                }}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;