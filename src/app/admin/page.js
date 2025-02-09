'use client';

import { useState } from 'react';

// Sample data (replace with actual data from your backend)
const initialOrders = [
  {
    id: 'ORD123456',
    customerName: 'John Doe',
    items: [
      { name: 'Chicken Biryani', quantity: 1, price: 120 },
      { name: 'Veg Club Sandwich', quantity: 2, price: 160 },
    ],
    total: 280,
    status: 'pending',
    timestamp: '2024-01-30T14:30:00Z',
  },
  // Add more orders...
];

const initialInventory = [
  {
    id: 1,
    name: 'Chicken Biryani',
    price: 120,
    stock: 50,
    stall: 'Canteen',
    category: 'Main Course',
  },
  {
    id: 2,
    name: 'Veg Club Sandwich',
    price: 80,
    stock: 30,
    stall: 'Sandwich Stall',
    category: 'Sandwiches',
  },
  // Add more items...
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [editingItem, setEditingItem] = useState(null);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const updateInventoryItem = (itemId, updates) => {
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
    setEditingItem(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Dashboard Header */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={() => {/* Implement logout */}}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'inventory'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Inventory
              </button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {activeTab === 'orders' ? (
              /* Orders Management */
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.items.map((item, index) => (
                              <div key={index}>
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Inventory Management */
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stall
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {editingItem === item.id ? (
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  updateInventoryItem(item.id, { name: e.target.value })
                                }
                                className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              />
                            ) : (
                              item.name
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.stall}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingItem === item.id ? (
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                  updateInventoryItem(item.id, { price: parseInt(e.target.value) })
                                }
                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              />
                            ) : (
                              `₹${item.price}`
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {editingItem === item.id ? (
                              <input
                                type="number"
                                value={item.stock}
                                onChange={(e) =>
                                  updateInventoryItem(item.id, { stock: parseInt(e.target.value) })
                                }
                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              />
                            ) : (
                              item.stock
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingItem === item.id ? (
                              <button
                                onClick={() => setEditingItem(null)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditingItem(item.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 