# Python ProCalc - Calculadora Profissional para Contadores e Vendedores

> **Python ProCalc** é uma solução completa de cálculo comercial, fiscal e contábil projetada para suprir as lacunas críticas deixadas pelas calculadoras convencionais de mesa ou de bolso.

O projeto inclui uma **Aplicação Desktop Nativa em Python** (com interface gráfica moderna via CustomTkinter, suporte a teclado numérico e fita de auditoria contínua) e uma **Interface Web Interativa** completa para simulação, testes em tempo real e exportação.

---

## 📌 O que é este Projeto?

Calculadoras convencionais realizam apenas operações aritméticas elementares e percentuais genéricos. No quotidiano de vendas e contabilidade, isso gera dois grandes problemas:
1. **Erros de Precificação**: vendedores confundem *Markup* com *Margem Real*, aplicando percentuais sobre o custo e perdendo lucratividade na venda.
2. **Retrabalho e Falhas Fiscais**: contadores precisam calcular impostos "por dentro" (*gross-up*), retenções na fonte de notas fiscais de serviço e juros de mora diários de títulos vencidos, tarefas que calculadoras de mesa comuns não suportam.

O **Python ProCalc** reúne esses recursos em um motor de cálculo com precisão monetária estrita (`decimal.Decimal`, com arredondamento padrão ABNT `ROUND_HALF_UP`), eliminando erros de ponto flutuante binário.

---

## ⚙️ Como Funciona e Principais Funcionalidades

### 1. Motor Comercial (Para Vendedores e Gestores de Preço)
* **Markup vs. Margem de Lucro Real**:
  - Mostra o impacto de precificação lado a lado.
  - *Exemplo*: Um produto com custo de R$ 100,00 e margem desejada de 30% deve ser vendido a **R$ 142,86** (fórmula: `Custo / (1 - Margem)`). Aplicar 30% de markup gera R$ 130,00, o que equivale a apenas **23,08%** de margem real na venda.
* **Descontos em Cascata**:
  - Calcula descontos sucessivos de forma correta (ex.: 10% de tabela + 5% à vista não é 15%, mas sim 14,50% efetivo).
* **Taxas de Maquininha e Meios de Pagamento**:
  - Apura o valor líquido a receber no caixa após tarifas de débito, crédito à vista, parcelado com juros e PIX comercial.
* **Calculadora de Troco Inteligente**:
  - Calcula o troco e indica a distribuição ideal e otimizada de cédulas (R$ 200 a R$ 2) e moedas (R$ 1 a R$ 0,01) para agilizar o atendimento.
* **Comissão de Vendas**:
  - Permite calcular a comissão do vendedor sobre o faturamento bruto ou sobre o lucro/margem de contribuição.

### 2. Motor Fiscal e Contábil (Para Contadores e Analistas Fiscais)
* **Impostos "Por Dentro" (*Gross-Up*) vs. "Por Fora"**:
  - Recompõe a base de cálculo para tributos em que o imposto integra sua própria base (ex.: ICMS, ISS e tributos indiretos).
* **Simulador de Retenções Tributárias na Fonte**:
  - Apura automaticamente as retenções de IRRF (1,5%), PCC / PIS-COFINS-CSLL (4,65%), ISS e INSS em notas fiscais de prestação de serviços.
* **Juros de Mora e Atualização de Títulos Vencidos**:
  - Atualiza boletos e duplicatas em atraso com multa moratória fixa e juros diários (*pro rata die*).
* **Simulador de Financiamentos (Tabela Price vs. SAC)**:
  - Compara parcelas fixas (Price) com amortizações constantes (SAC), demonstrando o total de juros acumulados e a economia proporcionada pelo SAC.
* **Depreciação Contábil Linear**:
  - Calcula quotas anuais e mensais com base no custo de aquisição, valor residual e vida útil do ativo imobilizado.

### 3. Fita de Auditoria Contínua (*Digital Paper Tape*)
* Substitui as bobinas de papel barulhentas das calculadoras de escritório antigas (Elgin, Olivetti).
* Registra data, hora, tipo de operação e valor de cada cálculo.
* Permite adicionar e editar rótulos explicativos em cada linha (ex.: *"Frete"*, *"Custo do Produto"*, *"ICMS"*).
* Exporta o histórico em formato **CSV/Excel** ou copia o texto formatado para relatórios e prestação de contas.

---

## 🚀 Como Executar o Projeto

Você tem duas formas de executar a aplicação:

