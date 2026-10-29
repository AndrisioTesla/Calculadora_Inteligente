# Python ProCalc - Calculadora Profissional para Contadores e Vendedores

Plano completo de concepção, engenharia funcional e arquitetura técnica para o desenvolvimento de uma calculadora em Python voltada especificamente para as necessidades práticas de contabilidade, gestão fiscal e operações de vendas de alta performance.

---

## Decisões Críticas e Alinhamento com o Utilizador

> [!IMPORTANT]
> Calculadoras tradicionais (físicas ou de sistema operacional) limitam-se à aritmética elementar e a percentuais genéricos, gerando retrabalho diário em planilhas para calcular impostos, margens e comissões. Este plano estrutura o software em três pilares integrados: **Motor Comercial (Vendas)**, **Motor Fiscal/Contábil** e **Fita de Auditoria Contínua com Exportação**.

- **Decisão Confirmada 1 (Escopo Funcional)**: Modo Híbrido especializado, combinando ferramentas para Vendedores (markup, margem bruta, descontos em cascata, taxas de cartão, troco) e Contadores (impostos por dentro/fora, retenções, juros compostos, juros de mora/multas e depreciação).
- **Decisão Confirmada 2 (Padrão de Precisão Numérica)**: Adoção estrita da biblioteca nativa `decimal.Decimal` em toda a base de cálculo para eliminar erros de arredondamento de ponto flutuante binário (IEEE 754), indispensável em qualquer ambiente financeiro.
- **Decisão Proposta para Interface**: Arquitetura modular em camadas, priorizando **CustomTkinter / PyQt6** para aplicação desktop moderna com suporte nativo a temas (Dark/Light) e atalhos de teclado numérico (Numpad).

---

## 1. Visão Geral e Necessidades Reais do Profissional

### O que um Vendedor precisa além da calculadora comum:
1. **Diferenciação clara entre Markup e Margem Real**:
   - Uma das maiores causas de prejuízo em vendas: aplicar 30% sobre o custo achando que se obterá 30% de margem no preço final (markup de 30% em 100 = 130, mas a margem sobre a venda é de apenas 23,07%). O sistema calcula e exibe ambos lado a lado instantaneamente.
2. **Descontos em Cascata e Preço Alvo**:
   - Cálculo de promoções sucessivas (ex: desconto de tabela 10% + desconto à vista 5% + cupom) sem erros de soma simples.
3. **Custos Financeiros e Maquininhas de Cartão**:
   - Desconto real das taxas de adquirente (débito, crédito à vista, parcelado com e sem antecipação de recebíveis, taxa de split PIX).
4. **Calculadora Rápida de Troco e Decomposição de Pagamentos**:
   - Pagamento misto (ex: parte em dinheiro, parte no PIX ou cartão) e sugestão de cédulas para troco rápido.
5. **Comissão de Venda**:
   - Cálculo de comissão bruta versus comissão líquida (descontados impostos ou descontos concedidos pelo vendedor).

### O que um Contador precisa além da calculadora comum:
1. **Cálculo de Impostos 'Por Dentro' e 'Por Fora'**:
   - Cálculo de alíquotas diretas e reconstituição de base tributária (ex: ICMS/ISS/PIS/COFINS por dentro, cálculo de carga tributária agregada).
2. **Retenções na Fonte**:
   - Simulação instantânea de deduções tributárias em notas fiscais de serviço ou produtos (IRRF, INSS, CSLL, PIS, COFINS).
3. **Juros de Mora, Multas e Correção Monetária**:
   - Atualização de títulos e duplicatas vencidas com cálculo pro rata die (multa percentual fixa + juros diários + correção).
4. **Amortização e Matemática Financeira (Price vs. SAC)**:
   - Simulação de parcelas, juros acumulados e saldo devedor em poucos cliques.
5. **Depreciação de Ativos**:
   - Métodos linear (cotas constantes) e acelerada por tempo de vida útil contábil.

---

## 2. Experiência de Utilizador e Interface (UX/UI)

### Fluxo Operacional
```
┌────────────────────────────────────────────────────────────────────────┐
│  Python ProCalc v1.0                     [ Modos: Geral | Vendas | Fiscal ] │
├──────────────────────────────────────┬─────────────────────────────────┤
│ Visor Principal & Histórico Imediato │ Fita de Auditoria Contínua      │
│                                      │                                 │
│ [ 1.450,00                         ] │ [10:42] Custo Prod:  1.000,00   │
│ Margem: 31.03%  |  Markup: 45.00%    │ [10:42] + Frete:       100,00   │
│ Imposto Est.: 261,00 (18%)           │ [10:43] + Markup 45%:  495,00   │
│ Lucro Líquido: 189,00                │ [10:43] = Subtotal:  1.595,00   │
├──────────────────────────────────────┤ [10:44] - Desc 5%:    -79,75   │
│ Teclado Numérico & Modificadores     │ [10:44] = Preço Fin: 1.515,25   │
│ [ C ] [ CE ] [ % ] [ / ]  [ MARGEM ] │                                 │
│ [ 7 ] [ 8  ] [ 9 ] [ * ]  [ MARKUP ] │ Ações da Fita:                  │
│ [ 4 ] [ 5  ] [ 6 ] [ - ]  [ TAX+   ] │ [ Editar Linha ] [ Limpar ]     │
│ [ 1 ] [ 2  ] [ 3 ] [ + ]  [ TAX-   ] │ [ Copiar ] [ Exportar Excel ]   │
│ [ 0 ] [ ,  ] [ = ] [Ent]  [ PARCEL ] │ [ Gerar Comprovante PDF ]       │
└──────────────────────────────────────┴─────────────────────────────────┘
```

