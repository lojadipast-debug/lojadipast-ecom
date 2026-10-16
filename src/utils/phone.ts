export interface CountryDialCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { code: 'PT', dial: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', dial: '+34', name: 'Espanha', flag: '🇪🇸' },
  { code: 'FR', dial: '+33', name: 'França', flag: '🇫🇷' },
  { code: 'DE', dial: '+49', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'GB', dial: '+44', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'IT', dial: '+39', name: 'Itália', flag: '🇮🇹' },
  { code: 'NL', dial: '+31', name: 'Países Baixos', flag: '🇳🇱' },
  { code: 'BR', dial: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', dial: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'AO', dial: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: 'MZ', dial: '+258', name: 'Moçambique', flag: '🇲🇿' },
  { code: 'CV', dial: '+238', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'CH', dial: '+41', name: 'Suíça', flag: '🇨🇭' },
  { code: 'LU', dial: '+352', name: 'Luxemburgo', flag: '🇱🇺' },
  { code: 'BE', dial: '+32', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'IE', dial: '+353', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'CA', dial: '+1', name: 'Canadá', flag: '🇨🇦' },
];

export const OTHER_OPTION = 'other';
export const PHONE_MAX_LENGTH = 9;
const PHONE_MIN_LENGTH = 6;

export const DEFAULT_COUNTRY = COUNTRY_DIAL_CODES[0];

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeDial(value: string): string {
  const digits = value.replace(/[^\d]/g, '');
  return '+' + digits;
}

export function isOtherDial(dial: string): boolean {
  return !COUNTRY_DIAL_CODES.some((c) => c.dial === dial);
}

export function findDialCode(dial: string): CountryDialCode {
  return COUNTRY_DIAL_CODES.find((c) => c.dial === dial) ?? DEFAULT_COUNTRY;
}

export function parseStoredPhone(stored: string): { dial: string; phone: string } {
  const trimmed = (stored ?? '').trim();
  if (!trimmed) return { dial: DEFAULT_COUNTRY.dial, phone: '' };

  const match = trimmed.match(/^(\+\d+)\s*(.*)$/);
  if (match) {
    const dial = match[1];
    const local = match[2].replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);
    return { dial, phone: local };
  }

  const digits = trimmed.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);
  return { dial: DEFAULT_COUNTRY.dial, phone: digits };
}

export function isValidPhone(_dial: string, phone: string): boolean {
  const digits = sanitizePhone(phone);
  return digits.length >= PHONE_MIN_LENGTH && digits.length <= PHONE_MAX_LENGTH;
}
