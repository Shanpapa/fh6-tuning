export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-mid text-sm mb-1.5">{label}</label>
      )}
      <input
        className={`
          w-full bg-surf2 border rounded-lg px-4 py-2.5 text-text text-base
          focus:outline-none focus:border-borderHi placeholder:text-dim
          transition-colors
          ${error ? 'border-red' : 'border-border'}
        `}
        {...props}
      />
      {error && (
        <p className="text-red text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
