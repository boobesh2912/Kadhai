export default function ChoiceStep({ title, options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`} role="radiogroup" aria-label={title}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`select-option ${value === option.value ? 'selected' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
