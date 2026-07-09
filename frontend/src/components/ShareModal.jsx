import React, { useState } from 'react';
import { X, Copy, Image as ImageIcon, Mail, MessageCircle } from 'lucide-react';
import { getMediaURL } from '../api';

export default function ShareModal({ isOpen, onClose, scan }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !scan) return null;

  const shareUrl = `${window.location.origin}/ecg/public/${scan.id}`;
  const whatsappText = `My ECG result: Diagnosis: ${scan.diagnosis} (Confidence: ${Math.round(scan.confidence)}%). View: ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
  };

  const handleDownload = () => {
    // Determine the best image to download (heatmap if available, else original)
    const imgUrl = scan.heatmap_url ? getMediaURL(scan.heatmap_url) : getMediaURL(scan.image_url);
    
    // Create an invisible anchor tag to trigger download
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `CardioTwin_ECG_${scan.id}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("My CardioTwin ECG Result");
    const body = encodeURIComponent(`Doctor,\n\nPlease review my latest ECG scan.\nDiagnosis: ${scan.diagnosis}\nConfidence: ${Math.round(scan.confidence)}%\n\nYou can view the full details here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom pb-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Share Report</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button onClick={handleCopyLink} className="w-full flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mr-4">
              <Copy size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-slate-800 block">Copy Link</span>
              <span className="text-sm text-slate-500">{copied ? "Copied!" : shareUrl}</span>
            </div>
          </button>

          <button onClick={handleWhatsApp} className="w-full flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mr-4">
              <MessageCircle size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-slate-800 block">WhatsApp</span>
              <span className="text-sm text-slate-500">Share via message</span>
            </div>
          </button>

          <button onClick={handleDownload} className="w-full flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mr-4">
              <ImageIcon size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-slate-800 block">Download Image</span>
              <span className="text-sm text-slate-500">Save to your device</span>
            </div>
          </button>

          <button onClick={handleEmail} className="w-full flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mr-4">
              <Mail size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-slate-800 block">Email to Doctor</span>
              <span className="text-sm text-slate-500">Send an email report</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
