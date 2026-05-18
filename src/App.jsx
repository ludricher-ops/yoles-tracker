import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEvent } from './hooks/useEvent.js';
import { EventContext } from './context/EventContext.js';
import NamePicker from './components/NamePicker.jsx';
import Nav from './components/Nav.jsx';
import HomePage from './pages/HomePage.jsx';
import DaysPage from './pages/DaysPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import RecapPage from './pages/RecapPage.jsx';
import PeoplePage from './pages/PeoplePage.jsx';

const STORAGE_KEY = 'yoles_person_id';

export default function App() {
  const ev = useEvent();
  const [personId, setPersonId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  const choosePerson = (id) => {
    localStorage.setItem(STORAGE_KEY, String(id));
    setPersonId(id);
  };
  const forgetPerson = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPersonId(null);
  };

  if (ev.loading) return <div className="screen-msg">Chargement…</div>;
  if (ev.error) return <div className="screen-msg error">Erreur : {ev.error}</div>;

  const currentPerson = ev.people.find(p => p.id === personId) || null;

  if (!currentPerson) {
    return (
      <NamePicker
        people={ev.people}
        onPick={choosePerson}
        onAdd={async (name) => {
          const person = await ev.addPerson(name);
          choosePerson(person.id);
        }}
      />
    );
  }

  const isAdmin = !!currentPerson.is_admin;
  const AdminOnly = ({ element }) => isAdmin ? element : <Navigate to="/" replace />;

  return (
    <EventContext.Provider value={ev}>
      <BrowserRouter>
        <Nav currentPerson={currentPerson} onForget={forgetPerson} isAdmin={isAdmin} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage currentPerson={currentPerson} />} />
            <Route path="/jours"   element={<AdminOnly element={<DaysPage />} />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/recap"   element={<RecapPage />} />
            <Route path="/equipe"  element={<AdminOnly element={<PeoplePage />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </EventContext.Provider>
  );
}
