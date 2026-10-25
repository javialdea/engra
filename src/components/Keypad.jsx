import Icon from './Icon.jsx';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'back'];

export default function Keypad({ onKey }) {
  return (
    <div className="keypad" role="group" aria-label="Teclado numérico">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className={`keypad__key ${k === 'back' ? 'keypad__key--back' : ''}`}
          onClick={() => onKey(k)}
          aria-label={k === 'back' ? 'Borrar' : k === ',' ? 'Coma decimal' : k}
        >
          {k === 'back' ? <Icon name="backspace" size={24} weight="bold" /> : k}
        </button>
      ))}
    </div>
  );
}
