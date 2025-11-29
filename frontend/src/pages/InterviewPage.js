import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InterviewPage = () => {
  const navigate = useNavigate();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [position, setPosition] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [sessionId] = useState(() => `interview_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    if (!candidateName.trim() || !position.trim()) {
      toast.error("Please enter candidate name and position");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/interview`, {
        session_id: sessionId,
        candidate_name: candidateName,
        position: position
      });

      setMessages([{ role: "assistant", content: response.data.response }]);
      setSessionStarted(true);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || completed) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API}/interview`, {
        session_id: sessionId,
        candidate_name: candidateName,
        position: position,
        message: userMessage
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);

      if (response.data.completed) {
        setCompleted(true);
        setEvaluation({
          score: response.data.score,
          feedback: response.data.response
        });
        toast.success("Interview completed!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="container mx-auto px-4 max-w-xl">
          <Button
            data-testid="back-button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
            style={{ color: '#94a3b8' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>

          <Card
            className="glass"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}
          >
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                  AI Interview
                </h1>
                <p className="text-sm" style={{ color: '#64748b' }}>Start an automated interview session</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Candidate Name</label>
                  <Input
                    data-testid="candidate-name-input"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter candidate name"
                    style={{
                      background: 'rgba(51, 65, 85, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#e2e8f0',
                      padding: '12px'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Position</label>
                  <Input
                    data-testid="position-input"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    style={{
                      background: 'rgba(51, 65, 85, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#e2e8f0',
                      padding: '12px'
                    }}
                  />
                </div>
                <Button
                  data-testid="start-interview-button"
                  onClick={startInterview}
                  disabled={loading}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(to right, #f97316, #ef4444)',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Interview...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-button-chat"
              variant="ghost"
              onClick={() => navigate("/")}
              style={{ color: '#94a3b8' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                Interview: {candidateName}
              </h1>
              <p className="text-sm" style={{ color: '#64748b' }}>Position: {position}</p>
            </div>
          </div>
          {completed && evaluation && (
            <div className="text-right">
              <p className="text-sm" style={{ color: '#64748b' }}>Final Score</p>
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{evaluation.score.toFixed(0)}</p>
            </div>
          )}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="interview-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                data-testid={`interview-message-${msg.role}-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                      : completed && index === messages.length - 1
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      : 'bg-slate-700'
                  }`}
                  style={{ animation: 'slideIn 0.4s ease-out' }}
                >
                  <p style={{ color: 'white', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>
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
          {!completed && (
            <div className="p-6 border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
              <div className="flex gap-3">
                <Input
                  data-testid="interview-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your answer..."
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
                  data-testid="send-interview-button"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                    background: 'linear-gradient(to right, #f97316, #ef4444)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none'
                  }}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InterviewPage;