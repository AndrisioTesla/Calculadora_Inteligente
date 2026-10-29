import React, { useState } from 'react';
import { PYTHON_FILES, PythonFile } from '../utils/pythonCode';
import { Code2, Copy, Check, Download, Terminal, FolderTree, FileCode, Play } from 'lucide-react';

export const PythonViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: PythonFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.split('/').pop() || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Bloco de introdução e comando rápido */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Código-Fonte Python Desktop Completo & Executável
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Todos os arquivos modulares em Python com arquitetura profissional em camadas, utilizando{' '}
            <code className="text-emerald-400 font-mono">decimal.Decimal</code> e interface CustomTkinter pronta para distribuição como executável.
          </p>
        </div>

        {/* Snippet para rodar no terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-300 flex items-center gap-3">
          <span className="text-emerald-400 select-none">$</span>
          <span>pip install -r requirements.txt && python main.py</span>
        </div>
      </div>

      {/* Editor & Navegador de Arquivos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista de Arquivos (Sidebar) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            Estrutura do Projeto Python
          </div>

          <div className="space-y-1.5">
            {PYTHON_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-mono font-semibold text-slate-200 truncate">{file.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{file.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dica de compilação PyInstaller */}
          <div className="mt-4 p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-blue-200">
            <strong className="block text-blue-300 mb-1">Como criar o .exe para os vendedores:</strong>
            <code>pyinstaller --onedir --windowed main.py</code>
          </div>
        </div>

        {/* Visualizador do Código do Arquivo Selecionado */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Cabeçalho do arquivo */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono font-bold text-white">{selectedFile.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Este Arquivo
              </button>
            </div>
          </div>

          {/* Área de Visualização do Código */}
          <div className="bg-[#0b0f19] p-4 overflow-x-auto max-h-[560px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
