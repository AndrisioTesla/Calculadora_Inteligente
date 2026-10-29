import React from 'react';
import { CalculatorMode } from '../types';
import { Calculator, TrendingUp, Building2, Code2, BookOpen, Download } from 'lucide-react';

interface HeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  onDownloadAllZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onSelectMode, onDownloadAllZip }) => {
  const tabs = [
    { id: 'standard' as CalculatorMode, label: 'Calculadora & Fita', icon: Calculator },
    { id: 'sales' as CalculatorMode, label: 'Vendas & Margens', icon: TrendingUp },
    { id: 'fiscal' as CalculatorMode, label: 'Contábil & Tributário', icon: Building2 },
    { id: 'python-code' as CalculatorMode, label: 'Código Python', icon: Code2 },
    { id: 'guide' as CalculatorMode, label: 'Guia do Especialista', icon: BookOpen },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-lg tracking-tight">Python ProCalc</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Vendas & Contabilidade
                </span>
              </div>
              <p className="text-xs text-slate-400">Precisão com decimal.Decimal e Fita de Auditoria</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectMode(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Action: Download Python Project */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadAllZip}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
              title="Baixar arquivos do projeto Python"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Baixar Código .py</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
