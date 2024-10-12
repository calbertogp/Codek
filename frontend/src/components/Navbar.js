import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, credits, logout, fetchCredits } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      fetchCredits(user._id);
    }
  }, [isAuthenticated, user, fetchCredits]);

  return (
    <nav className="bg-nav-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-nav-black font-roboto font-extra-bold text-logo tracking-logo uppercase">Kasavas</Link>
        <div>
          {isAuthenticated && (
            <>
              <Link to="/houses" className="text-nav-black mr-4 font-roboto font-bold">Make a Reservation</Link>
              <Link to="/dashboard" className="text-nav-black mr-4 font-roboto font-bold">Your Bookings</Link>
              {user && user.role !== 'admin' && (
                <span className="text-nav-black mr-4 font-roboto font-bold">Credits: {credits !== null ? credits : 'Loading...'}</span>
              )}
              <button onClick={logout} className="text-nav-black font-roboto font-bold">Logout</button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="text-nav-black font-roboto font-bold">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;