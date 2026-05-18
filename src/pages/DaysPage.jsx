import { useEventContext } from '../context/EventContext.js';
import DayManager from '../components/DayManager.jsx';

export default function DaysPage() {
  const ev = useEventContext();
  return (
    <div className="page">
      <h1 className="page-title">Gérer les jours</h1>
      <DayManager
        days={ev.days}
        onAdd={ev.addDay}
        onUpdate={ev.updateDay}
        onDelete={ev.deleteDay}
      />
    </div>
  );
}
