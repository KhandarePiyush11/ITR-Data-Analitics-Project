/**
 * FinPulse Business Financial Analyzer
 * Universal Multi-Format File Ingestion & Drag-Drop Hub
 * 
 * Supports: Excel (.xlsx, .xls, .xlsm, .ods), JSON (.json, .ndjson, .jsonl),
 * XML (.xml, .ofx, .qfx), Delimited (.csv, .tsv), YAML (.yaml, .yml), HTML Tables.
 * 
 * @module components/FileUploadZone
 */

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MULTI_FORMAT_SAMPLES } from '../utils/sampleDatasets';

interface FileUploadZoneProps {
  isLoading: boolean;
  errorMessage: string | null;
  onFileSelected: (file: File) => void;
  onLoadSample: (key: string) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  isLoading,
  errorMessage,
  onFileSelected,
  onLoadSample,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Pitch Header */}
      <div className="text-center max-w-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Universal Business Data Analyzer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Intelligent Financial Analysis Across Any Format
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Upload any business ledger, Excel workbook, JSON API export, bank statement, or CSV.
          FinPulse automatically detects your schema, cleans values, and synthesizes executive KPIs.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="w-full max-w-xl p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200">Upload Issue</h4>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Card */}
      <div className="w-full max-w-2xl">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.tab,.psv,.dsv,.xlsx,.xls,.xlsm,.xlsb,.ods,.json,.ndjson,.jsonl,.xml,.ofx,.qfx,.yaml,.yml,.html,.htm,.txt,.log,.dat,.prn"
          onChange={handleInputChange}
          className="hidden"
          id="universal-file-input"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 bg-white dark:bg-slate-900 shadow-lg ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01] shadow-indigo-500/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl'
          }`}
        >
          <div className="flex flex-col items-center">
            {/* Upload Icon */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
                isDragOver
                  ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-3 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>

            {/* Prompt Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">
              {isLoading ? 'Analyzing & Profiling Data...' : 'Drop any business file or click to browse'}
            </h3>

            {/* Upload Button */}
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-sm hover:shadow-indigo-500/20 transition mb-6 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isLoading ? 'Uploading...' : 'Upload File'}</span>
            </button>

            {/* Privacy Guarantee */}
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Private & Client-Side: Zero financial data ever leaves your device</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Multi-Format Live Demo Selector */}
      <div className="w-full max-w-2xl">
        <div className="text-center mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Or try a 1-click sample dataset across formats:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(MULTI_FORMAT_SAMPLES).map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading}
              onClick={() => onLoadSample(sample.id)}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition text-left group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{sample.icon}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {sample.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {sample.description}
                </p>
              </div>
              <div className="mt-2.5 flex items-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Load Dataset</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
