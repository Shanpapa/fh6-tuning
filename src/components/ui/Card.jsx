export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-surf border border-border rounded-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
