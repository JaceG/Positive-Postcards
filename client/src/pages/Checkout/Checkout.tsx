import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
	Elements,
	CardElement,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext';
import { paymentAPI } from '../../utils/api';
import { RecipientInfo, CartItem } from '../../types/cart.types';
import { isTestMode } from '../../config/stripe';
import { hotjarEvent } from '../../utils/hotjar';
import AddressAutocomplete from '../../components/AddressAutocomplete/AddressAutocomplete';
import UpsellModal from '../../components/UpsellModal/UpsellModal';
import DownsellModal from '../../components/DownsellModal/DownsellModal';
import './Checkout.css';

// Load Stripe
const stripePromise = loadStripe(
	process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || ''
);

// Add OrderSummary component before CheckoutForm
const OrderSummary: React.FC<{
	items: CartItem[];
	total: number;
	activePromo: 'trial' | 'upsell' | null;
}> = ({ items, total, activePromo }) => {
	const getItemDescription = (item: CartItem) => {
		if (activePromo === 'trial') {
			return '7-Day Trial Subscription';
		} else if (activePromo === 'upsell') {
			return 'First Month (50% Off) Subscription';
		}

		if (item.type === 'individual') {
			return `${
				item.billingCycle.charAt(0).toUpperCase() +
				item.billingCycle.slice(1)
			} Subscription`;
		} else {
			return `Business Plan - ${item.businessInfo?.tier || 'Custom'}`;
		}
	};

	const getDisplayPrice = () => {
		if (activePromo === 'trial') return 7;
		if (activePromo === 'upsell') return 37.5;
		return total;
	};

	return (
		<div className='order-summary'>
			<h2>Order Summary</h2>
			<div className='order-items'>
				{items.map((item) => (
					<div key={item.id} className='order-item'>
						<div className='order-item-details'>
							<h4>{getItemDescription(item)}</h4>
							<p className='order-item-meta'>
								{item.isGift && (
									<span className='gift-indicator'>
										🎁 Gift •{' '}
									</span>
								)}
								{activePromo === 'trial'
									? '7 days for $7'
									: activePromo === 'upsell'
									? 'First month 50% off'
									: `${item.quantity} × $${item.price}/${item.billingCycle}`}
							</p>
						</div>
						<div className='order-item-price'>
							${getDisplayPrice().toFixed(2)}
						</div>
					</div>
				))}
			</div>
			<div className='order-total'>
				<span>Total (first payment)</span>
				<span className='total-amount'>
					${getDisplayPrice().toFixed(2)}
				</span>
			</div>
		</div>
	);
};

