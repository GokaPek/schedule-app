import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Проверяем наличие токена

  const handleLogout = () => {
    localStorage.removeItem('token'); // Очистить токен
    navigate('/login'); // Перейти на страницу логина
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="app-header">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-calendar-alt me-2"></i>
            Учебное расписание
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/schedule" activeClassName="active">
                  <i className="fas fa-calendar-week me-1"></i> Расписание
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/classrooms" activeClassName="active">
                  <i className="fas fa-chalkboard-teacher me-1"></i> Аудитории
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/facultys" activeClassName="active">
                  <i className="fas fa-university me-1"></i> Факультеты
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/departments" activeClassName="active">
                  <i className="fas fa-sitemap me-1"></i> Кафедры
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/directions" activeClassName="active">
                  <i className="fas fa-compass me-1"></i> Направления
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/teachers" activeClassName="active">
                  <i className="fas fa-user-graduate me-1"></i> Преподаватели
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/groups" activeClassName="active">
                  <i className="fas fa-users me-1"></i> Группы
                </NavLink>
              </li>
            </ul>
            <div className="d-flex">
              {token ? (
                <>
                  <span className="navbar-text me-3">
                    <i className="fas fa-user-circle me-1"></i> Администратор
                  </span>
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </>
              ) : (
                <button className="btn btn-outline-light btn-sm" onClick={handleLogin}>
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
