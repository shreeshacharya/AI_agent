import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("hr");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await axios.get(`${API}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
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
    formData.append('doc_type', docType);

    try {
      await axios.post(`${API}/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      loadDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

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
              Document Manager
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Upload HR documents and company policies</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card
          className="glass mb-8"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
              Upload Document
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Document Type</label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger data-testid="doc-type-select" style={{ background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#e2e8f0' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR Policy</SelectItem>
                    <SelectItem value="policy">Company Policy</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#94a3b8' }}>Select File (PDF/DOCX)</label>
                <Input
                  data-testid="file-input"
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
              <div className="flex items-end">
                <Button
                  data-testid="upload-button"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(to right, #a855f7, #ec4899)',
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
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
            {selectedFile && (
              <p className="text-sm mt-3" style={{ color: '#10b981' }}>Selected: {selectedFile.name}</p>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9' }}>
          Uploaded Documents ({documents.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="documents-list">
          {documents.map((doc, index) => (
            <Card
              key={doc.id}
              data-testid={`document-card-${index}`}
              className="glass hover:scale-105 transition-transform duration-300"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: '#f1f5f9' }}>
                      {doc.filename}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                      Type: <span style={{ color: '#94a3b8' }}>{doc.doc_type}</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {documents.length === 0 && (
          <div className="text-center py-16" style={{ color: '#64748b' }}>
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;