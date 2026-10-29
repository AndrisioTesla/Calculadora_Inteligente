# Python ProCalc - Calculadora Profissional para Contabilidade e Vendas

Software de cálculo de alta precisão financeira e tributária desenvolvido em Python com interface gráfica moderna, fita de auditoria contínua e módulos especializados para contadores e vendedores.

---

## 🚀 Como Executar em sua Máquina Local

### 1. Pré-requisitos
- Python 3.10 ou superior instalado no seu sistema.

### 2. Instalação de Dependências
Abra o terminal na pasta do projeto e execute:
```bash
pip install -r requirements.txt
```

### 3. Executar o Programa
```bash
python main.py
```

### 4. Gerar Executável Portátil (.exe ou binário)
Caso queira distribuir o aplicativo para a equipe de vendas ou escritório contábil sem exigir Python instalado:
```bash
pip install pyinstaller
pyinstaller --noconfirm --onedir --windowed --add-data "core;core" --add-data "modules;modules" main.py
```

---

## 💡 O que esta Calculadora resolve:

1. **A Armadilha Markup vs. Margem de Lucro**:
   - Vendedores frequentemente confundem Markup com Margem. Ao aplicar 30% de markup num custo de R$ 100,00, o preço fica R$ 130,00, gerando uma margem real de apenas 23,08% sobre a venda. O módulo comercial calcula ambos instantaneamente.
2. **Impostos "Por Dentro" (Gross-up)**:
   - Em impostos como ICMS e ISS, o tributo integra sua própria base. O módulo fiscal calcula o valor bruto a faturar para que sobre exatamente o valor líquido pretendido em caixa.
3. **Retenções Federais e Municipais na Fonte**:
   - Simula deduções de IRRF, CSLL, PIS, COFINS e ISS em notas fiscais de serviço.
4. **Fita de Auditoria Contínua**:
   - Elimina as velhas bobinas de papel das calculadoras de mesa antigas (Olivetti/Elgin), permitindo rotular passos e exportar para CSV/Excel.
