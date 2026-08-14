# FinPulse Analytics | Dynamic Business Financial Analyzer

A modern, production-grade, single-page React web application for dynamic business financial analysis built with **Tailwind CSS**, **Lucide React**, **PapaParse**, and **Recharts**.

![FinPulse Analytics Preview](https://img.shields.io/badge/FinPulse-Analytics-indigo)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e)

---

## Key Features

- **Minimalist Initial Landing State**: Clean, uncluttered UI with zero pre-loaded or mock data on initial load.
- **Client-Side CSV Dropzone**: Centered drag-and-drop file upload zone supporting `.csv` files with instant validation.
- **Smart Column Detection (PapaParse)**: Auto-detects dates, revenue/sales, expense/cost, profit/margin, and category/segment headers regardless of naming variations.
- **Currency & String Sanitization**: Cleans currency symbols (`$`, `€`, `£`, `₹`, `¥`), commas, negative accounting formats `(1,200.50)` -> `-1200.50`, and auto-detects active currency.
- **Financial KPI Cards**: Total Revenue, Total Expenses, Net Profit/Loss (color-coded Emerald/Rose), and Net Profit Margin (%).
- **Interactive Recharts Visualizations**:
  - **Profit & Loss Overview**: Composed combo chart with Revenue bars, Expense bars, and Net Profit trendline.
  - **Cumulative Profitability Trajectory**: Gradient Area chart showing accumulated net income over time.
  - **Category Breakdown**: Donut chart with toggleable expense vs. revenue distributions.
- **Time Granularity Switching**: Switch effortlessly between Monthly, Quarterly, Yearly, Daily, and Raw views.
- **Data Summary Table**: Full search filter, category filter, column sorting, pagination, and CSV export.
- **Column Field Mapping Modal**: Custom inspector modal to adjust column assignments for custom schemas.
- **Dark / Light Mode**: Seamless theme toggle with local storage persistence.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KhandarePiyush11/business-financial-analyzer.git
   cd business-financial-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **Charts & Visualization**: Recharts

---

## License
MIT License. Created by [Piyush Khandare](https://github.com/KhandarePiyush11).
