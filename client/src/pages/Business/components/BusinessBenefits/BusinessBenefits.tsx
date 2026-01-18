import React from 'react';
import './BusinessBenefits.css';

interface Benefit {
	icon: string;
	title: string;
	features: string[];
}

const BusinessBenefits: React.FC = () => {
	const benefits: Benefit[] = [
		{
			icon: '📊',
			title: 'Simple & Effective',
			features: [
				'No software to install or manage',
				'Works for remote and in-office teams',
				'Tangible appreciation employees keep',
				'Consistent daily positive touchpoint',
				'Easy to measure engagement',
			],
		},
		{
			icon: '⚡',
			title: 'Easy Implementation',
			features: [
				'No IT integration needed',
				'Bulk address management',
				'Automated scheduling',
				'Custom delivery schedules',
				'Setup in under 24 hours',
			],
		},
		{
			icon: '🎨',
			title: 'Customization Options',
			features: [
				'Add company branding',
				'Custom message themes',
				'Bulk discount pricing',
				'Dedicated account manager',
				'Priority support included',
			],
		},
	];

	return (
		<section className='business-benefits'>
			<div className='container'>
				<div className='section-header'>
					<h2>Why Choose Positive Postcards for Business</h2>
					<p>
						More than wellness—a simple solution for meaningful
						human connection
					</p>
				</div>

				<div className='benefits-grid'>
					{benefits.map((benefit, index) => (
						<div key={index} className='benefit-card'>
							<div className='benefit-icon'>{benefit.icon}</div>
							<h3>{benefit.title}</h3>
							<ul className='benefit-features'>
								{benefit.features.map((feature, i) => (
									<li key={i}>{feature}</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className='benefits-highlight'>
					<div className='highlight-content'>
						<div className='highlight-text'>
							<h3>Not Just Another Wellness Program</h3>
							<p>
								While digital wellness solutions add to screen
								fatigue, Positive Postcards creates tangible
								moments of joy that employees can actually hold.
								No logins, no notifications, no digital
								overwhelm—just genuine human connection
								delivered to their hands.
							</p>
						</div>
						<div className='highlight-stats'>
							<div className='highlight-stat'>
								<div className='stat-value'>Physical</div>
								<div className='stat-description'>
									tangible cards employees keep
								</div>
							</div>
							<div className='highlight-stat'>
								<div className='stat-value'>2.5x</div>
								<div className='stat-description'>
									emotional impact of physical vs digital mail*
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BusinessBenefits;
