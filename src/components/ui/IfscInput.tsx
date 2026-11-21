import { useIfscAutofill } from '../../hooks/useIfscAutofill';

type Props = {
  value?: string;
  setFieldValue: (field: string, value: any) => void;
  className?: string;
  name?: string;
  bankNameField?: string;
  branchField?: string;
  addressField?: string;
  placeholder?: string;
  disabled?: boolean;
  hintClassName?: string;
};

/** Formik-friendly IFSC input — autofills bank name / branch / address via Razorpay IFSC API */
export default function IfscInput({
  value,
  setFieldValue,
  className,
  name = 'ifsc_code',
  bankNameField = 'bank_name',
  branchField = 'bank_branch',
  addressField = 'bank_address',
  placeholder = 'SBIN0001234',
  disabled,
  hintClassName,
}: Props) {
  const { status, hint, onIfscChange } = useIfscAutofill(setFieldValue, {
    ifsc: name,
    bankName: bankNameField,
    branch: branchField,
    address: addressField,
  });

  return (
    <div className="ifsc-input-wrap">
      <input
        type="text"
        name={name}
        className={className}
        maxLength={11}
        placeholder={placeholder}
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onIfscChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        style={{ textTransform: 'uppercase' }}
      />
      {hint ? (
        <p
          className={hintClassName || 'ifsc-hint'}
          data-status={status}
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.72rem',
            color: status === 'err' ? '#b91c1c' : status === 'ok' ? '#15803d' : '#64748b',
          }}
        >
          {status === 'loading' ? 'Looking up IFSC…' : hint}
        </p>
      ) : null}
    </div>
  );
}
