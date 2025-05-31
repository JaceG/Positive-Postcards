import React from 'react';
import { useCart } from '../../../../contexts/CartContext';
import { BillingCycle } from '../../../../types/cart.types';
import './Pricing.css';

interface PricingPlan {
	name: string;
	price: string;
	originalPrice?: string;
	period: string;
	perDay: string;
	savings?: string;
	features: string[];
	isPopular?: boolean;
	ctaText: string;
}

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
	const { addToCart } = useCart();

	const handleSelectPlan = () => {
		// Map plan name to billing cycle
		const billingCycleMap: Record<string, BillingCycle> = {
			Monthly: 'monthly',
			Quarterly: 'quarterly',
			Annual: 'annual',
		};

		const billingCycle = billingCycleMap[plan.name] || 'monthly';
		const price = parseInt(plan.price.replace('$', ''));

		addToCart({
			type: 'individual',
			billingCycle,
			price,
			quantity: 1,
			isGift: false,
		});
	};

	return (
		<div className={`pricing-card ${plan.isPopular ? 'featured' : ''}`}>
			{plan.isPopular && (
				<div className='best-value-badge'>
					MOST POPULAR • BEST VALUE
				</div>
			)}

			<h3 className='plan-name'>{plan.name}</h3>
			<div className='plan-price'>{plan.price}</div>
			{plan.originalPrice && (
				<span className='original-price'>{plan.originalPrice}</span>
			)}
			<p className='price-period'>{plan.period}</p>
			<p className='price-per-day'>{plan.perDay}</p>
			{plan.savings && (
				<div className='savings-badge'>{plan.savings}</div>
			)}

			<ul className='plan-features'>
				{plan.features.map((feature, index) => (
					<li key={index}>{feature}</li>
				))}
			</ul>

			<button
				className={`btn btn-lg ${
					plan.isPopular ? 'btn-primary' : 'btn-dark'
				}`}
				onClick={handleSelectPlan}>
				{plan.ctaText}
			</button>
		</div>
	);
};

const Pricing: React.FC = () => {
	const plans: PricingPlan[] = [
		{
			name: 'Monthly',
			price: '$60',
			originalPrice: 'Normally $75',
			period: 'Billed monthly',
			perDay: '$2 per day',
			features: [
				'30 unique postcards monthly',
				'Beautiful rotating designs',
				'Premium eco-friendly cardstock',
				'Free shipping always',
				'Pause or cancel anytime',
			],
			ctaText: 'Start Monthly',
		},
		{
			name: 'Quarterly',
			price: '$99',
			originalPrice: 'Worth $180',
			period: 'Billed every 3 months',
			perDay: 'Just $1.10 per day!',
			savings: 'Save 45% vs Monthly',
			features: [
				'90 unique postcards (3 months)',
				'Priority access to new designs',
				'Premium eco-friendly cardstock',
				'Gift wrapping available',
				'Bonus welcome package',
				'Perfect commitment balance',
			],
			isPopular: true,
			ctaText: 'Choose Quarterly',
		},
		{
			name: 'Annual',
			price: '$360',
			originalPrice: 'Worth $720',
			period: 'Billed annually',
			perDay: 'Under $1 per day!',
			savings: 'Save 50% • Founding Member Bonus',
			features: [
				'365 unique postcards (full year)',
				'Exclusive annual-only designs',
				'Premium eco-friendly cardstock',
				'2 free gift subscriptions included',
				'Founding member perks forever',
				'Personalized anniversary card',
			],
			ctaText: 'Commit to Growth',
		},
	];

	return (
		<section className='pricing' id='pricing'>
			<div className='section-header pricing-header'>
				<h2>Choose Your Path to Daily Positivity</h2>
				<p>
					Select the perfect plan for yourself or as a meaningful gift
				</p>
				<p className='pricing-subtitle'>
					💰 Retail value $2/card • Get them for less than $1/day
				</p>
			</div>

			<div className='pricing-grid'>
				{plans.map((plan, index) => (
					<PricingCard key={index} plan={plan} />
				))}
			</div>
		</section>
	);
};

export default Pricing;
