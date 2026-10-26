/**
 * FinPulse Business Financial Analyzer
 * Universal File Ingestion & State Management Hook
 * 
 * @module hooks/useFileIngestion
 * @author Senior Data Architect & Principal Engineer
 */

import { useState, useCallback } from 'react';
import { UnifiedDataset, DatasetAnalysisResult, ColumnMappingOverrides } from '../types';
import { parseFile } from '../parsers';
import { 
  analyzeDataset, 
  extractFinancialKpis, 
  evaluateHealthScorecard, 
  recommendVisualizations 
} from '../analyzer';
import { INDUSTRY_DATASETS } from '../utils/sampleCsvGenerator';
import { MULTI_FORMAT_SAMPLES } from '../utils/sampleDatasets';

export function useFileIngestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataset, setDataset] = useState<UnifiedDataset | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DatasetAnalysisResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [customMapping, setCustomMapping] = useState<ColumnMappingOverrides | null>(null);

  /**
   * Primary ingestion handler for any uploaded or dropped file
   */
  const ingestFile = useCallback(async (file: File, preferredSheetName?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentFile(file);
    setCustomMapping(null);

    try {
      // 1. Universal format-agnostic parsing
      const parsedDataset = await parseFile(file, { preferredSheetName });
      setDataset(parsedDataset);

      // 2. Schema-agnostic dynamic data analysis & profiling
      const analyzed = analyzeDataset(parsedDataset);
      setAnalysisResult(analyzed);
    } catch (err: any) {
      console.error('[useFileIngestion] Error during file ingestion:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while parsing the file.');
      setDataset(null);
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply user-defined column mapping overrides and recalculate KPIs, scorecard, and charts
   */
  const applyCustomMapping = useCallback((overrides: ColumnMappingOverrides) => {
    if (!dataset || !analysisResult) return;
    setCustomMapping(overrides);

    const updatedKpis = extractFinancialKpis(dataset, analysisResult.columns, overrides);
    const updatedScorecard = evaluateHealthScorecard(updatedKpis);
    const updatedRecommendations = recommendVisualizations(analysisResult.columns);

    setAnalysisResult({
      ...analysisResult,
      financialKpis: updatedKpis,
      healthScorecard: updatedScorecard,
      recommendedCharts: updatedRecommendations,
    });
  }, [dataset, analysisResult]);

  /**
   * 1-click Currency switch override
   */
  const updateCurrencySymbol = useCallback((newSymbol: string) => {
    if (!dataset || !analysisResult) return;
    const newOverrides: ColumnMappingOverrides = {
      ...customMapping,
      currencySymbol: newSymbol,
    };
    applyCustomMapping(newOverrides);
  }, [dataset, analysisResult, customMapping, applyCustomMapping]);

  /**
   * Switch active Excel worksheet
   */
  const switchExcelSheet = useCallback(
    async (sheetName: string) => {
      if (!currentFile) return;
      await ingestFile(currentFile, sheetName);
    },
    [currentFile, ingestFile]
  );

  /**
   * Loads pre-modeled sample datasets for 1-click evaluation (Excel, JSON, XML, CSV)
   */
  const loadSampleDataset = useCallback(
    async (sampleKey: string) => {
      // Check multi-format sample suite first
      if (MULTI_FORMAT_SAMPLES[sampleKey]) {
        const file = await MULTI_FORMAT_SAMPLES[sampleKey].getFile();
        await ingestFile(file);
        return;
      }

      // Check legacy industry CSVs
      const sample = (INDUSTRY_DATASETS as any)[sampleKey];
      if (sample) {
        const blob = new Blob([sample.csv], { type: 'text/csv' });
        const file = new File([blob], sample.filename, { type: 'text/csv' });
        await ingestFile(file);
      }
    },
    [ingestFile]
  );

  /**
   * Clears active dataset and returns to landing state
   */
  const resetDataset = useCallback(() => {
    setDataset(null);
    setAnalysisResult(null);
    setCurrentFile(null);
    setCustomMapping(null);
    setErrorMessage(null);
  }, []);

  return {
    isLoading,
    errorMessage,
    dataset,
    analysisResult,
    currentFile,
    customMapping,
    ingestFile,
    applyCustomMapping,
    updateCurrencySymbol,
    switchExcelSheet,
    loadSampleDataset,
    resetDataset,
  };
}
