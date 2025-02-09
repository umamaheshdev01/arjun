'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { syncOrdersWithLocalStorage, getAllOrders } from '@/lib/data';

const orderStatuses = {
  pending: { label: 'Order Pending', color: 'bg-yellow-900/50 text-yellow-200 border-yellow-700' },
  preparing: { label: 'Preparing', color: 'bg-blue-900/50 text-blue-200 border-blue-700' },
  ready: { label: 'Ready for Pickup', color: 'bg-green-900/50 text-green-200 border-green-700' },
  completed: { label: 'Completed', color: 'bg-gray-900/50 text-gray-200 border-gray-700' },
};

export default function TrackOrder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      router.push('/student/login');
      return;
    }

    // Get order ID from URL params
    const orderId = searchParams.get('orderId');
    if (orderId) {
      // Sync orders from localStorage first
      syncOrdersWithLocalStorage();
      // Then find the order
      const foundOrder = getAllOrders().find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }

    // Listen for order updates
    const handleStorageChange = (e) => {
      if (e.key === 'orders') {
        const orderId = searchParams.get('orderId');
        if (orderId) {
          syncOrdersWithLocalStorage();
          const updatedOrder = getAllOrders().find(o => o.id === orderId);
          if (updatedOrder) {
            setOrder(updatedOrder);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, searchParams]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Track Your Order</h1>

        {error && (
          <div className="mb-8 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Order #{order.id}</h2>
                <p className="text-sm text-gray-400">{formatDate(order.timestamp)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-400">{order.stall}</p>
                <p className="text-lg font-semibold text-purple-400">₹{order.total}</p>
              </div>
            </div>

            {/* Order Status */}
            <div className="mb-6">
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  {Object.keys(orderStatuses).map((status, index) => {
                    const isActive = Object.keys(orderStatuses).indexOf(order.status) >= index;
                    return (
                      <div
                        key={status}
                        className={`${
                          isActive ? status === 'completed' ? 'bg-gray-400' : 'bg-purple-400' : 'bg-gray-700'
                        } transition-all duration-500 w-1/4`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  {Object.keys(orderStatuses).map((status) => (
                    <div
                      key={status}
                      className={`text-xs ${
                        status === order.status
                          ? orderStatuses[status].color
                          : 'text-gray-400'
                      }`}
                    >
                      {orderStatuses[status].label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-white mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="text-gray-300">
                      <span className="font-medium">{item.quantity}x</span>{' '}
                      {item.name}
                    </div>
                    <div className="text-gray-400">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'completed' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/menu')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Order Again
                </button>
              </div>
            )}
          </div>
        )}

        {!order && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading order details...</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/orders')}
            className="text-sm text-gray-400 hover:text-purple-400"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
} 