import React from 'react';
import './BusinessTestimonials.css';

interface PotentialOutcome {
	icon: string;
	title: string;
	description: string;
}

interface UseCase {
	title: string;
	challenge: string;
	solution: string;
	potentialBenefit: string;
}

const BusinessTestimonials: React.FC = () => {
	const potentialOutcomes: PotentialOutcome[] = [
		{
			icon: '💼',
			title: 'Employee Wellness Programs',
			description:
				'Help your team feel valued with daily positive reinforcement delivered directly to their homes—no app downloads or logins required.',
		},
		{
			icon: '🤝',
			title: 'Client Appreciation',
			description:
				'Stand out from competitors with a thoughtful, ongoing touch that keeps your company top of mind throughout the year.',
		},
		{
			icon: '🎯',
			title: 'Team Culture Building',
			description:
				'Foster connection in remote or hybrid teams with tangible moments of positivity that digital tools cannot replicate.',
		},
	];

	const useCases: UseCase[] = [
		{
			title: 'Remote Team Engagement',
			challenge: 'Keeping distributed teams connected and motivated',
			solution: 'Daily postcards create shared positive experiences',
			potentialBenefit: 'Improved morale and team cohesion',
		},
		{
			title: 'Client Retention',
			challenge: 'Standing out in a crowded market',
			solution: 'Ongoing appreciation that competitors don\'t offer',
			potentialBenefit: 'Stronger client relationships and loyalty',
		},
		{
			title: 'Employee Recognition',
			challenge: 'Showing appreciation beyond annual reviews',
			solution: 'Consistent, daily reminders that employees matter',
			potentialBenefit: 'Higher satisfaction and reduced turnover',
		},
	];

	return (
		<section className='business-testimonials'>
			<div className='container'>
				<div className='section-header'>
					<h2>What You Could Experience</h2>
					<p>
						Explore how Positive Postcards can help your organization
						build stronger connections
					</p>
				</div>

				{/* Potential Outcomes */}
				<div className='testimonials-grid'>
					{potentialOutcomes.map((outcome, index) => (
						<div key={index} className='testimonial-card'>
							<div className='testimonial-content'>
								<div className='quote-mark'>{outcome.icon}</div>
								<h3 className='outcome-title'>{outcome.title}</h3>
								<p className='testimonial-quote'>
									{outcome.description}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Use Cases */}
				<div className='case-studies'>
					<h3>Potential Use Cases</h3>
					<div className='case-studies-grid'>
						{useCases.map((useCase, index) => (
							<div key={index} className='case-study-card'>
								<div className='case-study-header'>
									<div className='company-name'>
										{useCase.title}
									</div>
								</div>
								<div className='case-study-content'>
									<div className='challenge'>
										<strong>Challenge:</strong>{' '}
										{useCase.challenge}
									</div>
									<div className='result'>
										<strong>Solution:</strong> {useCase.solution}
									</div>
									<div className='metric'>
										<strong>Potential Benefit:</strong>{' '}
										{useCase.potentialBenefit}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Value Props instead of fake stats */}
				<div className='social-proof'>
					<div className='proof-stats'>
						<div className='proof-stat'>
							<div className='stat-number'>25%</div>
							<div className='stat-label'>Volume Discount Available</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>24hr</div>
							<div className='stat-label'>Quick Setup Time</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>0</div>
							<div className='stat-label'>IT Integration Needed</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>Daily</div>
							<div className='stat-label'>Postcards Per Employee</div>
						</div>
					</div>
				</div>

				{/* Disclaimer */}
				<p className='disclaimer' style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', marginTop: '2rem' }}>
					* Statistics referenced are from general research on physical mail effectiveness, not specific to Positive Postcards customers.
				</p>
			</div>
		</section>
	);
};

export default BusinessTestimonials;
