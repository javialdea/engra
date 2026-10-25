import { useUi } from '../ui/UiContext.jsx';
import Confetti from './Confetti.jsx';
import Medallion from './Medallion.jsx';

export default function Toasts() {
  const { toasts, confetti } = useUi();
  return (
    <>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.mood}`} role="status">
            <Medallion mood={t.mood} size={44} />
            <p>{t.text}</p>
          </div>
        ))}
      </div>
      {confetti > 0 && <Confetti key={confetti} />}
    </>
  );
}
