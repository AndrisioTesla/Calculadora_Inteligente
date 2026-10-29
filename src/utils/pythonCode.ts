export interface PythonFile {
  name: string;
  path: string;
  description: string;
  content: string;
}

export const PYTHON_FILES: PythonFile[] = [
  {
    name: 'main.py',
    path: 'main.py',
    description: 'Aplicação Desktop Principal com Interface Gráfica (CustomTkinter) e Numpad',
    content: `"""
Python ProCalc - Calculadora Profissional para Contadores e Vendedores
Aplicação Desktop com Interface Gráfica Moderna e Fita de Auditoria.

Execução:
    pip install -r requirements.txt
    python main.py
"""
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from decimal import Decimal
import sys
import os

from core.money import to_decimal, round_money, format_currency
from modules.commercial import (
    price_from_margin, price_from_markup, apply_discount_cascade,
    calculate_card_net, calculate_change_denominations
)
from modules.fiscal import (
    tax_inside_gross_up, tax_outside, withholding_taxes_simulation,
    calculate_late_dues, linear_depreciation
)
from modules.tape import AuditTape

try:
    import customtkinter as ctk
    ctk.set_appearance_mode("Dark")
    ctk.set_default_color_theme("blue")
    BaseWindow = ctk.CTk
    BaseButton = ctk.CTkButton
    BaseEntry = ctk.CTkEntry
    BaseLabel = ctk.CTkLabel
    BaseFrame = ctk.CTkFrame
    HAS_CTK = True
except ImportError:
    BaseWindow = tk.Tk
    BaseButton = tk.Button
    BaseEntry = tk.Entry
    BaseLabel = tk.Label
    BaseFrame = tk.Frame
    HAS_CTK = False

class ProCalcApp(BaseWindow):
    def __init__(self):
        super().__init__()
        self.title("Python ProCalc - Contabilidade & Vendas")
        self.geometry("980x680")
        self.minsize(850, 600)
        
        self.tape = AuditTape()
        self.current_operand = "0"
        self.stored_val = Decimal("0")
        self.pending_op = None
        self.reset_on_next_input = False
        
        self.setup_ui()
        self.bind_keys()
        
    def setup_ui(self):
        self.main_container = BaseFrame(self)
        self.main_container.pack(fill="both", expand=True, padx=12, pady=12)
        
        # Lado Esquerdo: Visor e Teclado
        self.left_frame = BaseFrame(self.main_container)
        self.left_frame.pack(side="left", fill="both", expand=True, padx=(0, 8))
        
        self.display_var = tk.StringVar(value="0")
        self.sub_display_var = tk.StringVar(value="Pronto")
        
        self.sub_display = BaseLabel(self.left_frame, textvariable=self.sub_display_var, anchor="e")
        self.sub_display.pack(fill="x", padx=10, pady=(6, 0))
        
        self.display = BaseEntry(self.left_frame, textvariable=self.display_var, justify="right", font=("Courier New", 26, "bold"))
        self.display.pack(fill="x", padx=10, pady=(2, 10))
        
        # Barra de Ações Rápidas Comerciais e Fiscais
        self.tools_bar = BaseFrame(self.left_frame)
        self.tools_bar.pack(fill="x", padx=10, pady=4)
        
        BaseButton(self.tools_bar, text="Markup vs Margem", command=self.open_markup_tool).pack(side="left", padx=2, expand=True, fill="x")
        BaseButton(self.tools_bar, text="Impostos (In/Out)", command=self.open_tax_tool).pack(side="left", padx=2, expand=True, fill="x")
        BaseButton(self.tools_bar, text="Retenções NF", command=self.open_retentions_tool).pack(side="left", padx=2, expand=True, fill="x")
        BaseButton(self.tools_bar, text="Troco & Cartão", command=self.open_sales_tools).pack(side="left", padx=2, expand=True, fill="x")
        
        # Teclado Numérico com suporte completo ao Numpad
        self.keypad_frame = BaseFrame(self.left_frame)
        self.keypad_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        buttons = [
            ("C", self.cmd_clear, "#dc2626"), ("CE", self.cmd_ce, "#991b1b"), ("+/-", self.cmd_negate, "#4b5563"), ("/", lambda: self.cmd_operator("/"), "#2563eb"),
            ("7", lambda: self.cmd_digit("7"), None), ("8", lambda: self.cmd_digit("8"), None), ("9", lambda: self.cmd_digit("9"), None), ("*", lambda: self.cmd_operator("*"), "#2563eb"),
            ("4", lambda: self.cmd_digit("4"), None), ("5", lambda: self.cmd_digit("5"), None), ("6", lambda: self.cmd_digit("6"), None), ("-", lambda: self.cmd_operator("-"), "#2563eb"),
            ("1", lambda: self.cmd_digit("1"), None), ("2", lambda: self.cmd_digit("2"), None), ("3", lambda: self.cmd_digit("3"), None), ("+", lambda: self.cmd_operator("+"), "#2563eb"),
            ("0", lambda: self.cmd_digit("0"), None), ("00", lambda: self.cmd_digit("00"), None), (",", self.cmd_comma, None), ("=", self.cmd_equals, "#16a34a")
        ]
        
        for r in range(5):
            self.keypad_frame.rowconfigure(r, weight=1)
        for c in range(4):
            self.keypad_frame.columnconfigure(c, weight=1)
            
        for i, (text, action, color) in enumerate(buttons):
            row = i // 4
            col = i % 4
            btn = BaseButton(self.keypad_frame, text=text, command=action, font=("Arial", 14, "bold"))
            if HAS_CTK and color:
                btn.configure(fg_color=color)
            btn.grid(row=row, column=col, sticky="nsew", padx=3, pady=3)
            
        # Lado Direito: Fita de Auditoria Contínua
        self.right_frame = BaseFrame(self.main_container, width=380)
        self.right_frame.pack(side="right", fill="both", expand=False)
        
        BaseLabel(self.right_frame, text="📜 Fita de Auditoria Contínua", font=("Arial", 14, "bold")).pack(anchor="w", padx=10, pady=(6, 4))
        self.tape_text = tk.Text(self.right_frame, wrap="none", font=("Courier New", 10), bg="#1e293b", fg="#f8fafc", padx=8, pady=8)
        self.tape_text.pack(fill="both", expand=True, padx=10, pady=4)
        
        self.tape_actions = BaseFrame(self.right_frame)
        self.tape_actions.pack(fill="x", padx=10, pady=6)
        BaseButton(self.tape_actions, text="Exportar CSV", command=self.export_tape_csv).pack(side="left", padx=2, expand=True, fill="x")
        BaseButton(self.tape_actions, text="Limpar Fita", command=self.clear_tape).pack(side="left", padx=2, expand=True, fill="x")

    def bind_keys(self):
        for d in "0123456789":
            self.bind(d, lambda e, digit=d: self.cmd_digit(digit))
            self.bind(f"<KP_{d}>", lambda e, digit=d: self.cmd_digit(digit))
        self.bind("<plus>", lambda e: self.cmd_operator("+"))
        self.bind("<KP_Add>", lambda e: self.cmd_operator("+"))
        self.bind("<minus>", lambda e: self.cmd_operator("-"))
        self.bind("<KP_Subtract>", lambda e: self.cmd_operator("-"))
        self.bind("<asterisk>", lambda e: self.cmd_operator("*"))
        self.bind("<KP_Multiply>", lambda e: self.cmd_operator("*"))
        self.bind("<slash>", lambda e: self.cmd_operator("/"))
        self.bind("<KP_Divide>", lambda e: self.cmd_operator("/"))
        self.bind("<Return>", lambda e: self.cmd_equals())
        self.bind("<KP_Enter>", lambda e: self.cmd_equals())
        self.bind("<Escape>", lambda e: self.cmd_clear())

    def cmd_digit(self, d: str):
        if self.reset_on_next_input or self.display_var.get() == "0":
            self.display_var.set(d)
            self.reset_on_next_input = False
        else:
            self.display_var.set(self.display_var.get() + d)

    def cmd_comma(self):
        cur = self.display_var.get()
        if "," not in cur and "." not in cur:
            self.display_var.set(cur + ",")

    def cmd_negate(self):
        cur = self.display_var.get()
        if cur.startswith("-"):
            self.display_var.set(cur[1:])
        elif cur != "0":
            self.display_var.set("-" + cur)

    def cmd_clear(self):
        self.display_var.set("0")
        self.sub_display_var.set("Limpo")
        self.stored_val = Decimal("0")
        self.pending_op = None
        self.reset_on_next_input = False

    def cmd_ce(self):
        self.display_var.set("0")

    def cmd_operator(self, op: str):
        val = to_decimal(self.display_var.get())
        if self.pending_op and not self.reset_on_next_input:
            self.cmd_equals()
            val = to_decimal(self.display_var.get())
        self.stored_val = val
        self.pending_op = op
        self.reset_on_next_input = True
        self.sub_display_var.set(f"{format_currency(val)} {op}")
        self.tape.add_entry(op, val)
        self.refresh_tape_view()

    def cmd_equals(self):
        if not self.pending_op:
            return
        current = to_decimal(self.display_var.get())
        prev = self.stored_val
        op = self.pending_op
        res = Decimal("0")
        if op == "+": res = prev + current
        elif op == "-": res = prev - current
        elif op == "*": res = prev * current
        elif op == "/":
            if current == 0:
                messagebox.showerror("Erro de Divisão", "Impossível dividir por zero.")
                return
            res = prev / current
            
        res = round_money(res)
        self.display_var.set(str(res).replace(".", ","))
        self.sub_display_var.set(f"{prev} {op} {current} =")
        self.tape.add_entry(op, current)
        self.tape.add_entry("=", res)
        self.refresh_tape_view()
        self.pending_op = None
        self.reset_on_next_input = True

    def refresh_tape_view(self):
        self.tape_text.delete("1.0", tk.END)
        for it in self.tape.items:
            note = f" [{it.note}]" if it.note else ""
            line = f"{it.timestamp}  {it.operation:>4} {it.value:>12} = {it.subtotal:>12}{note}\\n"
            self.tape_text.insert(tk.END, line)
        self.tape_text.see(tk.END)

    def clear_tape(self):
        self.tape.clear()
        self.refresh_tape_view()

    def export_tape_csv(self):
        f = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("Planilha CSV", "*.csv")])
        if f:
            with open(f, "w", encoding="utf-8") as out:
                out.write(self.tape.export_csv())
            messagebox.showinfo("Sucesso", "Fita de auditoria salva com sucesso!")

    # Modais para Vendas e Contabilidade
    def open_markup_tool(self):
        w = tk.Toplevel(self)
        w.title("Markup vs Margem Real")
        w.geometry("450x380")
        ttk.Label(w, text="Custo do Produto (R$):").pack(pady=4)
        e_cost = ttk.Entry(w); e_cost.insert(0, "100.00"); e_cost.pack()
        ttk.Label(w, text="Percentual Desejado (%):").pack(pady=4)
        e_pct = ttk.Entry(w); e_pct.insert(0, "30.00"); e_pct.pack()
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10)); res_label.pack(pady=10)
        
        def calc():
            cost = to_decimal(e_cost.get()); pct = to_decimal(e_pct.get())
            m = price_from_margin(cost, pct); k = price_from_markup(cost, pct)
            res_label.config(text=f"MARGEM DE LUCRO ({pct}%):\\nPreço Venda: {format_currency(m['selling_price'])}\\nLucro Bruto: {format_currency(m['gross_profit'])}\\n\\nMARKUP ({pct}%):\\nPreço Venda: {format_currency(k['selling_price'])}\\nLucro Bruto: {format_currency(k['gross_profit'])}")
        ttk.Button(w, text="Calcular", command=calc).pack(pady=6)

    def open_tax_tool(self):
        w = tk.Toplevel(self)
        w.title("Impostos: Por Dentro vs Por Fora")
        w.geometry("480x360")
        ttk.Label(w, text="Valor Base / Líquido:").pack(pady=4)
        e_val = ttk.Entry(w); e_val.insert(0, "1000.00"); e_val.pack()
        ttk.Label(w, text="Alíquota (%):").pack(pady=4)
        e_rate = ttk.Entry(w); e_rate.insert(0, "18.00"); e_rate.pack()
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10)); res_label.pack(pady=10)
        def calc():
            val = to_decimal(e_val.get()); rate = to_decimal(e_rate.get())
            inside = tax_inside_gross_up(val, [rate]); outside = tax_outside(val, rate)
            res_label.config(text=f"POR DENTRO (ICMS/ISS Gross-up):\\nTotal Faturado: {format_currency(inside['gross_invoice_total'])}\\nImposto Retido: {format_currency(inside['total_tax'])}\\n\\nPOR FORA (Adicional):\\nTotal Faturado: {format_currency(outside['total_with_tax'])}\\nImposto: {format_currency(outside['tax_value'])}")
        ttk.Button(w, text="Calcular", command=calc).pack(pady=6)

    def open_retentions_tool(self):
        w = tk.Toplevel(self)
        w.title("Retenções na Fonte")
        w.geometry("450x350")
        ttk.Label(w, text="Valor da Nota Fiscal:").pack(pady=4)
        e_val = ttk.Entry(w); e_val.insert(0, "5000.00"); e_val.pack()
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10)); res_label.pack(pady=10)
        def calc():
            val = to_decimal(e_val.get())
            res = withholding_taxes_simulation(val, {"IRRF (1.5%)": Decimal("1.5"), "PIS/COFINS/CSLL (4.65%)": Decimal("4.65")})
            res_label.config(text=f"Bruto: {format_currency(res['gross_invoice'])}\\nTotal Retido: {format_currency(res['total_retained'])}\\nLíquido a Pagar: {format_currency(res['net_payable'])}")
        ttk.Button(w, text="Simular", command=calc).pack(pady=6)

    def open_sales_tools(self):
        w = tk.Toplevel(self)
        w.title("Troco Inteligente")
        w.geometry("450x380")
        ttk.Label(w, text="Total da Conta:").pack(pady=4)
        e_due = ttk.Entry(w); e_due.insert(0, "137.50"); e_due.pack()
        ttk.Label(w, text="Valor Recebido:").pack(pady=4)
        e_paid = ttk.Entry(w); e_paid.insert(0, "200.00"); e_paid.pack()
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10)); res_label.pack(pady=10)
        def calc():
            chg = calculate_change_denominations(to_decimal(e_due.get()), to_decimal(e_paid.get()))
            if "error" in chg:
                res_label.config(text="Valor insuficiente!")
            else:
                lines = [f"Troco: {format_currency(chg['change_amount'])}"]
                for b in chg['breakdown']: lines.append(f" - {b['quantity']}x {b['item']}")
                res_label.config(text="\\n".join(lines))
        ttk.Button(w, text="Calcular Troco", command=calc).pack(pady=6)

if __name__ == "__main__":
    app = ProCalcApp()
    app.mainloop()
`,
  },
  {
    name: 'core/money.py',
    path: 'core/money.py',
    description: 'Motor de Precisão Monetária com decimal.Decimal (Sem falhas IEEE 754)',
    content: `"""
Módulo Core de Precisão Financeira
Garante cálculos sem erros de arredondamento IEEE 754 usando decimal.Decimal.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Union

NumberType = Union[int, float, str, Decimal]

def to_decimal(val: NumberType) -> Decimal:
    """Converte com segurança qualquer valor numérico ou string para Decimal."""
    if isinstance(val, Decimal):
        return val
    if isinstance(val, (int, float)):
        return Decimal(str(val))
    cleaned = str(val).strip().replace(" ", "").replace("R$", "").replace("€", "").replace("$", "")
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned and "." not in cleaned:
        cleaned = cleaned.replace(",", ".")
    return Decimal(cleaned if cleaned else "0")

def round_money(val: Decimal, decimals: int = 2) -> Decimal:
    """Aplica o arredondamento financeiro padrão ABNT (ROUND_HALF_UP)."""
    quantize_format = Decimal("1." + "0" * decimals) if decimals > 0 else Decimal("1")
    return val.quantize(quantize_format, rounding=ROUND_HALF_UP)

def format_currency(val: NumberType, symbol: str = "R$ ", decimals: int = 2) -> str:
    """Formata valor Decimal para string amigável no padrão monetário."""
    d = round_money(to_decimal(val), decimals)
    formatted = f"{d:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{symbol}{formatted}"
`,
  },
  {
    name: 'modules/commercial.py',
    path: 'modules/commercial.py',
    description: 'Motor Comercial: Margem, Markup, Descontos em Cascata e Troco Otimizado',
    content: `"""
Módulo de Cálculos Comerciais e Vendas (Python ProCalc)
Contém as regras de negócio para vendedores e gestores de preço.
"""
from decimal import Decimal
from typing import List, Dict
from core.money import to_decimal, round_money

def price_from_margin(cost: Decimal, margin_percent: Decimal) -> Dict[str, Decimal]:
    """
    Calcula o preço de venda a partir da margem de lucro desejada sobre a receita.
    Fórmula: Preço = Custo / (1 - Margem/100)
    """
    cost_d = to_decimal(cost)
    margin_d = to_decimal(margin_percent)
    if margin_d >= 100:
        raise ValueError("A margem de lucro sobre a venda deve ser estritamente menor que 100%.")
    factor = Decimal("1") - (margin_d / Decimal("100"))
    price = round_money(cost_d / factor)
    profit = price - cost_d
    markup_equiv = round_money((profit / cost_d) * Decimal("100")) if cost_d > 0 else Decimal("0")
    return {
        "cost": cost_d,
        "desired_margin": margin_d,
        "selling_price": price,
        "gross_profit": profit,
        "equivalent_markup": markup_equiv
    }

def price_from_markup(cost: Decimal, markup_percent: Decimal) -> Dict[str, Decimal]:
    """
    Calcula o preço de venda adicionando uma porcentagem de markup sobre o custo.
    Fórmula: Preço = Custo * (1 + Markup/100)
    """
    cost_d = to_decimal(cost)
    markup_d = to_decimal(markup_percent)
    price = round_money(cost_d * (Decimal("1") + (markup_d / Decimal("100"))))
    profit = price - cost_d
    effective_margin = round_money((profit / price) * Decimal("100")) if price > 0 else Decimal("0")
    return {
        "cost": cost_d,
        "applied_markup": markup_d,
        "selling_price": price,
        "gross_profit": profit,
        "effective_margin": effective_margin
    }

def apply_discount_cascade(base_price: Decimal, discounts: List[Decimal]) -> Dict[str, object]:
    """
    Aplica descontos sucessivos em cascata sobre o preço.
    Exemplo: R$ 1.000 com 10% + 5% sucessivos = R$ 855 (não R$ 850).
    """
    current_price = to_decimal(base_price)
    original_price = current_price
    history = []
    
    for disc in discounts:
        disc_val = to_decimal(disc)
        discount_amount = round_money(current_price * (disc_val / Decimal("100")))
        current_price = current_price - discount_amount
        history.append({
            "discount_percent": disc_val,
            "discount_amount": discount_amount,
            "subtotal": current_price
        })
        
    total_discount_value = original_price - current_price
    effective_total_percent = round_money((total_discount_value / original_price) * Decimal("100")) if original_price > 0 else Decimal("0")
    
    return {
        "original_price": original_price,
        "final_price": current_price,
        "total_discount_value": total_discount_value,
        "effective_total_percent": effective_total_percent,
        "steps": history
    }

def calculate_change_denominations(total_due: Decimal, amount_paid: Decimal) -> Dict[str, object]:
    """Calcula o troco exato e a distribuição mais eficiente de cédulas e moedas."""
    due = to_decimal(total_due)
    paid = to_decimal(amount_paid)
    if paid < due:
        return {"error": "Valor pago insuficiente", "missing": due - paid}
    
    change_total = paid - due
    cents = int(round(change_total * 100))
    denominations = [
        ("Cédula R$ 200", 20000), ("Cédula R$ 100", 10000), ("Cédula R$ 50", 5000),
        ("Cédula R$ 20", 2000), ("Cédula R$ 10", 1000), ("Cédula R$ 5", 500),
        ("Cédula R$ 2", 200), ("Moeda R$ 1", 100), ("Moeda R$ 0,50", 50),
        ("Moeda R$ 0,25", 25), ("Moeda R$ 0,10", 10), ("Moeda R$ 0,05", 5), ("Moeda R$ 0,01", 1)
    ]
    breakdown = []
    rem = cents
    for name, value in denominations:
        count = rem // value
        if count > 0:
            breakdown.append({"item": name, "quantity": count})
            rem %= value
            
    return {"total_due": due, "amount_paid": paid, "change_amount": change_total, "breakdown": breakdown}
`,
  },
  {
    name: 'modules/fiscal.py',
    path: 'modules/fiscal.py',
    description: 'Motor Fiscal/Contábil: Impostos Gross-Up, Retenções NF, Juros de Mora e Depreciação',
    content: `"""
Módulo de Cálculos Contábeis e Fiscais (Python ProCalc)
Rotinas especializadas para contadores, peritos e analistas fiscais.
"""
from decimal import Decimal
from typing import Dict, List
from core.money import to_decimal, round_money

def tax_inside_gross_up(net_amount: Decimal, tax_rates: List[Decimal]) -> Dict[str, object]:
    """Cálculo de imposto 'por dentro' (gross-up). Total = Valor / (1 - Soma_Alíquotas)."""
    net = to_decimal(net_amount)
    total_rate = sum([to_decimal(r) for r in tax_rates])
    if total_rate >= 100:
        raise ValueError("A soma das alíquotas por dentro deve ser inferior a 100%.")
    
    factor = Decimal("1") - (total_rate / Decimal("100"))
    gross_total = round_money(net / factor)
    tax_total = gross_total - net
    return {
        "net_base": net,
        "total_tax_rate": total_rate,
        "gross_invoice_total": gross_total,
        "total_tax": tax_total
    }

def tax_outside(base_amount: Decimal, tax_rate: Decimal) -> Dict[str, Decimal]:
    """Cálculo de imposto 'por fora' (adicional simples sobre a base)."""
    base = to_decimal(base_amount)
    rate = to_decimal(tax_rate)
    tax_val = round_money(base * (rate / Decimal("100")))
    return {
        "base_amount": base,
        "tax_rate": rate,
        "tax_value": tax_val,
        "total_with_tax": base + tax_val
    }

def withholding_taxes_simulation(invoice_value: Decimal, rates: Dict[str, Decimal]) -> Dict[str, object]:
    """Simulação de retenções na fonte (IRRF, PIS, COFINS, CSLL, ISS)."""
    gross = to_decimal(invoice_value)
    retentions = {}
    total_retained = Decimal("0")
    for tax_name, rate in rates.items():
        rate_d = to_decimal(rate)
        val = round_money(gross * (rate_d / Decimal("100")))
        retentions[tax_name] = {"rate": rate_d, "value": val}
        total_retained += val
        
    return {
        "gross_invoice": gross,
        "total_retained": total_retained,
        "net_payable": gross - total_retained,
        "retentions": retentions
    }

def calculate_late_dues(original_amount: Decimal, days_late: int, fine_percent: Decimal, monthly_interest: Decimal) -> Dict[str, Decimal]:
    """Cálculo de títulos em atraso com multa moratória e juros de mora diários (pro rata die)."""
    val = to_decimal(original_amount)
    fine_pct = to_decimal(fine_percent)
    fine_val = round_money(val * (fine_pct / Decimal("100")))
    
    daily_interest_rate = (to_decimal(monthly_interest) / Decimal("30")) / Decimal("100")
    interest_val = round_money(val * daily_interest_rate * Decimal(str(days_late)))
    
    return {
        "original_amount": val,
        "days_late": days_late,
        "fine_amount": fine_val,
        "interest_amount": interest_val,
        "total_to_pay": val + fine_val + interest_val
    }
`,
  },
  {
    name: 'modules/tape.py',
    path: 'modules/tape.py',
    description: 'Fita de Auditoria Contínua com registro temporal e exportação CSV/Excel',
    content: `"""
Módulo de Fita de Auditoria Contínua (Digital Paper Tape)
"""
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import List
import csv, io
from core.money import to_decimal, round_money

@dataclass
class TapeItem:
    id: int
    timestamp: str
    operation: str
    value: Decimal
    subtotal: Decimal
    note: str = ""

class AuditTape:
    def __init__(self):
        self.items: List[TapeItem] = []
        self._current_id = 1
        self.running_total = Decimal("0")
        
    def add_entry(self, operation: str, value: Decimal, note: str = "") -> TapeItem:
        val_d = to_decimal(value)
        if operation == "+": self.running_total += val_d
        elif operation == "-": self.running_total -= val_d
        elif operation == "*": self.running_total *= val_d
        elif operation == "/" and val_d != 0: self.running_total /= val_d
        elif operation in ("=", "SET"): self.running_total = val_d
            
        self.running_total = round_money(self.running_total)
        item = TapeItem(
            id=self._current_id,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            operation=operation,
            value=val_d,
            subtotal=self.running_total,
            note=note
        )
        self.items.append(item)
        self._current_id += 1
        return item

    def clear(self):
        self.items.clear()
        self.running_total = Decimal("0")

    def export_csv(self) -> str:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=";")
        writer.writerow(["ID", "Hora", "Operação", "Valor", "Subtotal Acumulado", "Anotação"])
        for it in self.items:
            writer.writerow([it.id, it.timestamp, it.operation, str(it.value).replace(".", ","), str(it.subtotal).replace(".", ","), it.note])
        return output.getvalue()
`,
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    description: 'Dependências Python para interface gráfica e exportações',
    content: `customtkinter>=5.2.0
openpyxl>=3.1.2
reportlab>=4.1.0
`,
  },
];
