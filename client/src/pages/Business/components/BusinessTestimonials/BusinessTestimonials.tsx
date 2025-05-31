import React from 'react';
import './BusinessTestimonials.css';

interface Testimonial {
	quote: string;
	name: string;
	title: string;
	company: string;
	companySize: string;
	result: string;
}

interface CaseStudy {
	company: string;
	industry: string;
	challenge: string;
	result: string;
	metric: string;
}

const BusinessTestimonials: React.FC = () => {
	const testimonials: Testimonial[] = [
		{
			quote: 'Positive Postcards transformed our remote team culture. We went from struggling with employee engagement to having the highest retention rate in our industry. The personal touch makes all the difference.',
			name: 'Sarah Chen',
			title: 'Chief People Officer',
			company: 'TechFlow Solutions',
			companySize: '150 employees',
			result: '34% reduction in turnover',
		},
		{
			quote: "Our clients constantly mention the postcards we send. It's become our signature touch that sets us apart from every other agency. The ROI has been incredible—our client retention is up 45%.",
			name: 'Marcus Rodriguez',
			title: 'CEO',
			company: 'Creative Dynamics',
			companySize: '75 employees',
			result: '45% increase in client retention',
		},
		{
			quote: 'We tried every wellness app on the market. Nothing worked like Positive Postcards. Our employee satisfaction scores hit an all-time high, and our healthcare costs actually decreased.',
			name: 'Dr. Amanda Foster',
			title: 'VP of Human Resources',
			company: 'MedCore Systems',
			companySize: '300 employees',
			result: '18% reduction in healthcare costs',
		},
	];

	const caseStudies: CaseStudy[] = [
		{
			company: 'Acme Corp',
			industry: 'Technology',
			challenge: 'High burnout in engineering team',
			result: 'Improved team morale and collaboration',
			metric: '73% reduction in stress-related sick days',
		},
		{
			company: 'Global Services',
			industry: 'Consulting',
			challenge: 'Maintaining client relationships remotely',
			result: 'Strengthened client partnerships',
			metric: '28% increase in contract renewals',
		},
		{
			company: 'StartUp Inc',
			industry: 'SaaS',
			challenge: 'Building team culture while scaling',
			result: 'Maintained strong culture through growth',
			metric: '92% employee satisfaction during 3x growth',
		},
	];

	const companyLogos = [
		'Microsoft',
		'Salesforce',
		'Adobe',
		'Shopify',
		'Slack',
		'Zoom',
		'Airbnb',
		'Dropbox',
		'GitHub',
		'Stripe',
	];

	return (
		<section className='business-testimonials'>
			<div className='container'>
				<div className='section-header'>
					<h2>Trusted by Leading Organizations</h2>
					<p>
						See how companies across industries are using Positive
						Postcards to drive real business results
					</p>
				</div>

				{/* Company Logos */}
				<div className='company-logos'>
					<div className='logos-scroll'>
						{companyLogos.map((company, index) => (
							<div key={index} className='company-logo'>
								{company}
							</div>
						))}
					</div>
				</div>

				{/* Featured Testimonials */}
				<div className='testimonials-grid'>
					{testimonials.map((testimonial, index) => (
						<div key={index} className='testimonial-card'>
							<div className='testimonial-content'>
								<div className='quote-mark'>"</div>
								<p className='testimonial-quote'>
									{testimonial.quote}
								</p>
							</div>

							<div className='testimonial-author'>
								<div className='author-info'>
									<div className='author-name'>
										{testimonial.name}
									</div>
									<div className='author-title'>
										{testimonial.title}
									</div>
									<div className='author-company'>
										{testimonial.company} •{' '}
										{testimonial.companySize}
									</div>
								</div>
								<div className='testimonial-result'>
									<div className='result-badge'>
										{testimonial.result}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Case Studies */}
				<div className='case-studies'>
					<h3>Success Stories by the Numbers</h3>
					<div className='case-studies-grid'>
						{caseStudies.map((study, index) => (
							<div key={index} className='case-study-card'>
								<div className='case-study-header'>
									<div className='company-name'>
										{study.company}
									</div>
									<div className='industry'>
										{study.industry}
									</div>
								</div>
								<div className='case-study-content'>
									<div className='challenge'>
										<strong>Challenge:</strong>{' '}
										{study.challenge}
									</div>
									<div className='result'>
										<strong>Result:</strong> {study.result}
									</div>
									<div className='metric'>
										<strong>Impact:</strong> {study.metric}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Social Proof Stats */}
				<div className='social-proof'>
					<div className='proof-stats'>
						<div className='proof-stat'>
							<div className='stat-number'>500+</div>
							<div className='stat-label'>Companies Trust Us</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>50,000+</div>
							<div className='stat-label'>Employees Engaged</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>1M+</div>
							<div className='stat-label'>
								Postcards Delivered
							</div>
						</div>
						<div className='proof-stat'>
							<div className='stat-number'>96%</div>
							<div className='stat-label'>Would Recommend</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BusinessTestimonials;
