import React from 'react';
import './BusinessUseCases.css';

interface UseCase {
	icon: string;
	title: string;
	stat: string;
	benefits: string[];
	description: string;
}

const BusinessUseCases: React.FC = () => {
	const useCases: UseCase[] = [
		{
			icon: '💚',
			title: 'Employee Wellbeing',
			stat: '87% report improved workplace satisfaction',
			description:
				'Show genuine care for your team with personalized encouragement',
			benefits: [
				'Reduce burnout and stress',
				'Show genuine care for remote teams',
				'Boost morale without another app',
				'Improve retention rates',
			],
		},
		{
			icon: '🤝',
			title: 'Client Retention',
			stat: '3x higher engagement than digital touchpoints',
			description:
				'Strengthen relationships with meaningful, personal connections',
			benefits: [
				'Stand out from competitors',
				'Personal touch at scale',
				'Strengthen relationships',
				'Increase lifetime value',
			],
		},
		{
			icon: '🎁',
			title: 'Corporate Gifting',
			stat: '92% prefer over traditional swag',
			description:
				'Give gifts that create lasting impact throughout the year',
			benefits: [
				'Year-round impact vs one-time gifts',
				'No storage or shipping hassles',
				'Environmentally conscious',
				'Budget-friendly at scale',
			],
		},
		{
			icon: '📈',
			title: 'Sales Enablement',
			stat: '64% increase in response rates',
			description:
				'Break through the noise with memorable sales touchpoints',
			benefits: [
				'Warm up cold outreach',
				'Nurture long sales cycles',
				'Celebrate deal closures',
				'Build lasting partnerships',
			],
		},
	];

	return (
		<section className='business-use-cases'>
			<div className='container'>
				<div className='section-header'>
					<h2>Proven Results Across Every Business Function</h2>
					<p>
						From HR to Sales, see how companies are using Positive
						Postcards to drive real business outcomes
					</p>
				</div>

				<div className='use-cases-grid'>
					{useCases.map((useCase, index) => (
						<div key={index} className='use-case-card'>
							<div className='use-case-header'>
								<div className='use-case-icon'>
									{useCase.icon}
								</div>
								<div className='use-case-title'>
									<h3>{useCase.title}</h3>
									<div className='use-case-stat'>
										{useCase.stat}
									</div>
								</div>
							</div>

							<p className='use-case-description'>
								{useCase.description}
							</p>

							<ul className='use-case-benefits'>
								{useCase.benefits.map((benefit, i) => (
									<li key={i}>{benefit}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default BusinessUseCases;
