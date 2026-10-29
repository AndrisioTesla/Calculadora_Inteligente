import React, { useState, useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft, Percent } from 'lucide-react';

interface StandardCalcProps {
  onAddTapeEntry: (operation: string, value: number, note?: string) => void;
  onOpenQuickTool: (tool: 'markup' | 'margin' | 'tax-plus' | 'tax-minus') => void;
}

export const StandardCalc: React.FC<StandardCalcProps> = ({ onAddTapeEntry, onOpenQuickTool }) => {
  const [display, setDisplay] = useState('0');
  const [subDisplay, setSubDisplay] = useState('Pronto');
  const [storedVal, setStoredVal] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  // Manipulação de dígitos
  const inputDigit = useCallback(
    (digit: string) => {
      if (resetNext || display === '0') {
        setDisplay(digit);
        setResetNext(false);
      } else {
        if (display.length < 16) {
          setDisplay((prev) => prev + digit);
        }
      }
    },
    [display, resetNext]
  );

  const inputComma = useCallback(() => {
    if (resetNext) {
      setDisplay('0,');
      setResetNext(false);
      return;
    }
    if (!display.includes(',')) {
      setDisplay((prev) => prev + ',');
    }
  }, [display, resetNext]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setSubDisplay('Limpo');
    setStoredVal(null);
    setPendingOp(null);
    setResetNext(false);
  }, []);

  const handleCE = useCallback(() => {
    setDisplay('0');
  }, []);

  const handleBackspace = useCallback(() => {
    if (resetNext) return;
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, resetNext]);

  const handleNegate = useCallback(() => {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay((prev) => prev.slice(1));
    } else {
      setDisplay((prev) => '-' + prev);
    }
  }, [display]);

  const parseDisplayValue = (valStr: string): number => {
    return parseFloat(valStr.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleOperator = useCallback(
    (op: string) => {
      const current = parseDisplayValue(display);

      if (pendingOp && storedVal !== null && !resetNext) {
        // Executa anterior antes de encadear
        let res = storedVal;
        if (pendingOp === '+') res = storedVal + current;
        if (pendingOp === '-') res = storedVal - current;
        if (pendingOp === '*') res = storedVal * current;
        if (pendingOp === '/') res = current !== 0 ? storedVal / current : 0;

        onAddTapeEntry(pendingOp, current);
        setDisplay(res.toLocaleString('pt-BR', { maximumFractionDigits: 6 }));
        setStoredVal(res);
      } else {
        setStoredVal(current);
        onAddTapeEntry(op, current);
      }

      setPendingOp(op);
      setSubDisplay(`${current.toLocaleString('pt-BR')} ${op}`);
      setResetNext(true);
    },
    [display, pendingOp, storedVal, resetNext, onAddTapeEntry]
  );

  const handleEquals = useCallback(() => {
    if (!pendingOp || storedVal === null) return;
    const current = parseDisplayValue(display);
    let res = 0;

    if (pendingOp === '+') res = storedVal + current;
    if (pendingOp === '-') res = storedVal - current;
    if (pendingOp === '*') res = storedVal * current;
    if (pendingOp === '/') {
      if (current === 0) {
        setDisplay('Erro');
        setSubDisplay('Divisão por Zero');
        setResetNext(true);
        return;
      }
      res = storedVal / current;
    }

    onAddTapeEntry(pendingOp, current);
    onAddTapeEntry('=', res, 'Total');

    setDisplay(res.toLocaleString('pt-BR', { maximumFractionDigits: 6 }));
    setSubDisplay(`${storedVal.toLocaleString('pt-BR')} ${pendingOp} ${current.toLocaleString('pt-BR')} =`);
    setStoredVal(null);
    setPendingOp(null);
    setResetNext(true);
  }, [display, pendingOp, storedVal, onAddTapeEntry]);

  // Suporte a teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input de texto
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === ',' || e.key === '.') {
        inputComma();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('/');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputComma, handleOperator, handleEquals, handleClear, handleBackspace]);

  // Teclas rápidas tributárias e comerciais
  const handleQuickTax = (rate: number, isAddition: boolean) => {
    const current = parseDisplayValue(display);
    const taxValue = current * (rate / 100);
    const result = isAddition ? current + taxValue : current - taxValue;
    onAddTapeEntry(isAddition ? `TAX+ ${rate}%` : `TAX- ${rate}%`, taxValue, `Imposto ${rate}%`);
    onAddTapeEntry('=', result, 'Subtotal c/ Imposto');
    setDisplay(result.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
    setSubDisplay(`${current.toLocaleString('pt-BR')} ${isAddition ? '+' : '-'} Imposto ${rate}%`);
    setResetNext(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
      {/* Visor Digital de Alta Definição */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 mb-5 relative overflow-hidden group">
        <div className="text-right text-xs font-mono text-slate-400 h-5 overflow-hidden text-ellipsis">
          {subDisplay}
        </div>
        <div className="text-right text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight break-all py-1 selection:bg-emerald-500 selection:text-slate-950">
          {display}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 mt-2 font-mono">
          <span>PRECISÃO: DEC (ABNT)</span>
          <span className="text-emerald-400 font-semibold">{pendingOp ? `OPERADOR ATIVO: ${pendingOp}` : 'PRONTO'}</span>
        </div>
      </div>

      {/* Botões de Funções Rápidas do Contador/Vendedor */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleQuickTax(18, true)}
          className="px-2 py-2 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all"
          title="Adicionar 18% de Imposto (ICMS/ISS padrão)"
        >
          TAX +18%
        </button>
        <button
          onClick={() => handleQuickTax(18, false)}
          className="px-2 py-2 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition-all"
          title="Subtrair 18% de Imposto"
        >
          TAX -18%
        </button>
        <button
          onClick={() => onOpenQuickTool('markup')}
          className="px-2 py-2 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all"
          title="Calcular Markup sobre Custo"
        >
          MARKUP
        </button>
        <button
          onClick={() => onOpenQuickTool('margin')}
          className="px-2 py-2 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all"
          title="Calcular Margem Real sobre Venda"
        >
          MARGEM
        </button>
      </div>

      {/* Teclado Numérico Principal (Grid 4x5) */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Linha 1 */}
        <button
          onClick={handleClear}
          className="h-13 font-bold text-sm bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition-all active:scale-95"
        >
          C
        </button>
        <button
          onClick={handleCE}
          className="h-13 font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
        >
          CE
        </button>
        <button
          onClick={handleBackspace}
          className="h-13 font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
          title="Apagar último caractere"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleOperator('/')}
          className={`h-13 font-bold text-base rounded-xl transition-all active:scale-95 ${
            pendingOp === '/'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-blue-950/60 text-blue-400 hover:bg-blue-900/60 border border-blue-800/40'
          }`}
        >
          ÷
        </button>

        {/* Linha 2 */}
        <button
          onClick={() => inputDigit('7')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('*')}
          className={`h-13 font-bold text-base rounded-xl transition-all active:scale-95 ${
            pendingOp === '*'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-blue-950/60 text-blue-400 hover:bg-blue-900/60 border border-blue-800/40'
          }`}
        >
          ×
        </button>

        {/* Linha 3 */}
        <button
          onClick={() => inputDigit('4')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className={`h-13 font-bold text-lg rounded-xl transition-all active:scale-95 ${
            pendingOp === '-'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-blue-950/60 text-blue-400 hover:bg-blue-900/60 border border-blue-800/40'
          }`}
        >
          −
        </button>

        {/* Linha 4 */}
        <button
          onClick={() => inputDigit('1')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className={`h-13 font-bold text-lg rounded-xl transition-all active:scale-95 ${
            pendingOp === '+'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-blue-950/60 text-blue-400 hover:bg-blue-900/60 border border-blue-800/40'
          }`}
        >
          +
        </button>

        {/* Linha 5 */}
        <button
          onClick={handleNegate}
          className="h-13 font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
          title="Inverter sinal positivo/negativo"
        >
          ±
        </button>
        <button
          onClick={() => inputDigit('0')}
          className="h-13 font-bold text-lg bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          0
        </button>
        <button
          onClick={inputComma}
          className="h-13 font-bold text-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
        >
          ,
        </button>
        <button
          onClick={handleEquals}
          className="h-13 font-bold text-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-all active:scale-95"
        >
          <CornerDownLeft className="w-5 h-5 stroke-[3]" />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-xs text-slate-400">
        💡 Use o teclado numérico (Numpad) do computador para calcular rapidamente.
      </div>
    </div>
  );
};
