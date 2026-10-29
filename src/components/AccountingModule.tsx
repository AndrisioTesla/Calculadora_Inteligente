import React, { useState } from 'react';
import {
  formatMoney,
  formatPercent,
  calcTaxesInsideOutside,
  calcLatePayment,
  calcLoanSimulation,
} from '../utils/financial';
import { Building2, Percent, Calendar, ShieldCheck, Scale, Sparkles, AlertCircle } from 'lucide-react';

interface AccountingModuleProps {
  onAddTapeEntry: (operation: string, value: number, note?: string) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ onAddTapeEntry }) => {
  const [activeSubTab, setActiveSubTab] = useState<'inside-outside' | 'retentions' | 'late-dues' | 'amortization' | 'depreciation'>('inside-outside');

  // 1. Impostos Por Dentro (Gross-Up) vs Por Fora
  const [taxBase, setTaxBase] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const taxesRes = calcTaxesInsideOutside(taxBase, taxRate);

  // 2. Retenções na Fonte
  const [invoiceVal, setInvoiceVal] = useState<number>(5000);
  const [retentionRates, setRetentionRates] = useState([
    { name: 'IRRF (Imposto de Renda)', rate: 1.5, active: true },
    { name: 'PIS / COFINS / CSLL (PCC)', rate: 4.65, active: true },
    { name: 'ISS (Municipal)', rate: 5.0, active: false },
    { name: 'INSS (Previdenciário)', rate: 11.0, active: false },
  ]);

  const activeRetentions = retentionRates.filter((r) => r.active);
  const totalRetentionRate = activeRetentions.reduce((sum, r) => sum + r.rate, 0);
  const totalRetainedAmount = invoiceVal * (totalRetentionRate / 100);
  const netPayable = invoiceVal - totalRetainedAmount;

  // 3. Títulos em Atraso (Juros de Mora e Multa)
  const [billAmount, setBillAmount] = useState<number>(2500);
  const [daysLate, setDaysLate] = useState<number>(45);
  const [finePercent, setFinePercent] = useState<number>(2.0);
  const [monthlyInterest, setMonthlyInterest] = useState<number>(1.0);
  const lateRes = calcLatePayment(billAmount, daysLate, finePercent, monthlyInterest);

  // 4. Amortização Price vs SAC
  const [loanPrincipal, setLoanPrincipal] = useState<number>(50000);
  const [annualRate, setAnnualRate] = useState<number>(14.5);
  const [loanMonths, setLoanMonths] = useState<number>(36);
  const priceRes = calcLoanSimulation(loanPrincipal, annualRate, loanMonths, 'price');
  const sacRes = calcLoanSimulation(loanPrincipal, annualRate, loanMonths, 'sac');

  // 5. Depreciação Linear
  const [assetCost, setAssetCost] = useState<number>(80000);
  const [salvageVal, setSalvageVal] = useState<number>(8000);
  const [usefulYears, setUsefulYears] = useState<number>(5);
  const depreciableBase = Math.max(0, assetCost - salvageVal);
  const annualDepreciation = usefulYears > 0 ? depreciableBase / usefulYears : 0;
  const monthlyDepreciation = annualDepreciation / 12;

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'inside-outside', label: 'Imposto "Por Dentro" vs "Por Fora"' },
          { id: 'retentions', label: 'Retenções na Fonte (NF)' },
          { id: 'late-dues', label: 'Juros de Mora & Títulos Vencidos' },
          { id: 'amortization', label: 'Financiamentos (Price vs. SAC)' },
          { id: 'depreciation', label: 'Depreciação de Ativos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA 1: Impostos Por Dentro (Gross-Up) vs Por Fora */}
      {activeSubTab === 'inside-outside' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              Recomposição de Base Tributária
            </h3>
            <p className="text-xs text-slate-400">
              No Brasil e diversos regimes contábeis, tributos indiretos como ICMS e ISS integram sua própria base de cálculo (cálculo "por dentro").
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Líquido Desejado em Caixa (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxBase}
                onChange={(e) => setTaxBase(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Alíquota Agregada de Impostos (%)</label>
                <span className="text-xs font-bold text-amber-400">{taxRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 1)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[12, 18, 20.5, 27.25].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTaxRate(r)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono"
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-200/90 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Se faturar apenas R$ {(taxBase * (1 + taxRate / 100)).toFixed(2)} ("por fora"), ao recolher {taxRate}% de imposto na guia a empresa receberá menos do que os R$ {taxBase.toFixed(2)} planejados!
              </span>
            </div>

            <button
              onClick={() => {
                onAddTapeEntry('LÍQUIDO DESEJADO', taxBase, 'Base limpa');
                onAddTapeEntry(`GROSS-UP (${taxRate}%)`, taxesRes.inside.tax, 'Imposto por dentro');
                onAddTapeEntry('=', taxesRes.inside.total, 'Total Nota Fiscal');
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Lançar NF c/ Gross-Up na Fita
            </button>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Por Dentro (Gross-Up) */}
            <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Padrão Fiscal Oficial
                </span>
                <div className="text-xs font-semibold uppercase text-slate-300 mt-2">1. Imposto Por Dentro (Gross-Up)</div>
                <div className="text-2xl font-black text-white font-mono my-2">
                  {formatMoney(taxesRes.inside.total)}
                </div>
                <p className="text-xs text-slate-400">
                  Valor que DEVE constar na Nota Fiscal para garantir exatamente {formatMoney(taxBase)} líquidos.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita Líquida:</span>
                  <span className="text-emerald-400">{formatMoney(taxesRes.inside.netBase)}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Guia de Imposto ({taxRate}%):</span>
                  <span>+{formatMoney(taxesRes.inside.tax)}</span>
                </div>
              </div>
            </div>

            {/* Por Fora */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Adicional Comum
                </span>
                <div className="text-xs font-semibold uppercase text-slate-300 mt-2">2. Imposto Por Fora (Simples)</div>
                <div className="text-2xl font-black text-slate-300 font-mono my-2">
                  {formatMoney(taxesRes.outside.total)}
                </div>
                <p className="text-xs text-slate-400">
                  Aplica {taxRate}% diretamente sobre a base sem recomposição.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor Base:</span>
                  <span className="text-slate-300">{formatMoney(taxesRes.outside.base)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Imposto Adicionado:</span>
                  <span>+{formatMoney(taxesRes.outside.tax)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Retenções na Fonte */}
      {activeSubTab === 'retentions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Retenções Tributárias na Fonte (Serviços / NF)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Bruto da Nota Fiscal (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoiceVal}
                onChange={(e) => setInvoiceVal(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Tributos com Retenção Obrigatória:</label>
              <div className="space-y-2">
                {retentionRates.map((ret, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const updated = [...retentionRates];
                      updated[idx].active = !updated[idx].active;
                      setRetentionRates(updated);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      ret.active
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={ret.active}
                        onChange={() => {}}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className="font-medium">{ret.name}</span>
                    </div>
                    <span className="font-mono font-bold">{ret.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Valor Líquido a Pagar ao Prestador</div>
              <div className="text-3xl font-black text-emerald-400 font-mono my-2">
                {formatMoney(netPayable)}
              </div>
              <p className="text-xs text-slate-400">
                Total retido a recolher via DARF/GPS: <strong>{formatMoney(totalRetainedAmount)}</strong> ({totalRetentionRate.toFixed(2)}%).
              </p>
            </div>

            {/* Detalhamento das Retenções */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>Valor Bruto da NF:</span>
                <span>{formatMoney(invoiceVal)}</span>
              </div>
              {activeRetentions.map((r, i) => (
                <div key={i} className="flex justify-between text-rose-400">
                  <span>(-) {r.name} ({r.rate}%):</span>
                  <span>-{formatMoney(invoiceVal * (r.rate / 100))}</span>
                </div>
              ))}
              <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-2 text-sm">
                <span>(=) Líquido Pago no Caixa:</span>
                <span>{formatMoney(netPayable)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddTapeEntry('NF BRUTA', invoiceVal, 'Nota Fiscal de Serviço');
                onAddTapeEntry(`RETENÇÕES (${totalRetentionRate}%)`, totalRetainedAmount, 'Tributos retidos');
                onAddTapeEntry('=', netPayable, 'Líquido pago ao prestador');
              }}
              className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Registrar Retenções de NF na Fita
            </button>
          </div>
        </div>
      )}

      {/* ABA 3: Juros de Mora e Títulos Vencidos */}
      {activeSubTab === 'late-dues' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Títulos e Boletos Vencidos
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Original do Título (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dias de Atraso</label>
              <input
                type="number"
                min="1"
                max="3650"
                value={daysLate}
                onChange={(e) => setDaysLate(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Multa Moratória (%)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={finePercent}
                  onChange={(e) => setFinePercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Juros ao Mês (%)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={monthlyInterest}
                  onChange={(e) => setMonthlyInterest(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Total Atualizado a Cobrar</div>
              <div className="text-3xl font-black text-amber-400 font-mono my-2">
                {formatMoney(lateRes.total)}
              </div>
              <p className="text-xs text-slate-400">
                Inclui multa fixa de mora de {finePercent}% + juros diários pro-rata de {(monthlyInterest / 30).toFixed(4)}% por {daysLate} dias.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Original:</span>
                <span className="text-white">{formatMoney(billAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(+) Multa Moratória ({finePercent}%):</span>
                <span>+{formatMoney(lateRes.fineAmount)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(+) Juros Pro Rata Die ({daysLate} dias):</span>
                <span>+{formatMoney(lateRes.interestAmount)}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-2 text-sm">
                <span>(=) Total a Cobrar:</span>
                <span>{formatMoney(lateRes.total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddTapeEntry('TÍTULO ORIGINAL', billAmount, 'Valor original');
                onAddTapeEntry(`ENCARGOS ATRASO (${daysLate}d)`, lateRes.fineAmount + lateRes.interestAmount, 'Multa e juros');
                onAddTapeEntry('=', lateRes.total, 'Total atualizado');
              }}
              className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Lançar Título Atualizado na Fita
            </button>
          </div>
        </div>
      )}

      {/* ABA 4: Amortização Price vs SAC */}
      {activeSubTab === 'amortization' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" />
              Simulador Price vs. SAC
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor do Financiamento (R$)</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Math.max(100, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taxa Anual (%)</label>
              <input
                type="number"
                min="1"
                max="80"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prazo em Meses</label>
              <input
                type="number"
                min="6"
                max="360"
                value={loanMonths}
                onChange={(e) => setLoanMonths(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tabela Price */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-blue-400">Tabela Price (Parcelas Fixas)</div>
                <div className="text-xl font-black text-white font-mono my-2">
                  {formatMoney(priceRes.firstInstallment)} / mês
                </div>
                <p className="text-xs text-slate-400">Prestação idêntica do início ao fim.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pago:</span>
                  <span className="text-white">{formatMoney(priceRes.totalPaid)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Juros Totais Acumulados:</span>
                  <span>+{formatMoney(priceRes.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Sistema SAC */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-emerald-400">Sistema SAC (Parcelas Decrescentes)</div>
                <div className="text-xl font-black text-white font-mono my-2">
                  1ª: {formatMoney(sacRes.firstInstallment)}
                </div>
                <p className="text-xs text-slate-400">
                  Última parcela cai para <strong>{formatMoney(sacRes.lastInstallment)}</strong>.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pago:</span>
                  <span className="text-white">{formatMoney(sacRes.totalPaid)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Juros Totais (Economia SAC):</span>
                  <span>+{formatMoney(sacRes.totalInterest)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: Depreciação Linear de Ativos */}
      {activeSubTab === 'depreciation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-white text-base">Depreciação Contábil Linear</h3>
          <p className="text-xs text-slate-400">
            Apropriação mensal e anual do desgaste ou obsolescência de máquinas, veículos e equipamentos no balanço.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custo de Aquisição (R$)</label>
              <input
                type="number"
                min="0"
                value={assetCost}
                onChange={(e) => setAssetCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Residual (R$)</label>
              <input
                type="number"
                min="0"
                value={salvageVal}
                onChange={(e) => setSalvageVal(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vida Útil (Anos)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={usefulYears}
                onChange={(e) => setUsefulYears(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Quota Anual de Depreciação:</span>
              <span className="text-xl font-bold text-white font-mono">{formatMoney(annualDepreciation)}</span>
              <span className="text-[11px] text-amber-400 block mt-0.5">({(100 / usefulYears).toFixed(2)}% ao ano)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Despesa Mensal no DRE:</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{formatMoney(monthlyDepreciation)}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Lançamento mensal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
