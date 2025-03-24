import React from 'react';

interface Modifier {
  id: string;
  name: string;
  price: number;
}

interface ModifiersProps {
  modifiers: Modifier[];
  onSelect: (modifier: Modifier) => void;
  selectedModifiers: Modifier[];
  variant?: 'inline' | 'dropdown';
  maxSelection?: number;
}

const Modifiers = ({
  modifiers,
  onSelect,
  selectedModifiers,
  variant = 'inline',
  maxSelection = 3
}: ModifiersProps) => {
  const handleSelect = (modifier: Modifier) => {
    if (selectedModifiers.length < maxSelection) {
      onSelect(modifier);
    }
  };

  return (
    <div className={`modifiers-container ${variant}`}>
      {modifiers && modifiers.length > 0 ? (
        modifiers.map((modifier) => (
          <button
            key={modifier.id}
            onClick={() => handleSelect(modifier)}
            disabled={selectedModifiers.length >= maxSelection}
            className={`modifier-button ${selectedModifiers.includes(modifier) ? 'selected' : ''}`}
          >
            {modifier.name} (+${modifier.price.toFixed(2)})
          </button>
        ))
      ) : (
        <div>No modifiers available</div>
      )}
    </div>
  );
};

export default Modifiers;
