'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { menuItems } from '@/lib/data';

export default function Menu() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      router.push('/student/login');
      return;
    }

    const cartData = {
      items: cart,
      total: getTotalPrice()
    };

    // Redirect to payment page with cart data
    router.push(`/payment?cart=${encodeURIComponent(JSON.stringify(cartData))}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Menu</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-700 bg-gray-800 text-white focus:ring-purple-500 focus:border-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="rounded-md border-gray-700 bg-gray-800 text-white focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
              <div className="relative h-48">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.stall}</p>
                  </div>
                  <span className="text-lg font-bold text-purple-400">₹{item.price}</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Stock: {item.stock}
                  </span>
                  {cart.find(cartItem => cartItem.id === item.id) ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="text-white">
                        {cart.find(cartItem => cartItem.id === item.id).quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-purple-600 text-white p-1 rounded-md hover:bg-purple-700"
                        disabled={item.stock <= cart.find(cartItem => cartItem.id === item.id).quantity}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.stock === 0}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-lg border-t border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-white">
                  {cart.reduce((total, item) => total + item.quantity, 0)} items
                </p>
                <p className="text-2xl font-bold text-purple-400">₹{getTotalPrice()}</p>
              </div>
              <button
                onClick={handleCheckout}
                className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 