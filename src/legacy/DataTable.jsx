import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

export default function DataTable({ rows, currencySymbol, hasCategoryColumn }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [profitStatusFilter, setProfitStatusFilter] = useState('ALL'); // 'ALL', 'PROFIT', 'LOSS'
  const [sortField, setSortField] = useState('timestamp'); // 'timestamp', 'revenue', 'expense', 'profit', 'category'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [rows]);

  // Filter and sort records
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    // 1. Search term filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.date?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          String(r.revenue).includes(q) ||
          String(r.expense).includes(q) ||
          String(r.profit).includes(q)
      );
    }

    // 2. Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((r) => r.category === categoryFilter);
    }

    // 3. Profit status filter
    if (profitStatusFilter === 'PROFIT') {
      result = result.filter((r) => r.profit >= 0);
    } else if (profitStatusFilter === 'LOSS') {
      result = result.filter((r) => r.profit < 0);
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [rows, searchTerm, categoryFilter, profitStatusFilter, sortField, sortDirection]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRows.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredAndSortedRows.slice(start, start + pageSize);
  }, [filteredAndSortedRows, effectivePage, pageSize]);

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-1" />
    );
  };

  // Export filtered/analyzed data to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Revenue', 'Expense', 'Net Profit', 'Profit Margin (%)', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredAndSortedRows.map((r) =>
        [
          `"${r.date}"`,
          `"${(r.category || '').replace(/"/g, '""')}"`,
          `"${(r.description || '').replace(/"/g, '""')}"`,
          r.revenue,
          r.expense,
          r.profit,
          `"${r.profitMargin.toFixed(2)}%"`,
          `"${r.profit >= 0 ? 'Profit' : 'Loss'}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_analysis_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Financial Records
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect, search, sort, and export calculated metrics across all transactions
            </p>
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export Analyzed CSV</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search descriptions, categories, dates, or values..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          {hasCategoryColumn && categoriesList.length > 0 && (
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">All Categories ({categoriesList.length})</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Profit Status Filter */}
          <div>
            <select
              value={profitStatusFilter}
              onChange={(e) => {
                setProfitStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="PROFIT">Profitable Only</option>
              <option value="LOSS">Loss Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('timestamp')}
                className="group px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {renderSortIcon('timestamp')}
                </div>
              </th>

              {hasCategoryColumn && (
                <th
                  onClick={() => handleSort('category')}
                  className="group px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex items-center">
                    <span>Category</span>
                    {renderSortIcon('category')}
                  </div>
                </th>
              )}

              <th
                onClick={() => handleSort('description')}
                className="group px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center">
                  <span>Description / Memo</span>
                  {renderSortIcon('description')}
                </div>
              </th>

              <th
                onClick={() => handleSort('revenue')}
                className="group px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center justify-end">
                  <span>Revenue</span>
                  {renderSortIcon('revenue')}
                </div>
              </th>

              <th
                onClick={() => handleSort('expense')}
                className="group px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center justify-end">
                  <span>Expense</span>
                  {renderSortIcon('expense')}
                </div>
              </th>

              <th
                onClick={() => handleSort('profit')}
                className="group px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center justify-end">
                  <span>Net Profit</span>
                  {renderSortIcon('profit')}
                </div>
              </th>

              <th
                onClick={() => handleSort('profitMargin')}
                className="group px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center justify-end">
                  <span>Margin</span>
                  {renderSortIcon('profitMargin')}
                </div>
              </th>

              <th className="px-4 py-3.5 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={hasCategoryColumn ? 8 : 7}
                  className="px-4 py-12 text-center text-slate-400 text-xs"
                >
                  No matching financial records found.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {row.date}
                  </td>

                  {hasCategoryColumn && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200/60 dark:border-slate-700/60">
                        {row.category}
                      </span>
                    </td>
                  )}

                  <td className="px-4 py-3 max-w-xs truncate text-slate-800 dark:text-slate-200 font-medium" title={row.description}>
                    {row.description}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {formatCurrency(row.revenue, currencySymbol)}
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(row.expense, currencySymbol)}
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${
                      row.profit >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(row.profit, currencySymbol)}
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-mono text-[11px] whitespace-nowrap ${
                      row.profitMargin >= 0
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatPercentage(row.profitMargin, true, 1)}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {row.profit >= 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <TrendingUp className="w-3 h-3" />
                        <span>Profit</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <TrendingDown className="w-3 h-3" />
                        <span>Loss</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="hidden sm:inline">
            Showing{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {filteredAndSortedRows.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {Math.min(effectivePage * pageSize, filteredAndSortedRows.length)}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {filteredAndSortedRows.length}
            </strong>{' '}
            filtered entries
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={effectivePage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200">
            Page {effectivePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={effectivePage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
