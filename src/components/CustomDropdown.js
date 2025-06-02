import React, { useState } from 'react';

interface DropdownItem {
  id: number;
  name: string;
  type?: string; // тип аудитории: "LECTURE", "LAB" и т.д.
}

interface CustomDropdownProps {
  items: DropdownItem[];
  selectedItem: string | null;
  onItemSelect: (item: DropdownItem) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (direction: 'prev' | 'next') => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  items,
  selectedItem,
  onItemSelect,
  totalPages,
  currentPage,
  onPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="custom-dropdown">
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItem ? selectedItem : '-- Выберите аудиторию --'}
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  onItemSelect(item);
                  setIsOpen(false);
                }}
              >
                {item.name} — {item.type || 'Не указано'}
              </li>
            ))}
          </ul>

          <div className="pagination-buttons">
            <button onClick={() => onPageChange('prev')} disabled={currentPage === 0}>
              Предыдущая
            </button>
            <span>Страница {currentPage + 1} из {totalPages}</span>
            <button onClick={() => onPageChange('next')} disabled={currentPage === totalPages - 1}>
              Следующая
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;