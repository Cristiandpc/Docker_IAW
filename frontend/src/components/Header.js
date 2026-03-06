import React from 'react';
import './Header.css';

function Header({ cartCount, totalItems }) {
  return (
    <header className="header">
      <div className="header-container">
        <h1>🛍️ Tienda Reactiva</h1>
        <div className="header-info">
          <span className="cart-info">
            🛒 Carrito: {cartCount} artículos ({totalItems} unidades)
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
