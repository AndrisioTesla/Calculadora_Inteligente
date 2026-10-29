import React, { useState } from 'react';
import {
  formatMoney,
  formatPercent,
  calcPriceFromMargin,
  calcPriceFromMarkup,
  calcCascadeDiscounts,
  calcOptimalChange,
} from '../utils/financial';
import { TrendingUp, AlertTriangle, ArrowRight, Banknote, CreditCard, Sparkles, Plus, Trash2 } from 'lucide-react';

interface SalesModuleProps {
  onAddTapeEntry: (operation: string, value: number, note?: string) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ onAddTapeEntry }) => {
  const [activeSubTab, setActiveSubTab] = useState<'markup' | 'discounts' | 'card' | 'change' | 'commission'>('markup');

  // 1. Formação de Preço (Markup vs Margem)
  const [cost, setCost] = useState<number>(100);
  const [percentage, setPercentage] = useState<number>(30);

  const marginRes = calcPriceFromMargin(cost, percentage);
  const markupRes = calcPriceFromMarkup(cost, percentage);

  // 2. Descontos em Cascata
  const [basePrice, setBasePrice] = useState<number>(1000);
  const [discountsList, setDiscountsList] = useState<number[]>([10, 5]);
  const [newDisc, setNewDisc] = useState<number>(3);
  const cascadeRes = calcCascadeDiscounts(basePrice, discountsList);

  // 3. Taxas de Cartão / Meios de Pagamento
  const [cardSale, setCardSale] = useState<number>(500);
  const [paymentType, setPaymentType] = useState<'debito' | 'credito1x' | 'creditoParcelado' | 'pix'>('credito1x');
  const [customFee, setCustomFee] = useState<number>(3.5);
  const feeAmount = cardSale * (customFee / 100);
  const netCardReceived = cardSale - feeAmount;

  // 4. Troco Inteligente
  const [totalDue, setTotalDue] = useState<number>(137.5);
  const [amountPaid, setAmountPaid] = useState<number>(200);
  const changeRes = calcOptimalChange(totalDue, amountPaid);

  // 5. Comissão de Vendas
  const [commRate, setCommRate] = useState<number>(5);
  const [commType, setCommType] = useState<'gross' | 'profit'>('gross');
  const commBase = commType === 'gross' ? (marginRes?.sellingPrice || 142.86) : (marginRes?.grossProfit || 42.86);
  const commAmount = commBase * (commRate / 100);

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'markup', label: 'Markup vs. Margem Real' },
          { id: 'discounts', label: 'Descontos em Cascata' },
          { id: 'card', label: 'Taxas de Cartão & PIX' },
          { id: 'change', label: 'Calculadora de Troco' },
          { id: 'commission', label: 'Comissão de Vendedor' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ABA 1: Formação de Preço (A Armadilha do Markup vs Margem) */}
      {activeSubTab === 'markup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Parâmetros de Custo e Lucro
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custo do Produto ou Serviço</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Percentual Desejado (%)</label>
                <span className="text-xs font-bold text-emerald-400">{percentage}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                step="1"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 1)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[15, 20, 30, 40, 50].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercentage(p)}
                    className="flex-1 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso Educativo sobre a armadilha */}
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-200/90 text-xs flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Atenção ao risco financeiro:</strong>
                Se você aplicar {percentage}% de markup em R$ {cost.toFixed(2)}, seu lucro sobre a venda será de apenas{' '}
                <strong>{markupRes?.effectiveMargin.toFixed(2)}%</strong> e não {percentage}%. Para obter {percentage}% de margem limpa no bolso, você precisa vender por{' '}
                <strong>R$ {marginRes?.sellingPrice.toFixed(2)}</strong>!
              </div>
            </div>

            <button
              onClick={() => {
                if (marginRes) {
                  onAddTapeEntry('CUSTO', cost, 'Custo base');
                  onAddTapeEntry(`MARGEM ${percentage}%`, marginRes.grossProfit, 'Margem de lucro');
                  onAddTapeEntry('=', marginRes.sellingPrice, 'Preço de venda final');
                }
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Enviar Preço de Venda para Fita
            </button>
          </div>

          {/* Comparativo Visual Lado a Lado */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cartão MARGEM REAL */}
            <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Recomendado
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  1. Margem Real sobre a Venda
                </div>
                <div className="text-2xl font-black text-white font-mono my-2">
                  {formatMoney(marginRes?.sellingPrice || 0)}
                </div>
                <p className="text-xs text-slate-400">
                  Garante exatamente {percentage}% do faturamento como lucro bruto.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo do Produto:</span>
                  <span className="text-slate-200">{formatMoney(cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Lucro Bruto:</span>
                  <span className="text-emerald-400 font-bold">+{formatMoney(marginRes?.grossProfit || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Markup Equivalente:</span>
                  <span className="text-slate-300 font-semibold">{marginRes?.equivalentMarkup.toFixed(2)}%</span>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                Fórmula: <code>Preço = Custo ÷ (1 - Margem)</code>
              </div>
            </div>

            {/* Cartão MARKUP */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
                  2. Markup sobre o Custo
                </div>
                <div className="text-2xl font-black text-white font-mono my-2">
                  {formatMoney(markupRes?.sellingPrice || 0)}
                </div>
                <p className="text-xs text-slate-400">
                  Adiciona {percentage}% sobre o custo. Margem real fica menor!
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo do Produto:</span>
                  <span className="text-slate-200">{formatMoney(cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Lucro Bruto:</span>
                  <span className="text-blue-400 font-bold">+{formatMoney(markupRes?.grossProfit || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Margem Real Efetiva:</span>
                  <span className="text-amber-400 font-bold">{markupRes?.effectiveMargin.toFixed(2)}%</span>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                Fórmula: <code>Preço = Custo × (1 + Markup)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Descontos em Cascata */}
      {activeSubTab === 'discounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Descontos Sucessivos em Cascata</h3>
            <p className="text-xs text-slate-400">
              Calcule promoções cumulativas (ex: 10% de tabela + 5% à vista + cupom) sem errar na soma linear.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preço de Tabela (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Descontos Aplicados</label>
              <div className="space-y-2">
                {discountsList.map((disc, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono text-slate-400 w-16">Etapa {idx + 1}:</span>
                    <span className="text-sm font-bold text-white font-mono flex-1">{disc}% de desconto</span>
                    <button
                      onClick={() => setDiscountsList(discountsList.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar novo desconto */}
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  min="0.1"
                  max="99"
                  step="0.5"
                  value={newDisc}
                  onChange={(e) => setNewDisc(parseFloat(e.target.value) || 0)}
                  placeholder="Novo %"
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono text-sm"
                />
                <button
                  onClick={() => {
                    if (newDisc > 0 && newDisc < 100) {
                      setDiscountsList([...discountsList, newDisc]);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Desconto
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onAddTapeEntry('TABELA', basePrice, 'Preço de tabela');
                onAddTapeEntry(`DESC EFETIVO ${cascadeRes.effectivePercent.toFixed(2)}%`, cascadeRes.totalDiscount, 'Desconto total');
                onAddTapeEntry('=', cascadeRes.finalPrice, 'Preço final c/ desconto');
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Registrar Venda com Desconto na Fita
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Resultado da Cascata</div>
              <div className="flex items-baseline gap-3 my-2">
                <span className="text-3xl font-black text-white font-mono">{formatMoney(cascadeRes.finalPrice)}</span>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Economia de {formatMoney(cascadeRes.totalDiscount)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                O desconto real acumulado é de <strong>{cascadeRes.effectivePercent.toFixed(2)}%</strong> (e não a soma simples de {discountsList.reduce((a, b) => a + b, 0)}%).
              </p>
            </div>

            {/* Rastro passo a passo */}
            <div className="mt-4 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Evolução do Preço:</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Preço Inicial:</span>
                  <span>{formatMoney(basePrice)}</span>
                </div>
                {cascadeRes.steps.map((st, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-300">
                      Passo {i + 1} (-{st.percent}%):
                    </span>
                    <span className="text-rose-400">-{formatMoney(st.discountAmount)}</span>
                    <span className="text-emerald-400 font-bold">= {formatMoney(st.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: Taxas de Cartão & Meios de Pagamento */}
      {activeSubTab === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Taxas de Maquininha e Meios de Pagamento
            </h3>
            <p className="text-xs text-slate-400">
              Descubra quanto sobra líquido no caixa da empresa após descontar a taxa da adquirente.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Bruto da Venda (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cardSale}
                onChange={(e) => setCardSale(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Modalidade de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'debito', label: 'Débito', defaultFee: 1.49 },
                  { id: 'credito1x', label: 'Crédito à Vista', defaultFee: 3.49 },
                  { id: 'creditoParcelado', label: 'Crédito Parcelado (6x)', defaultFee: 8.99 },
                  { id: 'pix', label: 'PIX Comercial', defaultFee: 0.99 },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentType(m.id as any);
                      setCustomFee(m.defaultFee);
                    }}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      paymentType === m.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>{m.label}</div>
                    <div className="text-[10px] text-blue-400 mt-0.5">{m.defaultFee}% padrão</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taxa da Maquininha Personalizada (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.05"
                value={customFee}
                onChange={(e) => setCustomFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Valor Líquido a Receber</div>
              <div className="text-3xl font-black text-emerald-400 font-mono my-2">
                {formatMoney(netCardReceived)}
              </div>
              <p className="text-xs text-slate-400">
                A adquirente descontará <strong>{formatMoney(feeAmount)}</strong> ({customFee}%) da transação.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Preço cobrado do cliente:</span>
                <span className="text-slate-200">{formatMoney(cardSale)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Taxa da Operadora ({customFee}%):</span>
                <span>-{formatMoney(feeAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm">
                <span>Crédito em Conta:</span>
                <span>={formatMoney(netCardReceived)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddTapeEntry('VENDA CARTÃO', cardSale, 'Venda bruta');
                onAddTapeEntry(`TAXA CARTÃO (${customFee}%)`, feeAmount, 'Taxa adquirente');
                onAddTapeEntry('=', netCardReceived, 'Líquido em conta');
              }}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
            >
              Registrar Transação de Cartão na Fita
            </button>
          </div>
        </div>
      )}

      {/* ABA 4: Calculadora de Troco Inteligente */}
      {activeSubTab === 'change' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              Calculadora Rápida de Troco
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total da Compra / Conta (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalDue}
                onChange={(e) => setTotalDue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Entregue pelo Cliente (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Atalhos de notas rápidas entregues */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Atalhos de Cédulas Recebidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {[50, 100, 150, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmountPaid(v)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono"
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Troco a Devolver</div>
              <div className="text-3xl font-black text-emerald-400 font-mono my-2">
                {amountPaid >= totalDue ? formatMoney(changeRes.change) : 'FALTA PAGAMENTO'}
              </div>
              {amountPaid < totalDue && (
                <p className="text-xs text-rose-400 font-semibold">
                  O cliente ainda deve {formatMoney(totalDue - amountPaid)}.
                </p>
              )}
            </div>

            {amountPaid >= totalDue && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Distribuição Otimizada de Cédulas e Moedas:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {changeRes.breakdown.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-950 border border-slate-800/80 p-2 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 font-medium">{item.name}</span>
                      <span className="font-bold font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: Comissão do Vendedor */}
      {activeSubTab === 'commission' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-white text-base">Cálculo de Comissão de Venda</h3>
          <p className="text-xs text-slate-400">
            Diferencie comissão sobre faturamento bruto de comissão justa sobre a margem de contribuição/lucro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Base de Cálculo</label>
              <select
                value={commType}
                onChange={(e) => setCommType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
              >
                <option value="gross">Sobre Preço Total da Venda (Bruto)</option>
                <option value="profit">Sobre o Lucro Bruto / Margem</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taxa de Comissão (%)</label>
              <input
                type="number"
                min="0.1"
                max="50"
                step="0.5"
                value={commRate}
                onChange={(e) => setCommRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Comissão a Pagar ao Vendedor:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{formatMoney(commAmount)}</span>
            </div>
            <button
              onClick={() => {
                onAddTapeEntry(`COMISSÃO (${commRate}%)`, commAmount, `Comissão sobre ${commType}`);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
            >
              Lançar na Fita
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
