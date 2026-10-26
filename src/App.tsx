/**
 * FinPulse Business Financial Analyzer
 * Executive Application Root & Master State Coordinator
 * 
 * @module App
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploadZone } from './components/FileUploadZone';
import { Dashboard } from './components/Dashboard';
import { ExportReportModal } from './components/ExportReportModal';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { GrowthQuestionsModal } from './components/GrowthQuestionsModal';
import { useFileIngestion } from './hooks/useFileIngestion';
import { BusinessContext } from './types';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finpulse_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isGrowthModalOpen, setIsGrowthModalOpen] = useState(false);
  const [promptedFileKey, setPromptedFileKey] = useState<string | null>(null);

  // Business Context state for tailored growth suggestions
  const [businessContext, setBusinessContext] = useState<BusinessContext>(() => {
    const saved = localStorage.getItem('finpulse_business_context');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      businessType: 'ecommerce',
      growthPriority: 'revenue',
      businessStage: 'growth',
    };
  });

  // Universal Ingestion Engine
  const {
    isLoading,
    errorMessage,
    dataset,
    analysisResult,
    ingestFile,
    applyCustomMapping,
    updateCurrencySymbol,
    switchExcelSheet,
    loadSampleDataset,
    resetDataset,
  } = useFileIngestion();

  // Synchronize dark theme class with document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finpulse_theme', 'light');
    }
  }, [isDarkMode]);

  // Automatically present 2-3 quick business questions after file uploadation
  useEffect(() => {
    if (analysisResult) {
      const fileKey = `${analysisResult.dataset.metadata.filename}-${analysisResult.dataset.metadata.totalRows}`;
      if (promptedFileKey !== fileKey) {
        setIsGrowthModalOpen(true);
        setPromptedFileKey(fileKey);
      }
    }
  }, [analysisResult, promptedFileKey]);

  const handleSaveContext = (newContext: BusinessContext) => {
    setBusinessContext(newContext);
    localStorage.setItem('finpulse_business_context', JSON.stringify(newContext));
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Executive Navigation */}
      <Header
        metadata={dataset?.metadata}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onReset={resetDataset}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenMappingModal={() => setIsMappingModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {!analysisResult ? (
          <FileUploadZone
            isLoading={isLoading}
            errorMessage={errorMessage}
            onFileSelected={ingestFile}
            onLoadSample={loadSampleDataset}
          />
        ) : (
          <Dashboard
            analysis={analysisResult}
            isDarkMode={isDarkMode}
            onSwitchSheet={switchExcelSheet}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenMappingModal={() => setIsMappingModalOpen(true)}
            onCurrencyChange={updateCurrencySymbol}
            businessContext={businessContext}
            onOpenGrowthModal={() => setIsGrowthModalOpen(true)}
          />
        )}
      </main>

      {/* Quick 2-3 Business Profile Questions Modal (Triggered after upload or via header) */}
      <GrowthQuestionsModal
        isOpen={isGrowthModalOpen}
        onClose={() => setIsGrowthModalOpen(false)}
        onSaveContext={handleSaveContext}
        initialContext={businessContext}
      />

      {/* Column Field Mapping & Schema Modal */}
      {analysisResult && (
        <ColumnMappingModal
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          headers={analysisResult.dataset.headers}
          columnList={analysisResult.columnList}
          currentKpis={analysisResult.financialKpis}
          onApplyMapping={applyCustomMapping}
        />
      )}

      {/* Global Export Report Modal */}
      {analysisResult && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          analysis={analysisResult}
          businessContext={businessContext}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinPulse • Business Financial Analyzer</span>
          <span className="text-[11px] text-slate-500">100% Client-Side Ingestion • Zero Data Leaves Your Device</span>
        </div>
      </footer>
    </div>
  );
}
