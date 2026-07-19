export default function Card({ 
  children, 
  title, 
  description, 
  icon: Icon,
  action,
  className = '',
  padding = 'md' 
}) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`
      bg-white rounded-2xl
      border border-gray-200
      shadow-sm
      ${paddings[padding]}
      ${className}
    `}>
      {(title || description || Icon || action) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 bg-gray-50 rounded-lg">
                <Icon size={20} className="text-gray-600" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
              {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
