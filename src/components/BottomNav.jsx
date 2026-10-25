const TABS = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠' },
  { id: 'goals', label: 'Objetivos', icon: '🎯' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav__item ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
