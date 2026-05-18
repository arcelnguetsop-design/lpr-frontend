const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default    : 'bg-gray-100 text-gray-700',
    success    : 'bg-green-100 text-green-700',
    warning    : 'bg-amber-100 text-amber-700',
    danger     : 'bg-red-100 text-red-700',
    info       : 'bg-blue-100 text-blue-700',
    actif      : 'bg-green-100 text-green-700',
    en_attente : 'bg-amber-100 text-amber-700',
    inactif    : 'bg-gray-100 text-gray-600',
    archive    : 'bg-red-100 text-red-700',
    paye       : 'bg-green-100 text-green-700',
    partiel    : 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

export default Badge;