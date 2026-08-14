import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingUpload from './components/LandingUpload';
import Dashboard from './components/Dashboard';
import ColumnMappingModal from './components/ColumnMappingModal';
import { parseFinancialCSV } from './utils/csvParser';

export default function App() {
  const [parsedData, setParsedData] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  // Theme handling with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('finpulse_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finpulse_theme', 'light');
    }
  }, [darkMode]);

  // Handle new file upload
  const handleFileSelected = async (file) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await parseFinancialCSV(file);
      setParsedData(data);
      setRawFile(file);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while parsing the CSV file.');
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to initial clean state
  const handleReset = () => {
    setParsedData(null);
    setRawFile(null);
    setErrorMessage(null);
    setIsMappingModalOpen(false);
  };

  // Re-parse with custom mapping override
  const handleApplyMapping = async (newMapping) => {
    if (!rawFile) return;
    setIsLoading(true);
    try {
      const data = await parseFinancialCSV(rawFile, newMapping);
      setParsedData(data);
    } catch (err) {
      setErrorMessage(`Failed to re-parse with selected mapping: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Currency change override
  const handleCurrencyChange = (newSymbol) => {
    if (!parsedData) return;
    setParsedData((prev) => ({
      ...prev,
      currencySymbol: newSymbol,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Header
        hasData={Boolean(parsedData)}
        filename={parsedData?.filename}
        rowCount={parsedData?.totalRows}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onReset={handleReset}
        onOpenMappingModal={() => setIsMappingModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col">
        {!parsedData ? (
          <LandingUpload
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <Dashboard
            data={parsedData}
            onReset={handleReset}
            onOpenMappingModal={() => setIsMappingModalOpen(true)}
            onCurrencyChange={handleCurrencyChange}
          />
        )}
      </main>

      {/* Column Field Mapping Modal */}
      {parsedData && (
        <ColumnMappingModal
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          headers={parsedData.headers}
          currentMapping={parsedData.mapping}
          onApplyMapping={handleApplyMapping}
        />
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinPulse Analytics • Dynamic Business Intelligence</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Powered by React, Tailwind CSS, PapaParse & Recharts
          </span>
        </div>
      </footer>
    </div>
  );
}
