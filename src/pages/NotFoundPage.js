import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1 text-danger">404</h1>
      <h2 className="mb-4">Страница не найдена</h2>
      <p className="lead">Извините, запрашиваемая страница не существует.</p>
      <Link to="/" className="btn btn-primary">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;