### Características Visuais e Ergonômicas:
- **Painel Duplo (Calculadora + Fita de Papel Digital)**: O lado esquerdo fornece o teclado e visor convencional, enquanto o lado direito registra cada etapa com data/hora e rótulo editável.
- **Teclado Totalmente Mapeável**: Operação 100% via teclado numérico físico (Numpad) com atalhos intuitivos (Enter = Calcular, M = Margem, K = Markup, T = Impostos, Esc = Limpar).
- **Formatador Numérico Localizável**: Alternância direta entre padrão brasileiro/europeu (`1.250,50`) e anglo-saxão (`1,250.50`).
- **Tema Profissional**: Esquema de cores corporativo escuro (Dark Slate / Charcoal) com acentos em verde esmeralda para lucros e âmbar para impostos/descontos.

---

## 3. Principais Decisões de Produto e Engenharia

| Decisão | Abordagem Escolhida | Justificativa | Alternativa Rejeitada |
| :--- | :--- | :--- | :--- |
| **Aritmética Numérica** | `decimal.Decimal` nativo do Python | Elimina imprecisões de ponto flutuante clássicas (ex: `0.1 + 0.2 = 0.30000000000000004`). | `float` nativo (inaceitável em contabilidade e vendas). |
| **Fita de Auditoria Dinâmica** | Gravação de objetos de evento com histórico reversível | Permite ao utilizador alterar um custo inicial e recalcular toda a sequência da venda sem redigitar. | Fita de texto simples somente leitura. |
| **Framework de Interface** | CustomTkinter com fallback para Tkinter padrão | Interface visual moderna, sem necessidade de drivers ou servidores web locais, leve e executável como arquivo único (`.exe`). | Web pura (Flask/Django) ou terminal simples (menos intuitivo para caixas e balcões). |
| **Exportação de Dados** | Módulos `csv`, `openpyxl` e geração de PDF (`reportlab`) | Entrega imediata para relatórios diários de fechamento e envio a clientes/gerência. | Dependência de planilhas instaladas no sistema. |

---

## 4. Arquitetura Técnica e Estrutura dos Módulos

### Diagrama de Blocos do Sistema
```
┌─────────────────────────────────────────────────────────────┐
│                    Interface do Utilizador                  │
│     (CustomTkinter GUI / Mapeamento Teclado / Temas)        │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Eventos de Clique / Atalhos  │ Atualização de UI
┌──────────────▼──────────────────────────────▼───────────────┐
│               Controlador Central da Calculadora            │
│               (Validação, Parsing e Despacho)               │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────────────┐ ┌──────▼──────────────┐ ┌──────▼──────────────┐
│  Motor Comercial    │ │  Motor Contábil     │ │  Fita de Auditoria  │
│  - Markup / Margem  │ │  - Impostos In/Out  │ │  - Lista encadeada  │
│  - Descontos Cascata│ │  - Retenções        │ │  - Re-cálculo ativo │
│  - Taxas Cartão/PIX │ │  - Juros Mora / SAC │ │  - Anotação textual │
│  - Troco Otimizado  │ │  - Depreciação      │ │  - Exportadores     │
└──────┬──────────────┘ └──────┬──────────────┘ └──────┬──────────────┘
       │                       │                       │
┌──────▼───────────────────────▼───────────────────────▼──────┐
│                Camada de Exportação e Persistência          │
│    (openpyxl para Excel, reportlab para PDF, JSON local)    │
└─────────────────────────────────────────────────────────────┘
```

### Especificação dos Módulos Python:

1. **`core/money.py`**:
   - Classe utilitária com precisão `Decimal` configurada com `ROUND_HALF_UP` e formatadores de moeda dinâmicos.
2. **`modules/commercial.py`**:
   - Funções: `calculate_markup(cost, margin_percent)`, `calculate_margin(cost, sale_price)`, `cascade_discounts(base_price, list_of_discounts)`, `card_fee_deduction(amount, fee_percent, anticipation_days)`, `optimal_change(amount_paid, total_due)`.
3. **`modules/fiscal.py`**:
   - Funções: `tax_gross_up(net_amount, tax_rate)` (imposto por dentro), `tax_add(amount, tax_rate)` (imposto por fora), `withholding_taxes(gross_invoice, tax_dict)`, `late_payment_interest(principal, due_date, payment_date, fine_rate, daily_interest)`.
4. **`modules/tape.py`**:
   - Registro cronológico de transações contendo: `timestamp`, `operation`, `input_value`, `result_value`, `user_note`.
5. **`exporters/`**:
   - Geradores de relatórios em formato planilha e cupom/resumo analítico.
