import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Loader2, Award } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResumePage = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [screenResults, setScreenResults] = useState([]);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await axios.get(`${API}/resumes`);
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        toast.error("Only PDF and DOCX files are supported");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`${API}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Resume uploaded successfully");
      setSelectedFile(null);
      loadResumes();
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleScreenResumes = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    if (resumes.length === 0) {
      toast.error("Please upload resumes first");
      return;
    }

    setScreening(true);
    try {
      const response = await axios.post(`${API}/screen-resumes`, {
        job_description: jobDescription
      });
      setScreenResults(response.data.results || []);
      toast.success("Resume screening completed");
      loadResumes();
    } catch (error) {
      console.error("Error screening resumes:", error);
      toast.error("Failed to screen resumes");
    } finally {
      setScreening(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const displayResults = screenResults.length > 0 ? screenResults : resumes.filter(r => r.score);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              Resume Screening
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>AI-powered candidate evaluation and ranking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Screening Section */}
          <div>
            {/* Upload Resume */}
            <Card
              className="glass mb-6"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}
            >
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                  Upload Resume
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Select Resume (PDF/DOCX)</label>
                    <Input
                      data-testid="resume-file-input"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      style={{
                        background: 'rgba(51, 65, 85, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#e2e8f0'
                      }}
                    />
                  </div>
                  <Button
                    data-testid="upload-resume-button"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(to right, #10b981, #14b8a6)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                  {selectedFile && (
                    <p className="text-sm" style={{ color: '#10b981' }}>Selected: {selectedFile.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card
              className="glass"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}
            >
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                  Screen Resumes
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Job Description</label>
                    <Textarea
                      data-testid="job-description-input"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter the job description and requirements..."
                      rows={8}
                      style={{
                        background: 'rgba(51, 65, 85, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#e2e8f0',
                        resize: 'none'
                      }}
                    />
                  </div>
                  <Button
                    data-testid="screen-button"
                    onClick={handleScreenResumes}
                    disabled={screening || !jobDescription.trim() || resumes.length === 0}
                    className="w-full"
                    style={{
                      background: 'linear-gradient(to right, #f97316, #ef4444)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  >
                    {screening ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Screening...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Screen All Resumes
                      </>
                    )}
                  </Button>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Uploaded resumes: {resumes.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            <Card
              className="glass"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                maxHeight: 'calc(100vh - 200px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
                  Screening Results
                </h2>
              </CardContent>
              <div className="flex-1 overflow-y-auto px-6 pb-6" data-testid="screening-results">
                {displayResults.length === 0 ? (
                  <div className="text-center py-16" style={{ color: '#64748b' }}>
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No screening results yet</p>
                    <p className="text-sm mt-2">Upload resumes and run screening</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayResults.map((result, index) => (
                      <Card
                        key={result.resume_id || result.id}
                        data-testid={`result-card-${index}`}
                        className="glass-light"
                        style={{
                          background: 'rgba(51, 65, 85, 0.4)',
                          border: '1px solid rgba(148, 163, 184, 0.15)'
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold" style={{ color: '#f1f5f9' }}>
                                {result.filename}
                              </h3>
                              <p className="text-xs mt-1" style={{ color: '#64748b' }}>Rank #{index + 1}</p>
                            </div>
                            <div
                              className="text-2xl font-bold"
                              style={{ color: getScoreColor(result.score) }}
                            >
                              {result.score ? result.score.toFixed(0) : 'N/A'}
                            </div>
                          </div>
                          {result.analysis && (
                            <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                              {result.analysis}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;