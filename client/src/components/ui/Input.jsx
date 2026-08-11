/**
 * The checkout field from Figma (40:159): 64px tall, 13px label stacked above an
 * 18px value, 18px horizontal padding, hairline border.
 */
export default function Input({ label, error, className = '', id, ...props }) {
  const fieldId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative h-[64px] w-full rounded-[8px] border px-[18px] pt-[14px] transition-colors ${
          error ? 'border-red-500' : 'border-current/20 focus-within:border-green'
        }`}
      >
        {label && (
          <label htmlFor={fieldId} className="block text-[13px] leading-none opacity-60">
            {label}
          </label>
        )}
        <input
          id={fieldId}
          className="mt-[4px] w-full bg-transparent text-[18px] leading-[22px] outline-none placeholder:opacity-30"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-2 text-[13px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
