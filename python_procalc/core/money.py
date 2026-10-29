"""
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
        # Formato 1.234,56 -> 1234.56
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
