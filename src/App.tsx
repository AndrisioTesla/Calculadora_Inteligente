import React, { useState } from 'react';
import { CalculatorMode, TapeEntry } from './types';
import { Header } from './components/Header';
import { StandardCalc } from './components/StandardCalc';
import { TapeAudit } from './components/TapeAudit';
import { SalesModule } from './components/SalesModule';
import { AccountingModule } from './components/AccountingModule';
import { PythonViewer } from './components/PythonViewer';
import { GuideModal } from './components/GuideModal';
import { PYTHON_FILES } from './utils/pythonCode';

export default function App() {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('standard');

  // Fita de Auditoria Contínua compartilhada por todos os módulos
  const [tapeEntries, setTapeEntries] = useState<TapeEntry[]>([
    {
      id: 't-1',
      timestamp: '09:30:15',
      operation: 'SET',
      value: 1000.0,
      subtotal: 1000.0,
      note: 'Custo inicial mercadoria',
    },
    {
      id: 't-2',
      timestamp: '09:30:22',
      operation: '+',
      value: 120.0,
      subtotal: 1120.0,
      note: 'Frete e seguro de entrega',
    },
    {
      id: 't-3',
      timestamp: '09:31:05',
      operation: 'TAX+ 18%',
      value: 201.6,
      subtotal: 1321.6,
      note: 'ICMS / Tributos',
    },
    {
      id: 't-4',
      timestamp: '09:31:40',
      operation: '=',
      value: 1321.6,
      subtotal: 1321.6,
      note: 'Subtotal faturado',
    },
  ]);

  const addTapeEntry = (operation: string, value: number, note?: string) => {
    const lastSubtotal = tapeEntries.length > 0 ? tapeEntries[tapeEntries.length - 1].subtotal : 0;
    let newSubtotal = lastSubtotal;

    if (operation === '+') newSubtotal = lastSubtotal + value;
    else if (operation === '-') newSubtotal = lastSubtotal - value;
    else if (operation === '*') newSubtotal = lastSubtotal * value;
    else if (operation === '/' && value !== 0) newSubtotal = lastSubtotal / value;
    else if (operation.startsWith('TAX+')) newSubtotal = lastSubtotal + value;
    else if (operation.startsWith('TAX-')) newSubtotal = lastSubtotal - value;
    else newSubtotal = value;

    const newEntry: TapeEntry = {
      id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      operation,
      value,
      subtotal: Math.round(newSubtotal * 100) / 100,
      note: note || '',
    };

    setTapeEntries((prev) => [...prev, newEntry]);
  };

  const handleClearTape = () => {
    setTapeEntries([]);
  };

  const handleUpdateTapeNote = (id: string, note: string) => {
    setTapeEntries((prev) => prev.map((e) => (e.id === id ? { ...e, note } : e)));
  };

  const handleDownloadAllPythonZip = () => {
    // Gera arquivo texto agregado com todos os módulos Python
    let bundle = `# ========================================================\n`;
    bundle += `# PYTHON PROCALC - PACOTE COMPLETO DE CÓDIGO PYTHON\n`;
    bundle += `# Para contabilidade, rotinas fiscais e alta performance de vendas\n`;
    bundle += `# ========================================================\n\n`;

    PYTHON_FILES.forEach((f) => {
      bundle += `\n# ========================================================\n`;
      bundle += `# ARQUIVO: ${f.name}\n`;
      bundle += `# DESCRIÇÃO: ${f.description}\n`;
      bundle += `# ========================================================\n\n`;
      bundle += f.content;
      bundle += `\n\n`;
    });

    const blob = new Blob([bundle], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'python_procalc_completo.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header com Navegação */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onDownloadAllZip={handleDownloadAllPythonZip}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentMode === 'standard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <StandardCalc
                onAddTapeEntry={addTapeEntry}
                onOpenQuickTool={(tool) => {
                  if (tool === 'markup' || tool === 'margin') setCurrentMode('sales');
                  if (tool === 'tax-plus' || tool === 'tax-minus') setCurrentMode('fiscal');
                }}
              />
            </div>
            <div className="lg:col-span-5 h-[620px]">
              <TapeAudit
                entries={tapeEntries}
                onClear={handleClearTape}
                onUpdateNote={handleUpdateTapeNote}
              />
            </div>
          </div>
        )}

        {currentMode === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <SalesModule onAddTapeEntry={addTapeEntry} />
            </div>
            <div className="lg:col-span-4 h-[620px]">
              <TapeAudit
                entries={tapeEntries}
                onClear={handleClearTape}
                onUpdateNote={handleUpdateTapeNote}
              />
            </div>
          </div>
        )}

        {currentMode === 'fiscal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <AccountingModule onAddTapeEntry={addTapeEntry} />
            </div>
            <div className="lg:col-span-4 h-[620px]">
              <TapeAudit
                entries={tapeEntries}
                onClear={handleClearTape}
                onUpdateNote={handleUpdateTapeNote}
              />
            </div>
          </div>
        )}

        {currentMode === 'python-code' && <PythonViewer />}

        {currentMode === 'guide' && <GuideModal />}
      </main>

      {/* Footer com status da precisão */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Python ProCalc • Arquitetura em camadas para contabilidade e gestão de preços • Arredondamento seguro{' '}
          <span className="font-mono text-emerald-400">ROUND_HALF_UP</span> • Código pronto para execução desktop com{' '}
          <span className="font-mono text-slate-300">CustomTkinter</span>.
        </p>
      </footer>
    </div>
  );
}
