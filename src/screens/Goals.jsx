import { useState } from 'react';
import BudgetsPanel from '../components/BudgetsPanel';
import SavingsPanel from '../components/SavingsPanel';

export default function Goals({ refreshKey, onChanged }) {
  const [tab, setTab] = useState('spending');

  return (
    <div className="screen goals">
      <div className="goals__tabs">
        <button className={tab === 'spending' ? 'is-active' : ''} onClick={() => setTab('spending')}>
          Gasto
        </button>
        <button className={tab === 'savings' ? 'is-active' : ''} onClick={() => setTab('savings')}>
          Ahorro
        </button>
      </div>
      {tab === 'spending' ? (
        <BudgetsPanel refreshKey={refreshKey} onChanged={onChanged} />
      ) : (
        <SavingsPanel refreshKey={refreshKey} onChanged={onChanged} />
      )}
    </div>
  );
}
