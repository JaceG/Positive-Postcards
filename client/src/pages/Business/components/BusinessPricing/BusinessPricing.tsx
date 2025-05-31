import React from 'react';
import { useCart } from '../../../../contexts/CartContext';
import { BusinessTier } from '../../../../types/cart.types';
import './BusinessPricing.css';

interface BusinessPlan {
	name: string;
	minEmployees: string;
	pricePerPerson: string;
	billingCycle: string;
	features: string[];
	popular?: boolean;
	ctaText: string;
}

const BusinessPricing: React.FC = () => {
	const { addToCart } = useCart();

	const plans: BusinessPlan[] = [
		{
			name: 'Starter',
			minEmployees: '10-50 employees',
			pricePerPerson: '$45',
			billingCycle: 'per person/month',
			features: [
				'Monthly postcards per employee',
				'Basic company branding',
				'Bulk address upload',
				'Email support',
			],
			ctaText: 'Schedule Demo',
		},
		{
			name: 'Growth',
			minEmployees: '51-200 employees',
			pricePerPerson: '$40',
			billingCycle: 'per person/month',
			features: [
				'Everything in Starter',
				'Custom message themes',
				'Dedicated customer success manager',
				'Priority support',
			],
			ctaText: 'Schedule Demo',
		},
		{
			name: 'Enterprise',
			minEmployees: '200+ employees',
			pricePerPerson: 'Custom',
			billingCycle: 'pricing available',
			features: [
				'Everything in Growth',
				'Custom delivery schedules',
				'Executive business reviews',
				'24/7 priority support',
			],
			ctaText: 'Contact Sales',
		},
	];

	const handlePlanSelect = (planName: string) => {
		// For demo purposes, we'll add a business plan to cart
		// In a real app, this would likely open a contact form or demo scheduler
		const tierMap: Record<string, BusinessTier> = {
			Starter: 'starter',
			Growth: 'growth',
			Enterprise: 'enterprise',
		};

		// For non-enterprise plans, add to cart with a default employee count
		if (planName !== 'Enterprise') {
			const pricePerPerson = planName === 'Starter' ? 45 : 40;
			const defaultEmployeeCount = planName === 'Starter' ? 25 : 100;

			addToCart({
				type: 'business',
				billingCycle: 'monthly',
				price: pricePerPerson * defaultEmployeeCount,
				quantity: 1,
				businessInfo: {
					companyName: '',
					tier: tierMap[planName],
					employeeCount: defaultEmployeeCount,
					contactPerson: {
						name: '',
						email: '',
						phone: '',
					},
				},
			});
		} else {
			// For enterprise, we'd typically open a contact form
			console.log('Contact sales for enterprise pricing');
			// TODO: Open enterprise contact modal
		}
	};

	return (
		<section id='business-pricing' className='business-pricing'>
			<div className='container'>
				<div className='section-header'>
					<h2>Corporate Volume Pricing</h2>
					<p>
						Save up to 33% or more compared to individual
						subscriptions with our business rates
					</p>
				</div>

				<div className='pricing-grid'>
					{plans.map((plan, index) => (
						<div
							key={index}
							className={`pricing-card ${
								plan.popular ? 'featured' : ''
							}`}>
							{plan.popular && (
								<div className='popular-badge'>
									Most Popular
								</div>
							)}

							<div className='plan-header'>
								<h3 className='plan-name'>{plan.name}</h3>
								<div className='plan-target'>
									{plan.minEmployees}
								</div>
								<div className='plan-pricing'>
									<div className='price'>
										{plan.pricePerPerson}
									</div>
									<div className='billing'>
										{plan.billingCycle}
									</div>
								</div>
							</div>

							<ul className='plan-features'>
								{plan.features.map((feature, i) => (
									<li key={i}>{feature}</li>
								))}
							</ul>

							<button
								className={`btn btn-lg ${
									plan.popular ? 'btn-primary' : 'btn-dark'
								}`}
								onClick={() => handlePlanSelect(plan.name)}>
								{plan.ctaText}
							</button>
						</div>
					))}
				</div>

				<div className='pricing-details'>
					<div className='savings-comparison'>
						<h3>🏢 Business Volume Savings</h3>
						<div className='comparison-grid'>
							<div className='comparison-item'>
								<div className='comparison-label'>
									Individual Rate
								</div>
								<div className='comparison-price'>
									$60/month
								</div>
								<div className='comparison-note'>
									Per person, monthly billing
								</div>
							</div>
							<div className='comparison-arrow'>→</div>
							<div className='comparison-item featured'>
								<div className='comparison-label'>
									Business Rate
								</div>
								<div className='comparison-price'>
									$40/month
								</div>
								<div className='comparison-note'>
									Per employee, growth tier
								</div>
							</div>
						</div>
						<div className='savings-highlight'>
							<strong>Save $20 per employee per month</strong> •
							$240 annual savings per person
						</div>
					</div>

					<div className='details-grid'>
						<div className='detail-item'>
							<h4>🎯 ROI Calculator</h4>
							<p>
								See your potential savings on employee turnover
								and healthcare costs
							</p>
							<a href='#roi-calculator' className='detail-link'>
								Calculate ROI →
							</a>
						</div>
						<div className='detail-item'>
							<h4>📋 Implementation</h4>
							<p>
								Full setup and employee onboarding completed
								within 2 weeks
							</p>
							<a href='#implementation' className='detail-link'>
								Learn more →
							</a>
						</div>
						<div className='detail-item'>
							<h4>🎨 Customization</h4>
							<p>
								Add company branding and custom message themes
								to reflect your organization's values
							</p>
							<a href='#customization' className='detail-link'>
								See examples →
							</a>
						</div>
					</div>
				</div>

				<div className='enterprise-cta'>
					<div className='enterprise-content'>
						<h3>Enterprise Solutions</h3>
						<p>
							Need custom delivery schedules, dedicated support,
							or volume pricing for 500+ employees? Our enterprise
							team can create a tailored solution for your
							organization.
						</p>
						<div className='enterprise-buttons'>
							<a
								href='#enterprise-contact'
								className='btn btn-primary'>
								Contact Enterprise Sales
							</a>
							<a
								href='#case-studies'
								className='btn btn-secondary'>
								View Case Studies
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BusinessPricing;
