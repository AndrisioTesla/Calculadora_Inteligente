"""
Módulo de Cálculos Comerciais e Vendas (Python ProCalc)
Contém as regras de negócio para vendedores e gestores de preço.
"""
from decimal import Decimal
from typing import List, Dict, Tuple
from core.money import to_decimal, round_money, format_currency

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
    Exemplo: R$ 1.000 com 10% + 5% sucessivos não é 15% (R$ 850), e sim R$ 855.
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

def calculate_card_net(sale_amount: Decimal, fee_percent: Decimal, fixed_fee: Decimal = Decimal("0")) -> Dict[str, Decimal]:
    """
    Calcula o valor líquido recebido pela empresa após taxas de cartão de débito/crédito.
    """
    amount = to_decimal(sale_amount)
    pct = to_decimal(fee_percent)
    fixed = to_decimal(fixed_fee)
    fee_val = round_money((amount * (pct / Decimal("100"))) + fixed)
    net_val = amount - fee_val
    return {
        "sale_amount": amount,
        "fee_percent": pct,
        "fee_amount": fee_val,
        "net_received": net_val
    }

def calculate_change_denominations(total_due: Decimal, amount_paid: Decimal) -> Dict[str, object]:
    """
    Calcula o troco exato e a distribuição mais eficiente de cédulas e moedas.
    """
    due = to_decimal(total_due)
    paid = to_decimal(amount_paid)
    if paid < due:
        return {"error": "Valor pago insuficiente", "missing": due - paid}
    
    change_total = paid - due
    cents = int(round(change_total * 100))
    denominations = [
        ("Cédula R$ 200", 20000),
        ("Cédula R$ 100", 10000),
        ("Cédula R$ 50", 5000),
        ("Cédula R$ 20", 2000),
        ("Cédula R$ 10", 1000),
        ("Cédula R$ 5", 500),
        ("Cédula R$ 2", 200),
        ("Moeda R$ 1", 100),
        ("Moeda R$ 0,50", 50),
        ("Moeda R$ 0,25", 25),
        ("Moeda R$ 0,10", 10),
        ("Moeda R$ 0,05", 5),
        ("Moeda R$ 0,01", 1),
    ]
    breakdown = []
    rem = cents
    for name, value in denominations:
        count = rem // value
        if count > 0:
            breakdown.append({"item": name, "quantity": count})
            rem %= value
            
    return {
        "total_due": due,
        "amount_paid": paid,
        "change_amount": change_total,
        "breakdown": breakdown
    }
