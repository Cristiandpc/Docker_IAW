import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Header from './components/Header';
import Banner from './components/Banner';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api';

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/cms/api/product-categories`);
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to hardcoded categories
      setCategories([
        { id: 'electronica', attributes: { name: 'Electrónica', slug: 'electronica' } },
        { id: 'ropa', attributes: { name: 'Ropa', slug: 'ropa' } },
        { id: 'hogar', attributes: { name: 'Hogar', slug: 'hogar' } }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' 
        ? `${API_URL}/products`
        : `${API_URL}/products?category=${selectedCategory}`;
      
      const response = await axios.get(url);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const placeOrder = async () => {
    try {
      const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
      };

      await axios.post(`${API_URL}/orders`, orderData);
      alert('Orden creada exitosamente');
      setCart([]);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Error al crear la orden');
    }
  };

  return (
    <div className="App">
      <Header 
        cartCount={cart.length}
        totalItems={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <div className="container">
        <Banner />
        
        <div className="categories">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategory === category.attributes.slug ? 'active' : ''}
              onClick={() => setSelectedCategory(category.attributes.slug)}
            >
              {category.attributes.name}
            </button>
          ))}
        </div>

        <div className="main-content">
          <div className="products-section">
            {loading && <p className="loading">Cargando productos...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && products.length === 0 && <p>No hay productos disponibles</p>}
            {!loading && products.length > 0 && (
              <ProductList products={products} onAddToCart={addToCart} />
            )}
          </div>

          <div className="cart-section">
            <Cart 
              items={cart}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onPlaceOrder={placeOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
