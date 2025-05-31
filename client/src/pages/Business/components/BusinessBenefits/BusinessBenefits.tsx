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
			title: 'ROI & Metrics',
			features: [
				'Measurable wellbeing improvement',
				'Reduced healthcare costs',
				'Higher employee NPS scores',
				'Increased client retention rates',
				'Executive business reviews',
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
					<h2>Why Leading Companies Choose Positive Postcards</h2>
					<p>
						More than wellness—it's a complete business solution for
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
								moments of joy that employees actually treasure.
								No logins, no notifications, no digital
								overwhelm—just genuine human connection
								delivered to their hands.
							</p>
						</div>
						<div className='highlight-stats'>
							<div className='highlight-stat'>
								<div className='stat-value'>94%</div>
								<div className='stat-description'>
									keep every card received
								</div>
							</div>
							<div className='highlight-stat'>
								<div className='stat-value'>2.5x</div>
								<div className='stat-description'>
									stronger emotional impact than digital
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
