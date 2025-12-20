import { z } from 'zod';

// Validação de telefone brasileiro
const phoneRegex = /^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/;

export const buyerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .trim()
    .email('E-mail inválido')
    .max(255, 'E-mail muito longo'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Telefone inválido. Use o formato (11) 99999-9999')
    .transform((val) => val.replace(/\D/g, '')),
});

export type BuyerFormData = z.infer<typeof buyerSchema>;

// Formatar telefone para exibição
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// Formatar valor em reais
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatar número da rifa com zeros à esquerda
export function formatRaffleNumber(num: number, totalDigits: number = 5): string {
  return num.toString().padStart(totalDigits, '0');
}
