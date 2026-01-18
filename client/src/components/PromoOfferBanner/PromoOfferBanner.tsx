import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import EmailOptInForm from '../EmailOptInForm/EmailOptInForm';
import './PromoOfferBanner.css';

interface PromoOfferBannerProps {
	onExpire?: () => void;
	variant?: 'trial' | 'upsell';
}

const PromoOfferBanner: React.FC<PromoOfferBannerProps> = ({
	onExpire,
	variant = 'trial',
}) => {
	const navigate = useNavigate();
	const { addToCart, clearCart } = useCart();
	const [showEmailForm, setShowEmailForm] = useState(false);

	const handleCTAClick = () => {
		if (variant === 'trial') {
			// Clear existing cart and add trial item
			clearCart();
			addToCart({
				type: 'individual',
				billingCycle: 'monthly',
				price: 7, // Trial price
				quantity: 1,
				isGift: false,
			});
		}
		// Navigate to checkout with promo flag
		navigate('/checkout', { state: { promoType: variant } });
	};

	const handleTimerExpire = () => {
		setShowEmailForm(true);
	};

	const handleEmailFormClose = () => {
		setShowEmailForm(false);
		onExpire?.();
	};

	// Show email form when timer expires
	if (showEmailForm) {
		return (
			<div className='promo-banner email-optin'>
				<div className='promo-container'>
					<EmailOptInForm onClose={handleEmailFormClose} />
				</div>
			</div>
		);
	}

	if (variant === 'trial') {
		return (
			<div className='promo-banner trial-offer'>
				<div className='promo-container'>
					<div className='promo-content'>
						<h2 className='promo-headline'>
							🎉 Limited Time Offer: Try 7 Days for Only $7!
						</h2>
						<p className='promo-subtext'>
							Experience daily affirmations delivered to your door
						</p>
						<div className='promo-features'>
							<span>✓ Full access for 7 days</span>
							<span>✓ Cancel anytime</span>
							<span>✓ No hidden fees</span>
						</div>
						<button
							className='promo-cta pulse-button'
							onClick={handleCTAClick}>
							Start Your $7 Trial Now
						</button>
					</div>
					<div className='promo-timer'>
						<CountdownTimer
							onExpire={handleTimerExpire}
							initialMinutes={5}
						/>
					</div>
				</div>
			</div>
		);
	}

	// Upsell variant
	return (
		<div className='promo-banner upsell-offer'>
			<div className='promo-container'>
				<div className='promo-badge'>SPECIAL OFFER</div>
				<div className='promo-content'>
					<h2 className='promo-headline'>
						💰 Get 50% OFF Your First Month!
					</h2>
					<p className='promo-subtext'>
						Only $60 instead of $120 - Save $60!
					</p>
					<div className='promo-comparison'>
						<div className='price-old'>
							<span className='label'>Regular Price:</span>
							<span className='amount'>$120</span>
						</div>
						<div className='price-new'>
							<span className='label'>Your Price:</span>
							<span className='amount'>$60</span>
						</div>
					</div>
					<button
						className='promo-cta upsell-button'
						onClick={handleCTAClick}>
						Claim 50% Discount
					</button>
					<p className='promo-disclaimer'>
						*Then $120/month after first month
					</p>
				</div>
			</div>
		</div>
	);
};

export default PromoOfferBanner;
