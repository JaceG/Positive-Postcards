import React from 'react';
import './UseCases.css';

const UseCases: React.FC = () => {
	const useCases = [
		{
			title: 'Self-Care Champions',
			percentage: '15% of our community',
			icon: '💝',
			examples: [
				'Busy professionals seeking daily grounding',
				'Parents needing moments of encouragement',
				'Anyone building positive mental habits',
			],
		},
		{
			title: 'Thoughtful Gift Givers',
			percentage: '60% of our community',
			icon: '🎁',
			examples: [
				'Supporting loved ones through tough times',
				'Long-distance relationship connection',
				'Meaningful alternative to flowers',
			],
		},
		{
			title: 'Forward-Thinking Companies',
			percentage: '15% of our community',
			icon: '🏢',
			examples: [
				'Employee wellness programs',
				'Client appreciation gifts',
				'Team morale boosters',
			],
		},
		{
			title: 'Wellness Professionals',
			percentage: '10% of our community',
			icon: '💚',
			examples: [
				'Therapists supporting clients',
				'Life coaches reinforcing growth',
				'Recovery program supplements',
			],
		},
	];

	return (
		<section className='use-cases'>
			<div className='section-header'>
				<h2>Who Uses Positive Postcards?</h2>
				<p>Join thousands who are transforming their daily mindset</p>
			</div>
			<div className='use-cases-grid'>
				{useCases.map((useCase, index) => (
					<div key={index} className='use-case-card'>
						<div className='use-case-header'>
							<div className='use-case-icon'>{useCase.icon}</div>
							<div className='use-case-title'>
								<h3>{useCase.title}</h3>
								<p className='use-case-percentage'>
									{useCase.percentage}
								</p>
							</div>
						</div>
						<ul className='use-case-examples'>
							{useCase.examples.map((example, i) => (
								<li key={i}>{example}</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
};

export default UseCases;
