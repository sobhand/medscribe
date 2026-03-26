export default function LaudiLogo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo mark — stylized sound wave in a rounded square */}
      <div className={`${s.icon} bg-brand-600 rounded-2xl flex items-center justify-center shadow-sm`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-3/5 h-3/5">
          <rect x="6" y="12" width="3" height="8" rx="1.5" fill="white" opacity="0.7" />
          <rect x="11" y="8" width="3" height="16" rx="1.5" fill="white" opacity="0.85" />
          <rect x="16" y="5" width="3" height="22" rx="1.5" fill="white" />
          <rect x="21" y="8" width="3" height="16" rx="1.5" fill="white" opacity="0.85" />
          <rect x="26" y="12" width="3" height="8" rx="1.5" fill="white" opacity="0.7" />
        </svg>
      </div>
      {showText && (
        <span className={`${s.text} font-bold tracking-tight text-gray-900`}>
          Laudi
        </span>
      )}
    </div>
  );
}
