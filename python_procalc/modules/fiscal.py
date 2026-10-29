"""
Módulo de Cálculos Contábeis e Fiscais (Python ProCalc)
Rotinas especializadas para contadores, peritos e analistas fiscais.
"""
from decimal import Decimal
from typing import Dict, List
from core.money import to_decimal, round_money

def tax_inside_gross_up(net_amount: Decimal, tax_rates: List[Decimal]) -> Dict[str, object]:
    """
    Cálculo de imposto 'por dentro' (gross-up).
    Muito utilizado em ICMS, ISS e impostos indiretos onde o tributo integra sua própria base.
    Fórmula: Total = Valor_Líquido / (1 - Soma_Alíquotas)
    """
    net = to_decimal(net_amount)
    total_rate = sum([to_decimal(r) for r in tax_rates])
    if total_rate >= 100:
        raise ValueError("A soma das alíquotas por dentro deve ser inferior a 100%.")
    
    factor = Decimal("1") - (total_rate / Decimal("100"))
    gross_total = round_money(net / factor)
    tax_total = gross_total - net
    
    breakdown = []
    for r in tax_rates:
        rate_d = to_decimal(r)
        tax_part = round_money(gross_total * (rate_d / Decimal("100")))
        breakdown.append({"rate": rate_d, "tax_value": tax_part})
        
    return {
        "net_base": net,
        "total_tax_rate": total_rate,
        "gross_invoice_total": gross_total,
        "total_tax": tax_total,
        "breakdown": breakdown
    }

def tax_outside(base_amount: Decimal, tax_rate: Decimal) -> Dict[str, Decimal]:
    """
    Cálculo de imposto 'por fora' (adicional simples sobre a base).
    Fórmula: Imposto = Base * (Alíquota / 100), Total = Base + Imposto.
    """
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
    """
    Simulação de retenções na fonte (IRRF, PIS, COFINS, CSLL, ISS, INSS).
    Calcula deduções retidas e o valor líquido a creditar para o prestador.
    """
    gross = to_decimal(invoice_value)
    retentions = {}
    total_retained = Decimal("0")
    
    for tax_name, rate in rates.items():
        rate_d = to_decimal(rate)
        val = round_money(gross * (rate_d / Decimal("100")))
        retentions[tax_name] = {"rate": rate_d, "value": val}
        total_retained += val
        
    net_payable = gross - total_retained
    return {
        "gross_invoice": gross,
        "total_retained": total_retained,
        "net_payable": net_payable,
        "retentions": retentions
    }

def calculate_late_dues(original_amount: Decimal, days_late: int, fine_percent: Decimal, monthly_interest: Decimal) -> Dict[str, Decimal]:
    """
    Cálculo de títulos em atraso com multa moratória fixa e juros de mora diários (pro rata die).
    """
    val = to_decimal(original_amount)
    fine_pct = to_decimal(fine_percent)
    fine_val = round_money(val * (fine_pct / Decimal("100")))
    
    # Juros pro rata diário a partir da taxa mensal (30 dias padrão comercial)
    monthly_d = to_decimal(monthly_interest)
    daily_interest_rate = (monthly_d / Decimal("30")) / Decimal("100")
    interest_val = round_money(val * daily_interest_rate * Decimal(str(days_late)))
    
    total_due = val + fine_val + interest_val
    return {
        "original_amount": val,
        "days_late": days_late,
        "fine_amount": fine_val,
        "interest_amount": interest_val,
        "total_to_pay": total_due
    }

def linear_depreciation(asset_cost: Decimal, salvage_value: Decimal, useful_years: int) -> Dict[str, Decimal]:
    """
    Calcula a depreciação contábil linear anual e mensal de imobilizado.
    """
    cost = to_decimal(asset_cost)
    salvage = to_decimal(salvage_value)
    depreciable_base = cost - salvage
    years_d = Decimal(str(useful_years))
    
    annual_depreciation = round_money(depreciable_base / years_d)
    monthly_depreciation = round_money(annual_depreciation / Decimal("12"))
    annual_rate = round_money((Decimal("100") / years_d))
    
    return {
        "asset_cost": cost,
        "salvage_value": salvage,
        "depreciable_base": depreciable_base,
        "useful_years": useful_years,
        "annual_rate_percent": annual_rate,
        "annual_depreciation": annual_depreciation,
        "monthly_depreciation": monthly_depreciation
    }