### Opção A: Executar a Aplicação Desktop em Python

#### 1. Pré-requisitos
* Python 3.10 ou superior instalado no seu sistema ([Download Python](https://www.python.org/)).

#### 2. Instalação das Dependências
Abra o terminal na pasta raiz do projeto e instale os pacotes necessários:
```bash
pip install -r python_procalc/requirements.txt
```

> **Nota:** As dependências são:
> * `customtkinter`: biblioteca para interface gráfica moderna em modo Dark/Light.
> * `openpyxl`: suporte à geração e leitura de planilhas Excel.
> * `reportlab`: geração de relatórios e comprovantes em PDF.

#### 3. Iniciar o Programa
```bash
python python_procalc/main.py
```

#### 4. Gerar um Executável Portátil (`.exe` para Windows ou binário para Linux/Mac)
Para distribuir o programa para vendedores e equipe de contabilidade sem que eles precisem ter o Python instalado:
```bash
pip install pyinstaller
pyinstaller --noconfirm --onedir --windowed --add-data "python_procalc/core:core" --add-data "python_procalc/modules:modules" python_procalc/main.py
```
O arquivo executável pronto será gerado dentro da pasta `dist/main/`.

---

### Opção B: Executar a Aplicação Web Interativa (React / Vite)

Caso queira utilizar ou hospedar a interface web em navegador:

#### 1. Pré-requisitos
* Node.js 18 ou superior instalado ([Download Node.js](https://nodejs.org/)).

#### 2. Instalação e Execução
```bash
# 1. Instalar pacotes npm
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev
```
A aplicação estará disponível no navegador no endereço `http://localhost:3000` (ou na porta indicada pelo terminal).

#### 3. Build de Produção
```bash
npm run build
```

---

## 📁 Estrutura de Diretórios do Projeto

```text
├── python_procalc/              # Código-fonte da Aplicação Desktop em Python
│   ├── main.py                  # Ponto de entrada com Interface Gráfica CustomTkinter
│   ├── requirements.txt         # Pacotes Python necessários
│   ├── README.md                # Manual específico da versão Python
│   ├── core/
│   │   ├── __init__.py
│   │   └── money.py             # Precisão monetária decimal.Decimal e formatadores
│   └── modules/
│       ├── __init__.py
│       ├── commercial.py        # Fórmulas de Markup, Margens, Descontos e Troco
│       ├── fiscal.py            # Impostos por dentro/fora, Retenções e Juros de Mora
│       └── tape.py              # Fita de auditoria contínua e exportação CSV
│
├── src/                         # Aplicação Web Interativa (React + TypeScript + Tailwind)
│   ├── components/
│   │   ├── Header.tsx           # Cabeçalho com navegação e download do código
│   │   ├── StandardCalc.tsx     # Visor contábil e teclado físico/virtual
│   │   ├── TapeAudit.tsx        # Fita de auditoria com rótulos e exportação CSV
│   │   ├── SalesModule.tsx      # Módulo comercial com simulador de preço e troco
│   │   ├── AccountingModule.tsx # Módulo tributário (Gross-up, retenções e SAC/Price)
│   │   ├── PythonViewer.tsx     # Visualizador e exportador dos arquivos Python
│   │   └── GuideModal.tsx       # Guia prático sobre armadilhas de cálculo
│   ├── utils/
│   │   ├── financial.ts         # Fórmulas financeiras em TypeScript
│   │   └── pythonCode.ts        # Arquivos Python integrados para visualização/download
│   ├── types/                   # Tipagens TypeScript
│   ├── App.tsx                  # Componente principal
│   └── main.tsx                 # Ponto de entrada React
│
├── package.json                 # Configuração do ambiente Node.js / Vite
├── index.html                   # Entry point HTML da aplicação web
└── README.md                    # Documentação geral do projeto
```

---

## 🔒 Por que usar `decimal.Decimal` em vez de `float`?

No desenvolvimento de softwares para contabilidade e vendas, o uso do tipo primitivo `float` causa erros silenciosos devido à representação binária IEEE 754 (exemplo clássico no Python: `0.1 + 0.2` resulta em `0.30000000000000004`).

Em um fechamento de caixa ou apuração fiscal de milhares de itens, essas frações de milésimos se acumulam gerando diferenças de centavos nos balancetes e notas fiscais. O **Python ProCalc** utiliza exclusivamente `decimal.Decimal` com a regra oficial `ROUND_HALF_UP`, garantindo total conformidade contábil.
