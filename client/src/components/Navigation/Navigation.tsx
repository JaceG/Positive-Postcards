import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { setIsOpen, getTotalItems } = useCart();
	const { isAuthenticated } = useAuth();
	const totalItems = getTotalItems();

	const handleSectionNavigation = (sectionId: string) => {
		if (window.location.pathname === '/') {
			const element = document.getElementById(sectionId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		} else {
			navigate(`/#${sectionId}`);
		}
	};

	return (
		<nav
			className={`navigation ${
				location.pathname === '/business' ? 'business-nav' : ''
			}`}>
			<Link to='/' className='logo'>
				<div className='logo-mark'>PP</div>
				<div className='logo-text'>
					Positive <span>Postcards</span>
					{location.pathname === '/business' && (
						<div className='business-indicator'>For Business</div>
					)}
				</div>
			</Link>
			<div className='nav-links'>
				<button
					className='nav-link-btn'
					onClick={() => handleSectionNavigation('how-it-works')}>
					How It Works
				</button>
				<button
					className='nav-link-btn'
					onClick={() => handleSectionNavigation('pricing')}>
					Pricing
				</button>
				<button
					className='nav-link-btn'
					onClick={() => handleSectionNavigation('impact')}>
					Our Impact
				</button>
				<Link
					to='/business'
					className={`nav-link ${
						location.pathname === '/business' ? 'active-page' : ''
					}`}>
					For Business
				</Link>
				{isAuthenticated ? (
					<Link to='/dashboard' className='nav-link'>
						My Account
					</Link>
				) : (
					<Link to='/login' className='nav-link'>
						Login
					</Link>
				)}
				<button
					onClick={() => handleSectionNavigation('pricing')}
					className='gift-nav-btn'>
					🎁 Send as Gift
				</button>
				<button
					className='cart-button'
					onClick={() => setIsOpen(true)}
					aria-label='Open cart'>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'>
						<path d='M9 2L6 7H3l3 13h12l3-13h-3l-3-5M9 2h6l3 5M9 2v5m6-5v5' />
					</svg>
					{totalItems > 0 && (
						<span className='cart-count'>{totalItems}</span>
					)}
				</button>
			</div>
		</nav>
	);
};

export default Navigation;
