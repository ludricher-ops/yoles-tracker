import { NavLink } from 'react-router-dom';

export default function Nav({ currentPerson, onForget }) {
  return (
    <header className="nav">
      <div className="nav-top">
        <span className="nav-title">⛵ Tour des Yoles</span>
        <span className="nav-person">
          {currentPerson.name} ·{' '}
          <button className="link" onClick={onForget}>changer</button>
        </span>
      </div>
      <div className="nav-links">
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/jours">Jours</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/recap">Récap</NavLink>
      </div>
    </header>
  );
}
