export default function Select({ 
  label, 
  error, 
  required = false,
  helper,
  className = '',
  children,
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2
          border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
          transition-all duration-200
          bg-white
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}
