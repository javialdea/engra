import Icon from './Icon.jsx';

const LEFT = [
  { id: 'home', label: 'Inicio', icon: 'chart' },
  { id: 'expenses', label: 'Gastos', icon: 'receipt' },
];
const RIGHT = [
  { id: 'goals', label: 'Objetivos', icon: 'target' },
  { id: 'settings', label: 'Ajustes', icon: 'gear' },
];

function Tab({ item, active, onTab }) {
  return (
    <button className={`nav__tab ${active ? 'is-active' : ''}`} onClick={() => onTab(item.id)} aria-current={active ? 'page' : undefined}>
      <Icon name={item.icon} size={24} weight={active ? 'fill' : 'regular'} />
      <span>{item.label}</span>
    </button>
  );
}

export default function BottomNav({ tab, onTab, onAdd }) {
  return (
    <nav className="nav" aria-label="Navegación principal">
      {LEFT.map((item) => (
        <Tab key={item.id} item={item} active={tab === item.id} onTab={onTab} />
      ))}
      <button className="nav__add" onClick={onAdd} aria-label="Añadir gasto">
        <Icon name="plus" size={28} weight="bold" />
      </button>
      {RIGHT.map((item) => (
        <Tab key={item.id} item={item} active={tab === item.id} onTab={onTab} />
      ))}
    </nav>
  );
}
