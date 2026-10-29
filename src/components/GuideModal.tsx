import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

export const GuideModal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner de Cabeçalho */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            Manual Prático: O que Falta nas Calculadoras Convencionais?
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Calculadoras de bolso ou de mesa convencionais foram desenhadas há mais de 50 anos para aritmética genérica. No dia a dia de um vendedor ou contador, a falta de funções específicas gera prejuízos acumulados e retrabalho constante.
        </p>
      </div>

      {/* Os 5 Erros Críticos que este Sistema Resolve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Markup vs Margem */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            1. A Armadilha do Markup vs. Margem Real
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Se você compra um produto por <strong>R$ 100,00</strong> e quer <strong>30% de margem</strong>, apertar <code>100 + 30%</code> na calculadora comum gera <strong>R$ 130,00</strong>. No entanto, R$ 30 de lucro em uma venda de R$ 130 representam apenas <strong>23,08%</strong> de margem real. Para embolsar 30% limpos, o preço deve ser <strong>R$ 142,86</strong>.
          </p>
        </div>

        {/* 2. Imposto Por Dentro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            2. Recomposição Fiscal (Gross-Up / Imposto por Dentro)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tributos como ICMS e ISS incidem sobre o próprio valor da nota fiscal. Se você precisa receber <strong>R$ 1.000,00 líquidos</strong> e a alíquota é de <strong>18%</strong>, a nota deve ser emitida por <strong>R$ 1.219,51</strong> (Gross-up: <code>1000 ÷ 0,82</code>) e não por R$ 1.180,00.
          </p>
        </div>

        {/* 3. Descontos Sucessivos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            3. Descontos em Cascata vs. Soma Linear
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Oferecer <strong>10%</strong> de desconto da tabela + <strong>5%</strong> para pagamento à vista <strong>não é 15%</strong> de desconto! O segundo desconto incide sobre o saldo já reduzido. Calcular errado corrói a rentabilidade da equipe comercial.
          </p>
        </div>

        {/* 4. Fita de Auditoria Contínua */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            4. Fita Digital com Anotações e Exportação
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Em calculadoras mecânicas de mesa com bobina de papel, não é possível rotular o que é frete, imposto ou taxa, nem exportar para o Excel. A fita digital do Python ProCalc mantém rastreabilidade fiscal para prestação de contas.
          </p>
        </div>
      </div>

      {/* Checklist Operacional para Contadores e Vendedores */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Checklist Recomendado para a Formação de Preço e Faturamento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Sempre embutir a taxa da maquininha no cálculo do parcelado com juros.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Verificar se a nota fiscal de serviço exige retenções de IRRF (1,5%) e PCC (4,65%).</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Usar <code>decimal.Decimal</code> em todo código Python para garantir arredondamento bancário.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Exportar a fita de auditoria do dia para arquivamento contábil e conciliação de caixa.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
