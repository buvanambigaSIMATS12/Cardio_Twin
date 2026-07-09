import React, { useState, useRef } from 'react';
import { Upload, FileHeart, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api';

export default function ECGUploadPanel({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadDone(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadDone(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadDone(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/ecg/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadDone(true);
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('ECG upload error:', err);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <FileHeart size={18} className="text-[var(--color-cardio-primary)]" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-cardio-text)]">Upload ECG Scan</h3>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleChooseFile}
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer
          ${isDragging
            ? 'border-[var(--color-cardio-primary)] bg-green-50/50'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors
          ${isDragging ? 'bg-green-100' : 'bg-slate-100'}`}
        >
          {selectedFile
            ? <CheckCircle size={28} className="text-[var(--color-cardio-primary)]" />
            : <Image size={28} className={isDragging ? 'text-[var(--color-cardio-primary)]' : 'text-slate-400'} />
          }
        </div>

        <p className="text-sm font-semibold text-[var(--color-cardio-text)] mb-1">
          {selectedFile ? selectedFile.name : 'Drag & drop ECG image here'}
        </p>
        <p className="text-xs text-[var(--color-cardio-text-light)] mb-5">
          {selectedFile ? 'Click "Analyse" below or choose a different file' : 'or click to browse from your computer'}
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
        />

        {!selectedFile ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleChooseFile(); }}
            className="flex items-center gap-2 bg-[var(--color-cardio-primary)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-cardio-primary-dark)] transition-colors cursor-pointer"
          >
            <Upload size={16} /> Choose File
          </button>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-white
              ${uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[var(--color-cardio-primary)] hover:bg-[var(--color-cardio-primary-dark)]'}`}
          >
            {uploading
              ? <><Loader2 size={16} className="animate-spin" /> Analysing…</>
              : <><Upload size={16} /> Analyse ECG</>
            }
          </button>
        )}
      </div>

      {/* Status messages */}
      {uploadError && (
        <div className="flex items-center gap-2 mt-3 text-red-600 text-xs font-semibold">
          <AlertCircle size={14} /> {uploadError}
        </div>
      )}
      {uploadDone && (
        <div className="flex items-center gap-2 mt-3 text-[var(--color-cardio-primary)] text-xs font-semibold">
          <CheckCircle size={14} /> ECG analysed successfully!
        </div>
      )}

      {/* Supported formats */}
      <p className="text-[11px] text-[var(--color-cardio-text-light)] mt-3 text-center">
        Supported formats: JPG, PNG, DICOM — Max size: 10 MB
      </p>
    </div>
  );
}
