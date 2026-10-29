// Formatador monetário brasileiro/português
export function formatMoney(val: number, currency: string = 'R$ '): string {
  if (isNaN(val)) return `${currency}0,00`;
  return `${currency}${val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0,00%';
  return `${val.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

// 1. Formação de Preço: Margem Real vs Markup
export function calcPriceFromMargin(cost: number, marginPercent: number) {
  if (marginPercent >= 100) return null;
  const factor = 1 - marginPercent / 100;
  const sellingPrice = cost / factor;
  const grossProfit = sellingPrice - cost;
  const equivalentMarkup = cost > 0 ? (grossProfit / cost) * 100 : 0;
  return { sellingPrice, grossProfit, equivalentMarkup };
}

export function calcPriceFromMarkup(cost: number, markupPercent: number) {
  const sellingPrice = cost * (1 + markupPercent / 100);
  const grossProfit = sellingPrice - cost;
  const effectiveMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  return { sellingPrice, grossProfit, effectiveMargin };
}

// 2. Descontos Sucessivos em Cascata
export function calcCascadeDiscounts(basePrice: number, discounts: number[]) {
  let currentPrice = basePrice;
  const steps = discounts.map((disc) => {
    const discountAmount = currentPrice * (disc / 100);
    currentPrice -= discountAmount;
    return {
      percent: disc,
      discountAmount,
      subtotal: currentPrice,
    };
  });
  const totalDiscount = basePrice - currentPrice;
  const effectivePercent = basePrice > 0 ? (totalDiscount / basePrice) * 100 : 0;
  return {
    finalPrice: currentPrice,
    totalDiscount,
    effectivePercent,
    steps,
  };
}

// 3. Troco Otimizado e Decomposição em Moedas
export function calcOptimalChange(totalDue: number, amountPaid: number) {
  const change = Math.max(0, amountPaid - totalDue);
  let remainingCents = Math.round(change * 100);

  const units: { name: string; value: number; type: 'bill' | 'coin' }[] = [
    { name: 'Cédula R$ 200', value: 20000, type: 'bill' },
    { name: 'Cédula R$ 100', value: 10000, type: 'bill' },
    { name: 'Cédula R$ 50', value: 5000, type: 'bill' },
    { name: 'Cédula R$ 20', value: 2000, type: 'bill' },
    { name: 'Cédula R$ 10', value: 1000, type: 'bill' },
    { name: 'Cédula R$ 5', value: 500, type: 'bill' },
    { name: 'Cédula R$ 2', value: 200, type: 'bill' },
    { name: 'Moeda R$ 1', value: 100, type: 'coin' },
    { name: 'Moeda R$ 0,50', value: 50, type: 'coin' },
    { name: 'Moeda R$ 0,25', value: 25, type: 'coin' },
    { name: 'Moeda R$ 0,10', value: 10, type: 'coin' },
    { name: 'Moeda R$ 0,05', value: 5, type: 'coin' },
    { name: 'Moeda R$ 0,01', value: 1, type: 'coin' },
  ];

  const breakdown = units
    .map((u) => {
      const quantity = Math.floor(remainingCents / u.value);
      if (quantity > 0) {
        remainingCents %= u.value;
        return { ...u, quantity };
      }
      return null;
    })
    .filter(Boolean);

  return {
    change,
    breakdown,
  };
}

// 4. Imposto 'Por Dentro' (Gross-Up) vs 'Por Fora'
export function calcTaxesInsideOutside(amount: number, rate: number) {
  // Por Dentro: Base = Valor / (1 - rate/100)
  const insideTotal = rate < 100 ? amount / (1 - rate / 100) : 0;
  const insideTax = insideTotal - amount;

  // Por Fora: Imposto = Base * (rate/100)
  const outsideTax = amount * (rate / 100);
  const outsideTotal = amount + outsideTax;

  return {
    inside: { total: insideTotal, tax: insideTax, netBase: amount },
    outside: { total: outsideTotal, tax: outsideTax, base: amount },
  };
}

// 5. Títulos Vencidos com Multa e Juros Pro Rata
export function calcLatePayment(principal: number, daysLate: number, finePercent: number, monthlyRate: number) {
  const fineAmount = principal * (finePercent / 100);
  const dailyRate = (monthlyRate / 30) / 100;
  const interestAmount = principal * dailyRate * daysLate;
  const total = principal + fineAmount + interestAmount;
  return { fineAmount, interestAmount, total };
}

// 6. Simulação Price vs SAC (Amortização)
export function calcLoanSimulation(principal: number, annualRate: number, months: number, type: 'price' | 'sac') {
  const i = Math.pow(1 + annualRate / 100, 1 / 12) - 1; // Taxa mensal equivalente
  const schedule = [];
  let balance = principal;

  if (type === 'price') {
    const pmt = (principal * (i * Math.pow(1 + i, months))) / (Math.pow(1 + i, months) - 1);
    let totalInterest = 0;

    for (let m = 1; m <= months; m++) {
      const interest = balance * i;
      const amortization = pmt - interest;
      balance = Math.max(0, balance - amortization);
      totalInterest += interest;
      schedule.push({
        period: m,
        installment: pmt,
        amortization,
        interest,
        balance,
      });
    }
    return {
      firstInstallment: pmt,
      lastInstallment: pmt,
      totalPaid: principal + totalInterest,
      totalInterest,
      schedule,
    };
  } else {
    // SAC: amortização constante
    const amortization = principal / months;
    let totalInterest = 0;
    let totalPaid = 0;
    let firstPmt = 0;
    let lastPmt = 0;

    for (let m = 1; m <= months; m++) {
      const interest = balance * i;
      const pmt = amortization + interest;
      if (m === 1) firstPmt = pmt;
      if (m === months) lastPmt = pmt;
      balance = Math.max(0, balance - amortization);
      totalInterest += interest;
      totalPaid += pmt;
      schedule.push({
        period: m,
        installment: pmt,
        amortization,
        interest,
        balance,
      });
    }
    return {
      firstInstallment: firstPmt,
      lastInstallment: lastPmt,
      totalPaid,
      totalInterest,
      schedule,
    };
  }
}
