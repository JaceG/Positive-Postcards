import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navigation from './components/Navigation/Navigation';
import Footer from './components/Footer/Footer';
import Cart from './components/Cart/Cart';
import Home from './pages/Home/Home';
import Business from './pages/Business/Business';
import Checkout from './pages/Checkout/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess/CheckoutSuccess';
import Login from './pages/Login/Login';
import AuthVerify from './pages/AuthVerify/AuthVerify';
import Dashboard from './pages/Dashboard/Dashboard';
import { initHotjar } from './utils/hotjar';
import './App.css';

function App() {
	// Initialize Hotjar on app load
	useEffect(() => {
		initHotjar();
	}, []);

	return (
		<AuthProvider>
			<CartProvider>
				<Router>
					<Navigation />
					<Cart />
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/business' element={<Business />} />
						<Route path='/checkout' element={<Checkout />} />
						<Route
							path='/checkout/success'
							element={<CheckoutSuccess />}
						/>
						<Route path='/login' element={<Login />} />
						<Route path='/auth/verify' element={<AuthVerify />} />
						<Route path='/dashboard' element={<Dashboard />} />
					</Routes>
					<Footer />
				</Router>
			</CartProvider>
		</AuthProvider>
	);
}

export default App;
