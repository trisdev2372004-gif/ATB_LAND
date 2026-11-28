import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount) {
  const num = Number(amount || 0);
  return `${num.toLocaleString('vi-VN')} đ`;
}

export function formatDateVN(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
}
export function applyProfitMarkup(baseAmount, profitPercent = 0) {
  const cleanBase = Math.max(0, Number(baseAmount || 0));
  const cleanRate = Math.max(0, Math.min(100, Number(profitPercent || 0)));
  const profitAmount = Math.round((cleanBase * cleanRate) / 100);
  const customerPrice = cleanBase + profitAmount;

  return {
    baseAmount: cleanBase,
    profitPercent: cleanRate,
    profitAmount,
    customerPrice,
  };
}