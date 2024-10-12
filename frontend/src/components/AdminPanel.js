import React, { useState } from 'react';
import AdminHouses from './AdminHouses';
import AdminUsers from './AdminUsers';
import AdminBookings from './AdminBookings';
import AdminUserCredits from './AdminUserCredits';
import AddUserForm from './AddUserForm';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('houses');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [newHouse, setNewHouse] = useState({ name: '', description: '' });

  const handleUserAdded = (newUser) => {
    // You might want to refresh the user list here
    setShowAddUser(false);
  };

  const handleNewHouseChange = (e) => {
    setNewHouse({ ...newHouse, [e.target.name]: e.target.value });
  };

  const addHouse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/houses', newHouse);
      setNewHouse({ name: '', description: '' });
      setShowAddHouse(false);
      // Refresh the house list
      setActiveTab('houses');
    } catch (error) {
      console.error('Error adding house:', error);
      alert('Failed to add house. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 ${activeTab === 'houses' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('houses')}
        >
          Houses
        </button>
        <button
          className={`mr-2 px-4 py-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`mr-2 px-4 py-2 ${activeTab === 'bookings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'credits' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('credits')}
        >
          User Credits
        </button>
      </div>
      {activeTab === 'houses' && (
        <div>
          <button
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setShowAddHouse(!showAddHouse)}
          >
            {showAddHouse ? 'Cancel' : 'Add New House'}
          </button>
          {showAddHouse && (
            <form onSubmit={addHouse} className="mb-4">
              <input
                type="text"
                name="name"
                value={newHouse.name}
                onChange={handleNewHouseChange}
                placeholder="House Name"
                className="mr-2 p-2 border rounded"
                required
              />
              <input
                type="text"
                name="description"
                value={newHouse.description}
                onChange={handleNewHouseChange}
                placeholder="Description"
                className="mr-2 p-2 border rounded"
                required
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Add House
              </button>
            </form>
          )}
          <AdminHouses />
        </div>
      )}
      {activeTab === 'users' && (
        <div>
          <button
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setShowAddUser(true)}
          >
            Add New User
          </button>
          <AdminUsers />
        </div>
      )}
      {activeTab === 'bookings' && <AdminBookings />}
      {activeTab === 'credits' && <AdminUserCredits />}
      {showAddUser && <AddUserForm onClose={() => setShowAddUser(false)} onUserAdded={handleUserAdded} />}
    </div>
  );
};

export default AdminPanel;