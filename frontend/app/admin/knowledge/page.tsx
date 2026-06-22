"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, Loader2, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import GlassCard from "@/components/admin/GlassCard";

interface Document {
  id: number;
  name: string;
  path: string;
  uploadedAt: string;
  processed: boolean;
  failed: boolean;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/knowledge/documents");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("http://localhost:8000/admin/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      await fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-blue-200/60 mt-1">Manage documents used by the RAG AI Agent.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Document</h2>
            
            <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center hover:bg-blue-500/5 transition-colors duration-300">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label 
                htmlFor="file-upload" 
                className={`cursor-pointer flex flex-col items-center justify-center ${isUploading ? 'opacity-50' : 'opacity-100'}`}
              >
                {isUploading ? (
                  <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-3" />
                ) : (
                  <Upload className="h-12 w-12 text-blue-400 mb-3" />
                )}
                <span className="text-sm font-medium text-slate-200">
                  {isUploading ? "Uploading & Processing..." : "Click to select a PDF"}
                </span>
                <span className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</span>
              </label>
            </div>
          </GlassCard>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Uploaded Documents</h2>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center p-8 border border-blue-900/30 rounded-xl bg-blue-950/20">
                <FileText className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-blue-900/30 bg-blue-950/20 hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-200">{doc.name}</h3>
                        <p className="text-xs text-slate-400">
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {doc.failed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="h-3.5 w-3.5" />
                          Failed
                        </span>
                      ) : doc.processed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}