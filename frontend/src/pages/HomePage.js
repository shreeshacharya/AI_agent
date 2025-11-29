import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, FileText, Users, Briefcase } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "HR Assistant",
      description: "Get instant answers to HR policies, leave, payroll, and benefits questions",
      path: "/chat",
      color: "from-cyan-500 to-blue-500",
      testId: "hr-assistant-card"
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Document Manager",
      description: "Upload and manage HR documents and company policies",
      path: "/documents",
      color: "from-purple-500 to-pink-500",
      testId: "document-manager-card"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Resume Screening",
      description: "AI-powered resume analysis and candidate ranking",
      path: "/resume",
      color: "from-emerald-500 to-teal-500",
      testId: "resume-screening-card"
    },
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "AI Interview",
      description: "Conduct automated interviews and evaluate candidates",
      path: "/interview",
      color: "from-orange-500 to-red-500",
      testId: "ai-interview-card"
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="fade-in text-center mb-16 mt-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" 
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
            AI HR & Support Agent
          </h1>
          <p className="text-lg sm:text-xl" style={{ color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
            Streamline your HR operations with intelligent automation. From employee queries to candidate interviews,
            our AI-powered platform handles it all.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              data-testid={feature.testId}
              className="glass hover:scale-105 cursor-pointer transition-all duration-300"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s backwards`
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-8">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                  style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                  {feature.title}
                </h3>
                <p className="text-base mb-6" style={{ color: '#94a3b8' }}>
                  {feature.description}
                </p>
                <Button
                  data-testid={`${feature.testId}-button`}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, ${feature.color.includes('cyan') ? '#06b6d4, #3b82f6' : 
                                feature.color.includes('purple') ? '#a855f7, #ec4899' : 
                                feature.color.includes('emerald') ? '#10b981, #14b8a6' : '#f97316, #ef4444'})`,
                    color: 'white',
                    fontWeight: '500',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Powered by OpenAI GPT-5.1 • ChromaDB Vector Search • Emergent AI Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;