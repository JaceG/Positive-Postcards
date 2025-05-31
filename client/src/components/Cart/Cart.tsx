import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { CartItem } from '../../types/cart.types';
import './Cart.css';

const Cart: React.FC = () => {
	const navigate = useNavigate();
	const {
		items,
		removeFromCart,
		updateQuantity,
		getTotalPrice,
		isOpen,
		setIsOpen,
	} = useCart();

	if (!isOpen) return null;

	const formatPrice = (price: number) => {
		return `$${price.toFixed(2)}`;
	};

	const getItemDescription = (item: CartItem) => {
		if (item.type === 'individual') {
			return `${
				item.billingCycle.charAt(0).toUpperCase() +
				item.billingCycle.slice(1)
			} Subscription`;
		} else {
			return `Business Plan - ${item.businessInfo?.tier || 'Custom'} (${
				item.businessInfo?.employeeCount
			} employees)`;
		}
	};

	const handleCheckout = () => {
		setIsOpen(false);
		navigate('/checkout');
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className='cart-backdrop'
				onClick={() => setIsOpen(false)}
				aria-hidden='true'
			/>

			{/* Cart Sidebar */}
			<div
				className='cart-sidebar'
				role='dialog'
				aria-label='Shopping Cart'>
				<div className='cart-header'>
					<h2>Your Cart</h2>
					<button
						className='cart-close'
						onClick={() => setIsOpen(false)}
						aria-label='Close cart'>
						×
					</button>
				</div>

				{items.length === 0 ? (
					<div className='cart-empty'>
						<p>Your cart is empty</p>
						<button
							className='btn btn-primary'
							onClick={() => setIsOpen(false)}>
							Continue Shopping
						</button>
					</div>
				) : (
					<>
						<div className='cart-items'>
							{items.map((item) => (
								<div key={item.id} className='cart-item'>
									<div className='cart-item-info'>
										<h4>{getItemDescription(item)}</h4>
										{item.isGift && (
											<span className='gift-badge'>
												🎁 Gift
											</span>
										)}
										<p className='cart-item-price'>
											{formatPrice(item.price)} /{' '}
											{item.billingCycle}
										</p>
									</div>

									<div className='cart-item-actions'>
										<div className='quantity-controls'>
											<button
												onClick={() =>
													updateQuantity(
														item.id,
														item.quantity - 1
													)
												}
												aria-label='Decrease quantity'>
												-
											</button>
											<span>{item.quantity}</span>
											<button
												onClick={() =>
													updateQuantity(
														item.id,
														item.quantity + 1
													)
												}
												aria-label='Increase quantity'>
												+
											</button>
										</div>
										<button
											className='remove-item'
											onClick={() =>
												removeFromCart(item.id)
											}
											aria-label='Remove item'>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>

						<div className='cart-footer'>
							<div className='cart-total'>
								<span>Total (first payment):</span>
								<span className='total-price'>
									{formatPrice(getTotalPrice())}
								</span>
							</div>
							<button
								className='btn btn-primary btn-lg checkout-btn'
								onClick={handleCheckout}>
								Proceed to Checkout
							</button>
							<p className='cart-note'>
								Subscriptions will renew automatically
							</p>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default Cart;
