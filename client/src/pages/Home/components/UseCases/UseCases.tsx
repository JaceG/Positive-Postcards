import React from 'react';
import './UseCases.css';

const UseCases: React.FC = () => {
	const useCases = [
		{
			title: 'Self-Care Champions',
			percentage: 'Perfect for you',
			icon: '💝',
			examples: [
				'Busy professionals seeking daily grounding',
				'Parents needing moments of encouragement',
				'Anyone building positive mental habits',
			],
		},
		{
			title: 'Thoughtful Gift Givers',
			percentage: 'A meaningful gift',
			icon: '🎁',
			examples: [
				'Supporting loved ones through tough times',
				'Long-distance relationship connection',
				'Meaningful alternative to flowers',
			],
		},
		{
			title: 'Forward-Thinking Companies',
			percentage: 'For your team',
			icon: '🏢',
			examples: [
				'Employee wellness programs',
				'Client appreciation gifts',
				'Team morale boosters',
			],
		},
		{
			title: 'Wellness Professionals',
			percentage: 'For your clients',
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
				<h2>Who Is Positive Postcards For?</h2>
				<p>Discover how daily positivity can transform your mindset</p>
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
