'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { menuItems, getOrdersByStall, updateOrderStatus, syncOrdersWithLocalStorage, saveOrdersToLocalStorage } from '@/lib/data';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [adminStall, setAdminStall] = useState('');

  useEffect(() => {
    // Check if user is logged in and is admin
    const sessionId = localStorage.getItem('sessionId');
    const userRole = localStorage.getItem('userRole');
    const stall = localStorage.getItem('adminStall');
    
    if (!sessionId || userRole !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    setAdminStall(stall);

    // Sync orders from localStorage first
    syncOrdersWithLocalStorage();

    // Then filter orders for this stall
    const stallOrders = getOrdersByStall(stall);
    const stallInventory = menuItems.filter(item => item.stall === stall);
    
    setOrders(stallOrders);
    setInventory(stallInventory);

    // Listen for order updates
    const handleStorageChange = (e) => {
      if (e.key === 'orders') {
        syncOrdersWithLocalStorage();
        const updatedStallOrders = getOrdersByStall(stall);
        setOrders(updatedStallOrders);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOrderStatus = (orderId, newStatus) => {
    const updatedOrder = updateOrderStatus(orderId, newStatus);
    if (updatedOrder) {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
      // Save changes to localStorage
      saveOrdersToLocalStorage();
      showToastMessage(`Order ${orderId} status updated to ${newStatus}`);
    }
  };

  const updateInventoryItem = (itemId, updates) => {
    // Update local state
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, ...updates }
          : item
      )
    );

    // Update main data in localStorage
    const updatedMenuItems = menuItems.map(item =>
      item.id === itemId
        ? { ...item, ...updates }
        : item
    );
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
    
    showToastMessage('Item updated successfully!');
  };

  const handleRestock = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const newStock = item.stock + 10;
      updateInventoryItem(itemId, { stock: newStock });
      showToastMessage(`Successfully restocked ${item.name}! New stock: ${newStock}`);
    }
  };

  if (!adminStall) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{adminStall} Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Total Orders Today</h3>
            <p className="text-3xl font-bold text-purple-400">
              {orders.filter(order => {
                const orderDate = new Date(order.timestamp);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Pending Orders</h3>
            <p className="text-3xl font-bold text-purple-400">
              {orders.filter(order => order.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Total Revenue Today</h3>
            <p className="text-3xl font-bold text-purple-400">
              ₹{orders
                .filter(order => {
                  const orderDate = new Date(order.timestamp);
                  const today = new Date();
                  return orderDate.toDateString() === today.toDateString();
                })
                .reduce((total, order) => total + order.total, 0)
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-purple-400 text-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'inventory'
                    ? 'border-b-2 border-purple-400 text-purple-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Inventory
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'orders' ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">{order.id}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                        className="rounded-md border-gray-700 bg-gray-800 text-white text-sm focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-300">
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                      <span className="font-medium text-gray-300">Total</span>
                      <span className="font-medium text-purple-400">₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400">Stock: {item.stock}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Price:</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateInventoryItem(item.id, { price: parseInt(e.target.value) })}
                          className="w-20 rounded-md border-gray-700 bg-gray-800 text-white text-sm focus:ring-purple-500 focus:border-purple-500 px-4 py-3"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Stock:</span>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateInventoryItem(item.id, { stock: parseInt(e.target.value) })}
                          className="w-20 rounded-md border-gray-700 bg-gray-800 text-white text-sm focus:ring-purple-500 focus:border-purple-500 px-4 py-3"
                        />
                      </div>
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
} 