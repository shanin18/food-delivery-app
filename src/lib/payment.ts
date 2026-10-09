export type PaymentMethod = 'Cash' | 'Visa' | 'Mastercard' | 'PayPal';
export type DemoCard = { id: string; brand: 'Visa' | 'Mastercard'; last4: string; holder: string };

export function validateDemoCard(holder: string, number: string, expiry: string, cvc: string, now = new Date()): DemoCard {
  const digits = number.replace(/\s/g, '');
  if (!holder.trim()) throw new Error('Enter the card holder name.');
  if (digits !== '4242424242424242' && digits !== '5555555555554444') throw new Error('Use test Visa 4242 4242 4242 4242 or Mastercard 5555 5555 5555 4444. Do not enter a real card.');
  const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) throw new Error('Enter the expiry date as MM/YY.');
  const month = Number(match[1]);
  const year = Number(match[2]) + (match[2].length === 2 ? 2000 : 0);
  if (month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) throw new Error('Enter a valid future expiry date.');
  if (!/^\d{3}$/.test(cvc)) throw new Error('Enter a three-digit CVC.');
  return { id: digits[0] === '4' ? 'demo-visa' : 'demo-mastercard', brand: digits[0] === '4' ? 'Visa' : 'Mastercard', last4: digits.slice(-4), holder: holder.trim() };
}
