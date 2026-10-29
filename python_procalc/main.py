"""
Python ProCalc - Calculadora Profissional para Contadores e Vendedores
Aplicação Desktop Completa com Interface Gráfica e Atalhos de Teclado.

Para executar:
    pip install -r requirements.txt
    python main.py
"""
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from decimal import Decimal
import sys
import os

# Adiciona o diretório atual ao sys.path para importações locais
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.money import to_decimal, round_money, format_currency
from modules.commercial import price_from_margin, price_from_markup, apply_discount_cascade, calculate_card_net, calculate_change_denominations
from modules.fiscal import tax_inside_gross_up, tax_outside, withholding_taxes_simulation, calculate_late_dues, linear_depreciation
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
        # Container principal com divisão: Esquerda (Calculadora + Ferramentas), Direita (Fita de Auditoria)
        self.main_container = BaseFrame(self)
        self.main_container.pack(fill="both", expand=True, padx=12, pady=12)
        
        # Lado Esquerdo
        self.left_frame = BaseFrame(self.main_container)
        self.left_frame.pack(side="left", fill="both", expand=True, padx=(0, 8))
        
        # Visor Principal
        self.display_var = tk.StringVar(value="0")
        self.sub_display_var = tk.StringVar(value="Pronto")
        
        self.sub_display = BaseLabel(self.left_frame, textvariable=self.sub_display_var, anchor="e")
        self.sub_display.pack(fill="x", padx=10, pady=(6, 0))
        
        self.display = BaseEntry(self.left_frame, textvariable=self.display_var, justify="right", font=("Courier New", 26, "bold"))
        self.display.pack(fill="x", padx=10, pady=(2, 10))
        
        # Botões de Ação Rápida de Vendas / Contabilidade
        self.tools_bar = BaseFrame(self.left_frame)
        self.tools_bar.pack(fill="x", padx=10, pady=4)
        
        btn_markup = BaseButton(self.tools_bar, text="Markup vs Margem", command=self.open_markup_tool)
        btn_markup.pack(side="left", padx=2, expand=True, fill="x")
        
        btn_tax = BaseButton(self.tools_bar, text="Impostos (In/Out)", command=self.open_tax_tool)
        btn_tax.pack(side="left", padx=2, expand=True, fill="x")
        
        btn_ret = BaseButton(self.tools_bar, text="Retenções NF", command=self.open_retentions_tool)
        btn_ret.pack(side="left", padx=2, expand=True, fill="x")
        
        btn_troco = BaseButton(self.tools_bar, text="Troco & Cartão", command=self.open_sales_tools)
        btn_troco.pack(side="left", padx=2, expand=True, fill="x")
        
        # Teclado Numérico Principal
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
        
        tape_title = BaseLabel(self.right_frame, text="📜 Fita de Auditoria Contínua", font=("Arial", 14, "bold"))
        tape_title.pack(anchor="w", padx=10, pady=(6, 4))
        
        # Caixa de Texto da Fita
        self.tape_text = tk.Text(self.right_frame, wrap="none", font=("Courier New", 10), bg="#1e293b", fg="#f8fafc", padx=8, pady=8)
        self.tape_text.pack(fill="both", expand=True, padx=10, pady=4)
        
        # Barra de ferramentas da fita
        self.tape_actions = BaseFrame(self.right_frame)
        self.tape_actions.pack(fill="x", padx=10, pady=6)
        
        btn_export = BaseButton(self.tape_actions, text="Exportar CSV", command=self.export_tape_csv)
        btn_export.pack(side="left", padx=2, expand=True, fill="x")
        
        btn_clear_tape = BaseButton(self.tape_actions, text="Limpar Fita", command=self.clear_tape)
        btn_clear_tape.pack(side="left", padx=2, expand=True, fill="x")

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
        self.bind("<period>", lambda e: self.cmd_comma())
        self.bind("<comma>", lambda e: self.cmd_comma())

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
        
        if op == "+":
            res = prev + current
        elif op == "-":
            res = prev - current
        elif op == "*":
            res = prev * current
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
            note_str = f" [{it.note}]" if it.note else ""
            line = f"{it.timestamp}  {it.operation:>4} {it.value:>12} = {it.subtotal:>12}{note_str}\n"
            self.tape_text.insert(tk.END, line)
        self.tape_text.see(tk.END)

    def clear_tape(self):
        self.tape.clear()
        self.refresh_tape_view()

    def export_tape_csv(self):
        f = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV Files", "*.csv")])
        if f:
            with open(f, "w", encoding="utf-8") as out:
                out.write(self.tape.export_csv())
            messagebox.showinfo("Sucesso", "Fita de auditoria exportada com sucesso!")

    # Modais Especializados
    def open_markup_tool(self):
        w = tk.Toplevel(self)
        w.title("Formação de Preço: Margem vs Markup")
        w.geometry("450x380")
        
        ttk.Label(w, text="Custo do Produto (R$):").pack(pady=4)
        e_cost = ttk.Entry(w)
        e_cost.insert(0, "100.00")
        e_cost.pack()
        
        ttk.Label(w, text="Percentual Desejado (%):").pack(pady=4)
        e_pct = ttk.Entry(w)
        e_pct.insert(0, "30.00")
        e_pct.pack()
        
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10))
        res_label.pack(pady=10)
        
        def calc():
            cost = to_decimal(e_cost.get())
            pct = to_decimal(e_pct.get())
            m_res = price_from_margin(cost, pct)
            k_res = price_from_markup(cost, pct)
            txt = (
                f"--- SE FOR MARGEM REAL SOBRE A VENDA ({pct}%) ---\n"
                f"Preço de Venda: {format_currency(m_res['selling_price'])}\n"
                f"Lucro Bruto:    {format_currency(m_res['gross_profit'])}\n"
                f"Markup Exigido: {m_res['equivalent_markup']}%\n\n"
                f"--- SE FOR MARKUP SOBRE O CUSTO ({pct}%) ---\n"
                f"Preço de Venda: {format_currency(k_res['selling_price'])}\n"
                f"Lucro Bruto:    {format_currency(k_res['gross_profit'])}\n"
                f"Margem Real:    {k_res['effective_margin']}%\n"
            )
            res_label.config(text=txt)
            
        ttk.Button(w, text="Calcular Comparativo", command=calc).pack(pady=6)

    def open_tax_tool(self):
        w = tk.Toplevel(self)
        w.title("Impostos: Por Dentro (Gross-Up) vs Por Fora")
        w.geometry("480x360")
        
        ttk.Label(w, text="Valor Base / Líquido Desejado:").pack(pady=4)
        e_val = ttk.Entry(w)
        e_val.insert(0, "1000.00")
        e_val.pack()
        
        ttk.Label(w, text="Alíquota Total (%):").pack(pady=4)
        e_rate = ttk.Entry(w)
        e_rate.insert(0, "18.00")
        e_rate.pack()
        
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10))
        res_label.pack(pady=10)
        
        def calc():
            val = to_decimal(e_val.get())
            rate = to_decimal(e_rate.get())
            inside = tax_inside_gross_up(val, [rate])
            outside = tax_outside(val, rate)
            txt = (
                f"--- IMPOSTO POR DENTRO (Ex: ICMS / ISS) ---\n"
                f"Total Faturado (NF): {format_currency(inside['gross_invoice_total'])}\n"
                f"Valor do Imposto:    {format_currency(inside['total_tax'])}\n"
                f"Valor Líquido Caixa: {format_currency(inside['net_base'])}\n\n"
                f"--- IMPOSTO POR FORA (Adicional Simples) ---\n"
                f"Total Faturado (NF): {format_currency(outside['total_with_tax'])}\n"
                f"Valor do Imposto:    {format_currency(outside['tax_value'])}\n"
            )
            res_label.config(text=txt)
            
        ttk.Button(w, text="Calcular Impostos", command=calc).pack(pady=6)

    def open_retentions_tool(self):
        w = tk.Toplevel(self)
        w.title("Simulador de Retenções na Fonte")
        w.geometry("480x400")
        
        ttk.Label(w, text="Valor Bruto da NF de Serviço:").pack(pady=4)
        e_val = ttk.Entry(w)
        e_val.insert(0, "5000.00")
        e_val.pack()
        
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10))
        res_label.pack(pady=10)
        
        def calc():
            val = to_decimal(e_val.get())
            rates = {
                "IRRF (1.5%)": Decimal("1.5"),
                "PIS/COFINS/CSLL (4.65%)": Decimal("4.65"),
                "ISS (5.0%)": Decimal("5.0")
            }
            res = withholding_taxes_simulation(val, rates)
            lines = [f"Valor Bruto: {format_currency(res['gross_invoice'])}"]
            for k, v in res['retentions'].items():
                lines.append(f"(-) Retenção {k}: {format_currency(v['value'])}")
            lines.append(f"(=) Total Retido: {format_currency(res['total_retained'])}")
            lines.append(f"(=) Valor Líquido a Pagar: {format_currency(res['net_payable'])}")
            res_label.config(text="\n".join(lines))
            
        ttk.Button(w, text="Simular Retenções", command=calc).pack(pady=6)

    def open_sales_tools(self):
        w = tk.Toplevel(self)
        w.title("Calculadora de Troco & Taxas de Maquininha")
        w.geometry("480x420")
        
        ttk.Label(w, text="Total da Venda (R$):").pack(pady=4)
        e_due = ttk.Entry(w)
        e_due.insert(0, "137.50")
        e_due.pack()
        
        ttk.Label(w, text="Valor Entregue pelo Cliente (R$):").pack(pady=4)
        e_paid = ttk.Entry(w)
        e_paid.insert(0, "200.00")
        e_paid.pack()
        
        res_label = ttk.Label(w, text="", justify="left", font=("Courier", 10))
        res_label.pack(pady=10)
        
        def calc():
            due = to_decimal(e_due.get())
            paid = to_decimal(e_paid.get())
            chg = calculate_change_denominations(due, paid)
            if "error" in chg:
                res_label.config(text=f"Erro: {chg['error']}. Falta: {format_currency(chg['missing'])}")
            else:
                lines = [f"Troco Total: {format_currency(chg['change_amount'])}", "Distribuição ideal de cédulas/moedas:"]
                for b in chg['breakdown']:
                    lines.append(f" - {b['quantity']}x {b['item']}")
                res_label.config(text="\n".join(lines))
                
        ttk.Button(w, text="Calcular Troco Inteligente", command=calc).pack(pady=6)

if __name__ == "__main__":
    app = ProCalcApp()
    app.mainloop()
