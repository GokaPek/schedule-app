import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Учебное расписание</h5>
            <p className="text-muted">Система управления учебным процессом</p>
          </div>
          <div className="col-md-3">
            <h5>Навигация</h5>
            <ul className="list-unstyled">
              <li><a href="/schedule" className="text-decoration-none text-muted">Расписание</a></li>
              <li><a href="/classrooms" className="text-decoration-none text-muted">Аудитории</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Контакты</h5>
            <ul className="list-unstyled text-muted">
              <li><i className="fas fa-envelope me-2"></i> info@university.edu</li>
              <li><i className="fas fa-phone me-2"></i> +7 (123) 456-7890</li>
            </ul>
          </div>
        </div>
        <hr className="my-4 bg-secondary" />
        <div className="text-center text-muted">
          <small>© {new Date().getFullYear()} Университет. Все права защищены.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;