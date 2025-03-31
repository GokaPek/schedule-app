import React, { useState } from 'react';
//import './styles/CustomDropdown.css';

const CustomDropdown = ({ items, selectedItem, onItemSelect, totalPages, currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown">
      {/* Кнопка для открытия/закрытия выпадающего списка */}
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItem || '-- Выберите аудиторию --'}
      </button>

      {/* Выпадающий контент */}
      {isOpen && (
        <div className="dropdown-content">
          {/* Список элементов */}
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  onItemSelect(item.name);
                  setIsOpen(false);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>

          {/* Кнопки пагинации */}
          <div className="pagination-buttons">
            <button
              onClick={() => onPageChange('prev')}
              disabled={currentPage === 0}
            >
              Предыдущая страница
            </button>
            <span>
              Страница {currentPage + 1} из {totalPages}
            </span>
            <button
              onClick={() => onPageChange('next')}
              disabled={currentPage === totalPages - 1}
            >
              Следующая страница
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;