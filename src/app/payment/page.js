'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateOrderId, addOrder, saveOrdersToLocalStorage } from '@/lib/data';

export default function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cartData, setCartData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      router.push('/student/login');
      return;
    }

    // Get and parse cart data
    const cartParam = searchParams.get('cart');
    if (!cartParam) {
      router.push('/menu');
      return;
    }

    try {
      const parsedCart = JSON.parse(decodeURIComponent(cartParam));
      setCartData(parsedCart);
    } catch (err) {
      console.error('Error parsing cart data:', err);
      setError('Invalid cart data');
    }
  }, [searchParams, router]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      if (!cartData) {
        throw new Error('No cart data available');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Group items by stall
      const itemsByStall = cartData.items.reduce((acc, item) => {
        if (!acc[item.stall]) {
          acc[item.stall] = {
            items: [],
            total: 0
          };
        }
        acc[item.stall].items.push(item);
        acc[item.stall].total += item.price * item.quantity;
        return acc;
      }, {});

      // Create separate orders for each stall
      const orders = [];
      for (const [stall, stallData] of Object.entries(itemsByStall)) {
        const order = {
          id: generateOrderId(),
          userId: localStorage.getItem('userId'),
          items: stallData.items,
          total: stallData.total,
          status: 'pending',
          timestamp: new Date().toISOString(),
          stall: stall
        };
        const savedOrder = addOrder(order);
        orders.push(savedOrder);
      }
      
      // Save to localStorage
      saveOrdersToLocalStorage();

      // Clear cart from localStorage
      localStorage.removeItem('cart');

      // Redirect to order tracking with the first order ID
      // (User can view other orders in the orders page)
      router.push(`/track-order?orderId=${orders[0].id}`);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!cartData) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Group items by stall for display
  const itemsByStall = cartData.items.reduce((acc, item) => {
    if (!acc[item.stall]) {
      acc[item.stall] = {
        items: [],
        total: 0
      };
    }
    acc[item.stall].items.push(item);
    acc[item.stall].total += item.price * item.quantity;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white">
            Complete Your Payment
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Your orders will be processed once the payment is complete
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-800 shadow rounded-lg p-6 mb-6 border border-gray-700">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Order Summary</h3>
            {Object.entries(itemsByStall).map(([stall, stallData], index) => (
              <div key={stall} className={index > 0 ? 'mt-6 pt-6 border-t border-gray-700' : ''}>
                <h4 className="text-sm font-medium text-purple-400 mb-3">{stall}</h4>
                <div className="space-y-2">
                  {stallData.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-400">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-300">Stall Total</span>
                      <span className="font-medium text-purple-400">
                        ₹{stallData.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-white">Grand Total</span>
                <span className="font-medium text-purple-400">
                  ₹{cartData.total}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 