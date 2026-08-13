import { useMemo } from 'react';
import {
  COUNTRY_DIAL_CODES,
  OTHER_OPTION,
  PHONE_MAX_LENGTH,
  isOtherDial,
  sanitizePhone,
  sanitizeDial,
} from '@/utils/phone';

interface PhoneInputProps {
  label: string;
  dialCode: string;
  onDialCodeChange: (dial: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  label,
  dialCode,
  onDialCodeChange,
  phone,
  onPhoneChange,
  placeholder = '912 345 678',
  required,
  className = '',
}: PhoneInputProps) {
  const isOther = useMemo(() => isOtherDial(dialCode), [dialCode]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = sanitizePhone(e.target.value).slice(0, PHONE_MAX_LENGTH);
    onPhoneChange(digits);
  };

  const handleCustomDialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDialCodeChange(sanitizeDial(e.target.value));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onDialCodeChange(val === OTHER_OPTION ? '+' : val);
  };

  const selectClass =
    'input-field cursor-pointer appearance-none bg-[right_0.5rem_center] bg-no-repeat pr-8 text-sm font-semibold';
  const chevronStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
  };

  return (
    <div className={className}>
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}{required ? ' *' : ''}
      </span>
      <div className="mt-1.5 flex gap-2">
        <select
          className={`${selectClass} w-28 shrink-0`}
          style={chevronStyle}
          value={isOther ? OTHER_OPTION : dialCode}
          onChange={handleSelectChange}
          aria-label="Indicativo do país"
        >
          {COUNTRY_DIAL_CODES.map((c) => (
            <option key={`${c.dial}-${c.code}`} value={c.dial}>
              {c.flag} {c.dial}
            </option>
          ))}
          <option value={OTHER_OPTION}>🌐 Other</option>
        </select>
        {isOther ? (
          <input
            type="text"
            inputMode="tel"
            className="input-field w-24 shrink-0 text-sm font-semibold"
            value={dialCode}
            onChange={handleCustomDialChange}
            placeholder="+"
            maxLength={6}
            aria-label="Indicativo personalizado"
          />
        ) : null}
        <input
          type="tel"
          inputMode="numeric"
          className="input-field flex-1"
          value={phone}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          maxLength={PHONE_MAX_LENGTH}
          required={required}
        />
      </div>
    </div>
  );
}
