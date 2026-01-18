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
			price: '$120',
			originalPrice: 'Normally $150',
			period: 'Billed monthly',
			perDay: '$4 per day',
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
			price: '$198',
			originalPrice: 'Worth $360',
			period: 'Billed every 3 months',
			perDay: 'Just $2.20 per day!',
			savings: 'Save 45% vs Monthly',
			features: [
				'90 unique postcards (3 months)',
				'Beautiful rotating designs',
				'Premium eco-friendly cardstock',
				'Free shipping always',
				'Pause or cancel anytime',
				'Bonus welcome package',

			],
			isPopular: true,
			ctaText: 'Choose Quarterly',
		},
		{
			name: 'Annual',
			price: '$720',
			originalPrice: 'Worth $1,440',
			period: 'Billed annually',
			perDay: 'Just $2 per day!',
			savings: 'Save 50% • Founding Member Bonus',
			features: [
				'365 unique postcards (full year)',
				'Exclusive annual-only designs',
				'Premium eco-friendly cardstock',
				'2 free gift trials included',
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
					💰 Retail value $4/card • Save up to 50% with longer plans
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
