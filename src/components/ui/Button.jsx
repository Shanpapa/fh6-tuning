const variants = {
  primary:   'bg-accent text-white hover:bg-orange-500',
  secondary: 'bg-surf2 text-text border border-border hover:border-borderHi hover:bg-surf3',
  ghost:     'text-mid hover:text-text hover:bg-surf3',
  danger:    'bg-red/10 text-red border border-red/20 hover:bg-red/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
