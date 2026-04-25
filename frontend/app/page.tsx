'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Upload, FileText, Send, Paperclip, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AetherisDashboard() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Processing with Docling...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Talking to our FastAPI backend
      const response = await axios.post('http://localhost:8000/upload', formData);
      setUploadStatus(`Success: ${response.data.message}`);
      
      // Add a system message to the chat
      setMessages([
        ...messages,
        { id: `upload-${Date.now()}`, role: 'system', content: `Uploaded paper: ${file.name}. You can now ask questions about it.` }
      ]);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Recent Research */}
      <aside className="w-64 glass m-4 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <FileText size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Aetheris</h1>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Recent Papers</p>
          <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FileText size={16} /> Attention Is All You Need
          </div>
          <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <FileText size={16} /> Llama 3 Technical Report
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Top Bar - Upload Zone */}
        <header className="h-40 glass p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Knowledge Ingestion</h2>
              <p className="text-sm text-gray-400">Upload academic PDFs for multi-column layout analysis.</p>
            </div>
            
            <label className="drop-zone glass px-8 py-4 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
              ) : (
                <Upload size={20} className="text-indigo-400" />
              )}
              <span className="font-medium">{uploadStatus || 'Drop Research PDF'}</span>
              <input type="file" className="hidden" accept=".pdf" onChange={onFileUpload} />
            </label>
          </div>
        </header>

        {/* Chat Area */}
        <section className="flex-1 glass flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center opacity-30"
                >
                  <Search size={48} className="mb-4 text-indigo-500" />
                  <p className="text-lg">Select a paper or upload a new one to begin analysis.</p>
                </motion.div>
              ) : (
                messages.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : m.role === 'system'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-widest font-bold px-3 py-1'
                        : 'glass border-indigo-500/20'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Aetheris about the research..."
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-12 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <Paperclip size={18} className="absolute left-4 text-gray-500" />
              <button 
                type="submit"
                className="absolute right-2 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/40"
              >
                <Send size={18} className="text-white" />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
