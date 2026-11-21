import { usePincodeAutofill } from '../../hooks/usePincodeAutofill';

type Props = {
  value?: string;
  setFieldValue: (field: string, value: any) => void;
  className?: string;
  name?: string;
  cityField?: string;
  stateField?: string;
  countryField?: string;
  placeholder?: string;
  disabled?: boolean;
  hintClassName?: string;
};

/** Formik-friendly pincode input — autofills city/state/country via India Postal API */
export default function PincodeInput({
  value,
  setFieldValue,
  className,
  name = 'pincode',
  cityField = 'city',
  stateField = 'state',
  countryField = 'country',
  placeholder = '6-digit pincode',
  disabled,
  hintClassName,
}: Props) {
  const { status, hint, onPincodeChange } = usePincodeAutofill(setFieldValue, {
    pincode: name,
    city: cityField,
    state: stateField,
    country: countryField,
  });

  return (
    <div className="pincode-input-wrap">
      <input
        type="text"
        name={name}
        className={className}
        inputMode="numeric"
        maxLength={6}
        placeholder={placeholder}
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onPincodeChange(e.target.value)}
        autoComplete="postal-code"
      />
      {hint ? (
        <p
          className={hintClassName || 'pincode-hint'}
          data-status={status}
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.72rem',
            color: status === 'err' ? '#b91c1c' : status === 'ok' ? '#15803d' : '#64748b',
          }}
        >
          {status === 'loading' ? 'Looking up pincode…' : hint}
        </p>
      ) : null}
    </div>
  );
}
