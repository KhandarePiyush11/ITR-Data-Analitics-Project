/**
 * FinPulse Business Financial Analyzer
 * Dynamic Schema & Statistical Inspector Drawer
 * 
 * @module components/SchemaInspectorDrawer
 */

import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Search, 
  Hash, 
  Calendar, 
  Tag, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ColumnProfile, InferredDataType } from '../types';

interface SchemaInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columnList: ColumnProfile[];
}

export const SchemaInspectorDrawer: React.FC<SchemaInspectorDrawerProps> = ({
  isOpen,
  onClose,
  columnList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredColumns = columnList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.inferredType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.semanticRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: InferredDataType) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-blue-500" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'categorical':
        return <Tag className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inferred Schema & Data Profiler
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {columnList.length} columns inspected with statistical distribution
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter columns by name, type or semantic role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Column Profiling List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredColumns.map((col) => {
            const hasNumericStats = Boolean(col.numericStats);
            const hasCatStats = Boolean(col.categoricalStats);
            const hasDateStats = Boolean(col.dateStats);

            return (
              <div
                key={col.name}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getTypeIcon(col.inferredType)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{col.name}</h4>
                      <span className="text-[10px] text-slate-400">Column #{col.index + 1}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Inferred Type Pill */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {col.inferredType}
                    </span>

                    {/* Semantic Role Pill */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {col.semanticRole} ({Math.round(col.roleConfidence * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Statistical Breakdown */}
                {hasNumericStats && col.numericStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Min / Max:</span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {col.numericStats.min.toLocaleString()} — {col.numericStats.max.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mean:</span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {col.numericStats.mean.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Median:</span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {col.numericStats.median.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sum:</span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {col.numericStats.sum.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}

                {hasCatStats && col.categoricalStats && (
                  <div className="text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Unique Items: <strong>{col.categoricalStats.uniqueCount}</strong></span>
                      <span>Cardinality: <strong>{col.categoricalStats.cardinalityRatio}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {col.categoricalStats.topValues.slice(0, 4).map((top) => (
                        <span
                          key={top.value}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {top.value} ({top.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasDateStats && col.dateStats && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Timespan:</span>
                      <strong className="text-slate-700 dark:text-slate-200">
                        {col.dateStats.earliestDate} → {col.dateStats.latestDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Frequency:</span>
                      <strong className="text-slate-700 dark:text-slate-200 uppercase">
                        {col.dateStats.frequency} ({col.dateStats.timespanDays} days)
                      </strong>
                    </div>
                  </div>
                )}

                {/* Sample Values Preview */}
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span>Samples:</span>
                  <div className="flex flex-wrap gap-1">
                    {col.sampleValues.map((v, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
