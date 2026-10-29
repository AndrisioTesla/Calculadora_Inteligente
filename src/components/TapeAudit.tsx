import React, { useState } from 'react';
import { TapeEntry } from '../types';
import { formatMoney } from '../utils/financial';
import { FileSpreadsheet, Copy, Trash2, Tag, Check, Clock } from 'lucide-react';

interface TapeAuditProps {
  entries: TapeEntry[];
  onClear: () => void;
  onUpdateNote: (id: string, note: string) => void;
}

export const TapeAudit: React.FC<TapeAuditProps> = ({ entries, onClear, onUpdateNote }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleStartEdit = (entry: TapeEntry) => {
    setEditingId(entry.id);
    setNoteInput(entry.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, noteInput.trim());
    setEditingId(null);
  };

  const handleCopyText = () => {
    const text = entries
      .map(
        (e) =>
          `[${e.timestamp}] ${e.operation.padEnd(6)} ${formatMoney(e.value).padStart(14)}  =  ${formatMoney(
            e.subtotal
          ).padStart(14)}${e.note ? ` (${e.note})` : ''}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    let csv = 'Data/Hora;Operação;Valor;Subtotal Acumulado;Anotação\n';
    entries.forEach((e) => {
      csv += `${e.timestamp};"${e.operation}";${e.value.toFixed(2).replace('.', ',')};${e.subtotal
        .toFixed(2)
        .replace('.', ',')};"${e.note || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fita_calculo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lastSubtotal = entries.length > 0 ? entries[entries.length - 1].subtotal : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header da Fita */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            Fita de Auditoria Contínua
          </h2>
          <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
            {entries.length} registro{entries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyText}
            disabled={entries.length === 0}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Copiar fita em texto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={entries.length === 0}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Exportar para Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            disabled={entries.length === 0}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Limpar fita"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conteúdo da Fita (Lista com efeito de bobina de papel) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs max-h-[500px]">
        {entries.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center px-4">
            <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
            <p className="font-sans text-sm font-medium text-slate-400">A fita está vazia</p>
            <p className="font-sans text-xs text-slate-500 mt-1 max-w-xs">
              Execute cálculos na calculadora ou ferramentas de vendas para registrar cada passo com auditoria.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isEditing = editingId === entry.id;
            const isTotal = entry.operation === '=';
            return (
              <div
                key={entry.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isTotal
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isTotal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {entry.operation}
                  </span>
                </div>

                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-slate-400 text-xs">
                    {entry.operation !== '=' ? `${entry.operation} ${formatMoney(entry.value)}` : 'Total calculado'}
                  </span>
                  <span className={`text-sm font-semibold ${isTotal ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                    = {formatMoney(entry.subtotal)}
                  </span>
                </div>

                {/* Nota / Rótulo da linha */}
                <div className="mt-1 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Ex: Custo base, Frete, ICMS..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(entry.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveNote(entry.id)}
                        className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded text-[11px] font-bold"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-slate-400 italic">
                        {entry.note ? `📌 ${entry.note}` : 'Sem anotação'}
                      </span>
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="text-[10px] text-slate-500 hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {entry.note ? 'Editar' : '+ Rótulo'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé com Total Acumulado */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between font-mono">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-sans">Saldo da Fita:</span>
        <span className="text-base font-bold text-emerald-400">{formatMoney(lastSubtotal)}</span>
      </div>
    </div>
  );
};