// Checkout Form Component
const CheckoutForm: React.FC<{
	activePromo: 'trial' | 'upsell' | null;
	setActivePromo: React.Dispatch<
		React.SetStateAction<'trial' | 'upsell' | null>
	>;
}> = ({ activePromo, setActivePromo }) => {
	const stripe = useStripe();
	const elements = useElements();
	const navigate = useNavigate();
	const { items, getTotalPrice, clearCart } = useCart();

	const [showUpsellModal, setShowUpsellModal] = useState(false);
	const [attemptedCheckout, setAttemptedCheckout] = useState(false);
	const [showDownsellModal, setShowDownsellModal] = useState(false);
	const [hasSeenDownsell, setHasSeenDownsell] = useState(false);

	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState('');
	const [promoCode, setPromoCode] = useState('');
	const [promoDiscount, setPromoDiscount] = useState<number>(0);
	const [promoLoading, setPromoLoading] = useState(false);
	const [savePaymentMethod, setSavePaymentMethod] = useState(false);
	const [billingInfo, setBillingInfo] = useState<RecipientInfo>({
		firstName: '',
		lastName: '',
		email: '',
		address: {
			line1: '',
			line2: '',
			city: '',
			state: '',
			postalCode: '',
			country: 'US',
		},
	});
	const [isGift, setIsGift] = useState(false);
	const [shippingInfo, setShippingInfo] = useState<RecipientInfo>({
		firstName: '',
		lastName: '',
		email: '',
		address: {
			line1: '',
			line2: '',
			city: '',
			state: '',
			postalCode: '',
			country: 'US',
		},
	});

	useEffect(() => {
		// Redirect if cart is empty
		if (items.length === 0) {
			navigate('/');
		}
	}, [items, navigate]);

	// Exit intent detection for downsell
	useEffect(() => {
		const handleMouseLeave = (e: MouseEvent) => {
			// Only trigger if leaving from the top of the page
			if (e.clientY <= 0 && !activePromo && !hasSeenDownsell && email) {
				setShowDownsellModal(true);
				setHasSeenDownsell(true);
			}
		};

		document.addEventListener('mouseleave', handleMouseLeave);
		return () =>
			document.removeEventListener('mouseleave', handleMouseLeave);
	}, [activePromo, hasSeenDownsell, email]);

	// Email validation function
	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setEmailError('Email is required');
			return false;
		}
		if (!emailRegex.test(email)) {
			setEmailError('Please enter a valid email address');
			return false;
		}
		setEmailError('');
		return true;
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		if (emailError) {
			validateEmail(value);
		}
	};

	const handleEmailBlur = () => {
		validateEmail(email);
	};

	// Promo code validation
	const handlePromoCode = async () => {
		if (!promoCode.trim()) return;

		setPromoLoading(true);
		hotjarEvent('checkout_promo_code_attempted');

		try {
			// For demo purposes, let's accept "SAVE10" for 10% off
			if (promoCode.toUpperCase() === 'SAVE10') {
				setPromoDiscount(0.1); // 10% discount
				setError(null);
				hotjarEvent('checkout_promo_code_applied_successfully');
			} else {
				setError('Invalid promo code');
				setPromoDiscount(0);
				hotjarEvent('checkout_promo_code_invalid');
			}
		} catch (err) {
			setError('Error validating promo code');
			hotjarEvent('checkout_promo_code_error');
		} finally {
			setPromoLoading(false);
		}
	};

	const getTotalWithDiscount = () => {
		const subtotal = getTotalPrice();
		return subtotal - subtotal * promoDiscount;
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: 'billing' | 'shipping'
	) => {
		const { name, value } = e.target;
		const setter = type === 'billing' ? setBillingInfo : setShippingInfo;

		if (name.includes('address.')) {
			const addressField = name.split('.')[1];
			setter((prev) => ({
				...prev,
				address: {
					...prev.address,
					[addressField]: value,
				},
			}));
		} else {
			setter((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		// Track checkout attempt
		hotjarEvent('checkout_form_submitted');

		// Validate email first
		if (!validateEmail(email)) {
			hotjarEvent('checkout_email_validation_failed');
			return;
		}

		// Show upsell modal for trial users who haven't attempted checkout yet
		if (activePromo === 'trial' && !attemptedCheckout) {
			hotjarEvent('checkout_upsell_shown_from_trial');
			setShowUpsellModal(true);
			setAttemptedCheckout(true);
			return;
		}

		// Show downsell modal for regular price users who haven't seen an offer
		if (!activePromo && !attemptedCheckout) {
			hotjarEvent('checkout_upsell_shown_from_regular');
			setShowUpsellModal(true);
			setAttemptedCheckout(true);
			return;
		}

		if (!stripe || !elements) {
			return;
		}

		setIsProcessing(true);
		setError(null);

		// Track the start of payment processing
		hotjarEvent('checkout_payment_processing_started');

		const cardElement = elements.getElement(CardElement);
		if (!cardElement) {
			setError('Card element not found');
			setIsProcessing(false);
			hotjarEvent('checkout_card_element_error');
			return;
		}

		try {
			// Handle multiple subscriptions
			if (items.length > 1) {
				// For multiple subscriptions, we'd typically create separate subscriptions
				// or use a subscription with multiple items
				console.log('Multiple subscriptions detected:', items);
				hotjarEvent('checkout_multiple_subscriptions');
			}

			// For subscriptions, we'll use the first item's price
			// In a real app, you'd handle multiple subscriptions differently
			const firstItem = items[0];

			// Get prices from backend
			const { prices } = await paymentAPI.getPrices();

			// Determine which price to use based on active promotion
			let priceId;
			if (activePromo === 'trial') {
				priceId = prices['promo_trial_7days']?.id;
				hotjarEvent('checkout_trial_offer_processed');
			} else if (activePromo === 'upsell') {
				priceId = prices['promo_first_month_half']?.id;
				hotjarEvent('checkout_upsell_offer_processed');
			} else {
				priceId = prices[`individual_${firstItem.billingCycle}`]?.id;
				hotjarEvent(
					`checkout_regular_${firstItem.billingCycle}_processed`
				);
			}

			if (!priceId) {
				throw new Error('Price not found for selected plan');
			}

			// Create payment method
			const { error: pmError, paymentMethod } =
				await stripe.createPaymentMethod({
					type: 'card',
					card: cardElement,
					billing_details: {
						name: `${billingInfo.firstName} ${billingInfo.lastName}`,
						email: email || billingInfo.email,
						address: {
							line1: billingInfo.address.line1,
							line2: billingInfo.address.line2 || undefined,
							city: billingInfo.address.city,
							state: billingInfo.address.state,
							postal_code: billingInfo.address.postalCode,
							country: billingInfo.address.country,
						},
					},
				});

			if (pmError) {
				hotjarEvent('checkout_payment_method_creation_failed');
				throw new Error(pmError.message);
			}

			hotjarEvent('checkout_payment_method_created');

			// Create subscription with metadata
			const result = await paymentAPI.createSubscription({
				email: email || billingInfo.email,
				paymentMethodId: paymentMethod.id,
				priceId,
				billingCycle: firstItem.billingCycle,
				isGift,
				recipientInfo: isGift ? shippingInfo : billingInfo,
				metadata: {
					items: JSON.stringify(items),
					promoCode: promoCode || undefined,
					discount:
						promoDiscount > 0
							? (promoDiscount * 100).toFixed(0) + '%'
							: undefined,
					savePaymentMethod: savePaymentMethod.toString(),
					multipleSubscriptions: items.length > 1 ? 'true' : 'false',
					totalItems: items.length.toString(),
				},
			});

			if (result.error) {
				hotjarEvent('checkout_subscription_creation_failed');
				throw new Error(result.error);
			}

			// Track successful checkout
			hotjarEvent('checkout_completed_successfully');

			// Track gift purchases separately
			if (isGift) {
				hotjarEvent('checkout_gift_purchase_completed');
			}

			// Clear cart and redirect to success page
			clearCart();
			navigate('/checkout/success', {
				state: {
					subscriptionId: result.subscriptionId,
					email: email || billingInfo.email,
				},
			});
		} catch (err: any) {
			hotjarEvent('checkout_error_occurred');
			setError(err.message || 'An error occurred during checkout');
		} finally {
			setIsProcessing(false);
		}
	};

	const totalPrice = getTotalPrice();

	// Upsell modal handlers
	const handleUpsellAccept = () => {
		setShowUpsellModal(false);
		if (activePromo === 'trial') {
			// Upgrade from trial to 50% off first month
			hotjarEvent('checkout_upsell_accepted_trial_to_first_month');
			setActivePromo('upsell');
		} else if (!activePromo) {
			// Downsell: accept 50% off when they were going to pay full price
			hotjarEvent('checkout_upsell_accepted_regular_to_first_month');
			setActivePromo('upsell');
		}
		// Trigger form submission again
		const form = document.querySelector(
			'.checkout-form'
		) as HTMLFormElement;
		if (form) {
			form.requestSubmit();
		}
	};

	const handleUpsellDecline = () => {
		setShowUpsellModal(false);
		if (activePromo === 'trial') {
			hotjarEvent('checkout_upsell_declined_trial');
		} else {
			hotjarEvent('checkout_upsell_declined_regular');
		}
		// Continue with original selection
		const form = document.querySelector(
			'.checkout-form'
		) as HTMLFormElement;
		if (form) {
			form.requestSubmit();
		}
	};

	// Downsell modal handlers
	const handleDownsellAccept = () => {
		setShowDownsellModal(false);
		hotjarEvent('checkout_downsell_accepted_trial_offer');
		// Switch to trial offer
		setActivePromo('trial');
	};

	const handleDownsellDecline = () => {
		setShowDownsellModal(false);
		hotjarEvent('checkout_downsell_declined');
	};

	return (
		<>
			<UpsellModal
				isOpen={showUpsellModal}
				onAccept={handleUpsellAccept}
				onDecline={handleUpsellDecline}
				currentOffer={activePromo === 'trial' ? 'trial' : 'regular'}
			/>
			<DownsellModal
				isOpen={showDownsellModal}
				onAccept={handleDownsellAccept}
				onDecline={handleDownsellDecline}
			/>
			<form onSubmit={handleSubmit} className='checkout-form'>
				{activePromo && (
					<div className={`active-promo-banner ${activePromo}`}>
						{activePromo === 'trial' ? (
							<>
								<h3>🎉 7-Day Trial for $7</h3>
								<p>
									You're getting our special trial offer! Try
									Positive Postcards for 7 days for just $7.
								</p>
								<p className='promo-details'>
									After 7 days, your subscription will
									continue at $60/month unless cancelled.
								</p>
							</>
						) : (
							<>
								<h3>💰 50% Off First Month</h3>
								<p>
									You're getting 50% off your first month! Pay
									just $37.50 instead of $75.
								</p>
								<p className='promo-details'>
									After the first month, your subscription
									will continue at $60/month.
								</p>
							</>
						)}
					</div>
				)}

				{isTestMode && (
					<div className='test-mode-banner'>
						<h3>🧪 Test Mode</h3>
						<p>Use these test card numbers:</p>
						<ul>
							<li>
								<code>4242 4242 4242 4242</code> - Success
							</li>
							<li>
								<code>4000 0025 0000 3155</code> - Requires
								authentication
							</li>
							<li>
								<code>4000 0000 0000 9995</code> - Declined
							</li>
						</ul>
						<p>
							Use any future date for expiry and any 3 digits for
							CVC
						</p>
						<p style={{ marginTop: '0.5rem' }}>
							<strong>Demo promo code:</strong>{' '}
							<code>SAVE10</code> for 10% off
						</p>
					</div>
				)}

				<div className='checkout-section'>
					<h2>Contact Information</h2>
					<input
						type='email'
						name='email'
						placeholder='Email address'
						value={email}
						onChange={handleEmailChange}
						onBlur={handleEmailBlur}
						required
						className='form-input'
					/>
					{emailError && (
						<div className='error-message'>{emailError}</div>
					)}
				</div>

				<div className='checkout-section'>
					<h2>Promo Code</h2>
					<div className='promo-code-section'>
						<input
							type='text'
							placeholder='Enter promo code'
							value={promoCode}
							onChange={(e) => setPromoCode(e.target.value)}
							className='form-input promo-input'
						/>
						<button
							type='button'
							onClick={handlePromoCode}
							disabled={promoLoading}
							className='promo-button'>
							{promoLoading ? 'Applying...' : 'Apply'}
						</button>
					</div>
					{promoDiscount > 0 && (
						<div className='promo-success'>
							✅ Promo code applied! You saved $
							{(getTotalPrice() * promoDiscount).toFixed(2)}
						</div>
					)}
				</div>

				<div className='checkout-section'>
					<h2>Billing Information</h2>
					<div className='form-row'>
						<input
							type='text'
							name='firstName'
							placeholder='First name'
							value={billingInfo.firstName}
							onChange={(e) => handleInputChange(e, 'billing')}
							required
							className='form-input half'
						/>
						<input
							type='text'
							name='lastName'
							placeholder='Last name'
							value={billingInfo.lastName}
							onChange={(e) => handleInputChange(e, 'billing')}
							required
							className='form-input half'
						/>
					</div>
					<AddressAutocomplete
						value={billingInfo.address.line1}
						onChange={(value) =>
							setBillingInfo((prev) => ({
								...prev,
								address: { ...prev.address, line1: value },
							}))
						}
						onSelect={(address) => {
							setBillingInfo((prev) => ({
								...prev,
								address: {
									...prev.address,
									line1: address.street,
									city: address.city,
									state: address.state,
									postalCode: address.zip,
								},
							}));
						}}
						placeholder='Start typing your address...'
					/>
					<input
						type='text'
						name='address.line2'
						placeholder='Apartment, suite, etc. (optional)'
						value={billingInfo.address.line2}
						onChange={(e) => handleInputChange(e, 'billing')}
						className='form-input'
					/>
					<div className='form-row'>
						<input
							type='text'
							name='address.city'
							placeholder='City'
							value={billingInfo.address.city}
							onChange={(e) => handleInputChange(e, 'billing')}
							required
							className='form-input third'
						/>
						<input
							type='text'
							name='address.state'
							placeholder='State'
							value={billingInfo.address.state}
							onChange={(e) => handleInputChange(e, 'billing')}
							required
							className='form-input third'
						/>
						<input
							type='text'
							name='address.postalCode'
							placeholder='ZIP code'
							value={billingInfo.address.postalCode}
							onChange={(e) => handleInputChange(e, 'billing')}
							required
							className='form-input third'
						/>
					</div>
				</div>

				<div className='checkout-section'>
					<label className='checkbox-label'>
						<input
							type='checkbox'
							checked={isGift}
							onChange={(e) => setIsGift(e.target.checked)}
						/>
						<span>This is a gift (ship to different address)</span>
					</label>
				</div>

				{isGift && (
					<div className='checkout-section'>
						<h2>Shipping Information</h2>
						<div className='form-row'>
							<input
								type='text'
								name='firstName'
								placeholder="Recipient's first name"
								value={shippingInfo.firstName}
								onChange={(e) =>
									handleInputChange(e, 'shipping')
								}
								required
								className='form-input half'
							/>
							<input
								type='text'
								name='lastName'
								placeholder="Recipient's last name"
								value={shippingInfo.lastName}
								onChange={(e) =>
									handleInputChange(e, 'shipping')
								}
								required
								className='form-input half'
							/>
						</div>
						<AddressAutocomplete
							value={shippingInfo.address.line1}
							onChange={(value) =>
								setShippingInfo((prev) => ({
									...prev,
									address: { ...prev.address, line1: value },
								}))
							}
							onSelect={(address) => {
								setShippingInfo((prev) => ({
									...prev,
									address: {
										...prev.address,
										line1: address.street,
										city: address.city,
										state: address.state,
										postalCode: address.zip,
									},
								}));
							}}
							placeholder='Start typing shipping address...'
						/>
						<input
							type='text'
							name='address.line2'
							placeholder='Apartment, suite, etc. (optional)'
							value={shippingInfo.address.line2}
							onChange={(e) => handleInputChange(e, 'shipping')}
							className='form-input'
						/>
						<div className='form-row'>
							<input
								type='text'
								name='address.city'
								placeholder='City'
								value={shippingInfo.address.city}
								onChange={(e) =>
									handleInputChange(e, 'shipping')
								}
								required
								className='form-input third'
							/>
							<input
								type='text'
								name='address.state'
								placeholder='State'
								value={shippingInfo.address.state}
								onChange={(e) =>
									handleInputChange(e, 'shipping')
								}
								required
								className='form-input third'
							/>
							<input
								type='text'
								name='address.postalCode'
								placeholder='ZIP code'
								value={shippingInfo.address.postalCode}
								onChange={(e) =>
									handleInputChange(e, 'shipping')
								}
								required
								className='form-input third'
							/>
						</div>
					</div>
				)}

				<div className='checkout-section'>
					<h2>Payment Information</h2>
					<div className='card-element-container'>
						<CardElement
							options={{
								style: {
									base: {
										fontSize: '16px',
										color: '#32325d',
										'::placeholder': {
											color: '#aab7c4',
										},
									},
									invalid: {
										color: '#fa755a',
										iconColor: '#fa755a',
									},
								},
							}}
						/>
					</div>
					<label className='checkbox-label save-payment'>
						<input
							type='checkbox'
							checked={savePaymentMethod}
							onChange={(e) =>
								setSavePaymentMethod(e.target.checked)
							}
						/>
						<span>Save payment method for future purchases</span>
					</label>
				</div>

				{error && <div className='error-message'>{error}</div>}

				<div className='checkout-summary'>
					<div className='summary-row'>
						<span>Subtotal</span>
						<span className='summary-price'>
							${totalPrice.toFixed(2)}
						</span>
					</div>
					{activePromo && (
						<div className='summary-row promo-row'>
							<span>
								{activePromo === 'trial'
									? '7-Day Trial Special'
									: '50% Off First Month'}
							</span>
							<span className='promo-price'>
								{activePromo === 'trial' ? '$7.00' : '$37.50'}
							</span>
						</div>
					)}
					{promoDiscount > 0 && (
						<div className='summary-row discount-row'>
							<span>
								Discount ({(promoDiscount * 100).toFixed(0)}%
								off)
							</span>
							<span className='discount-amount'>
								-${(totalPrice * promoDiscount).toFixed(2)}
							</span>
						</div>
					)}
					<div className='summary-row total-row'>
						<span>Total (first payment)</span>
						<span className='summary-price'>
							$
							{activePromo === 'trial'
								? '7.00'
								: activePromo === 'upsell'
								? '37.50'
								: getTotalWithDiscount().toFixed(2)}
						</span>
					</div>
					<p className='summary-note'>
						{activePromo === 'trial'
							? 'Then $60/month after 7 days unless cancelled.'
							: activePromo === 'upsell'
							? 'Then $60/month after first month.'
							: 'Your subscription will renew automatically at this rate.'}
					</p>
				</div>

				<button
					type='submit'
					disabled={!stripe || isProcessing}
					className='checkout-button'>
					{isProcessing
						? 'Processing...'
						: activePromo === 'trial'
						? 'Start 7-Day Trial for $7'
						: activePromo === 'upsell'
						? 'Get 50% Off - Pay $37.50'
						: `Subscribe for $${getTotalWithDiscount().toFixed(2)}`}
				</button>

				<p className='secure-notice'>
					🔒 Your payment information is secure and encrypted.
				</p>
			</form>
		</>
	);
};

// Main Checkout Component wrapped with Stripe Elements
const Checkout: React.FC = () => {
	const { items, getTotalPrice } = useCart();
	const location = useLocation();
	const totalPrice = getTotalPrice();

	// Check for promotional state
	const promoType = location.state?.promoType;
	const [activePromo, setActivePromo] = useState<'trial' | 'upsell' | null>(
		promoType || null
	);

	return (
		<div className='checkout-page'>
			<div className='checkout-container'>
				<h1>Complete Your Order</h1>
				<Elements stripe={stripePromise}>
					<OrderSummary
						items={items}
						total={totalPrice}
						activePromo={activePromo}
					/>
					<CheckoutForm
						activePromo={activePromo}
						setActivePromo={setActivePromo}
					/>
				</Elements>
			</div>
		</div>
	);
};

export default Checkout;
