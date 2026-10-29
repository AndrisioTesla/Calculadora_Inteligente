"""
Módulo de Fita de Auditoria Contínua (Digital Paper Tape)
Permite salvar passos de cálculo, editar entradas passadas e exportar relatórios.
"""
from dataclasses import dataclass, asdict
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
import csv
import io
from core.money import to_decimal, round_money, format_currency

@dataclass
class TapeItem:
    id: int
    timestamp: str
    operation: str  # '+', '-', '*', '/', '=', 'MARKUP', 'MARGIN', 'TAX', etc.
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
        
        if operation == "+":
            self.running_total += val_d
        elif operation == "-":
            self.running_total -= val_d
        elif operation == "*":
            self.running_total *= val_d
        elif operation == "/":
            if val_d != 0:
                self.running_total /= val_d
        elif operation == "=" or operation == "SET":
            self.running_total = val_d
            
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

    def update_note(self, item_id: int, new_note: str) -> bool:
        for it in self.items:
            if it.id == item_id:
                it.note = new_note
                return True
        return False

    def clear(self):
        self.items.clear()
        self.running_total = Decimal("0")

    def export_csv(self) -> str:
        """Gera conteúdo CSV formatado para abertura no Excel ou planilhas."""
        output = io.StringIO()
        writer = csv.writer(output, delimiter=";")
        writer.writerow(["ID", "Hora", "Operação", "Valor", "Subtotal Acumulado", "Anotação/Rótulo"])
        for it in self.items:
            writer.writerow([
                it.id,
                it.timestamp,
                it.operation,
                str(it.value).replace(".", ","),
                str(it.subtotal).replace(".", ","),
                it.note
            ])
        return output.getvalue()
