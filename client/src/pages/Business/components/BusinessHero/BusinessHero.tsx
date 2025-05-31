import React from 'react';
import './BusinessHero.css';

const BusinessHero: React.FC = () => {
	return (
		<section className='business-hero'>
			<div className='container'>
				<div className='business-hero-content'>
					<div className='hero-text'>
						<div className='trust-badge'>
							🏆 Trusted by 500+ companies worldwide
						</div>
						<h1>
							Transform Your{' '}
							<span className='gradient-text'>
								Workplace Culture
							</span>
						</h1>
						<p className='hero-subtitle'>
							Boost employee wellbeing and strengthen client
							relationships with the power of positive mail. No
							apps, no screens—just meaningful connections that
							drive real business results with measurable ROI.
						</p>

						<div className='hero-stats'>
							<div className='stat'>
								<div className='stat-number'>87%</div>
								<div className='stat-label'>
									improved workplace satisfaction
								</div>
							</div>
							<div className='stat'>
								<div className='stat-number'>3x</div>
								<div className='stat-label'>
									higher engagement than digital
								</div>
							</div>
							<div className='stat'>
								<div className='stat-number'>34%</div>
								<div className='stat-label'>
									reduction in turnover
								</div>
							</div>
						</div>

						<div className='hero-cta'>
							<a
								href='#business-pricing'
								className='btn btn-primary btn-lg'>
								Schedule a Demo
							</a>
							<a
								href='#roi-calculator'
								className='btn btn-secondary'>
								Calculate Your ROI
							</a>
						</div>
					</div>

					<div className='hero-visual'>
						<div className='business-postcard-showcase'>
							<div className='business-postcard card-1'>
								<div className='card-header'>
									<div className='company-logo'>ACME</div>
									<div className='card-type'>
										Employee Wellness
									</div>
								</div>
								<div className='card-content'>
									"Your dedication this quarter has been
									incredible. Thank you for making our team
									stronger."
								</div>
							</div>
							<div className='business-postcard card-2'>
								<div className='card-header'>
									<div className='company-logo'>TechCorp</div>
									<div className='card-type'>
										Client Appreciation
									</div>
								</div>
								<div className='card-content'>
									"We're grateful for your partnership and
									excited about what we'll build together next
									year."
								</div>
							</div>
							<div className='business-postcard card-3'>
								<div className='card-header'>
									<div className='company-logo'>StartUp</div>
									<div className='card-type'>
										Team Motivation
									</div>
								</div>
								<div className='card-content'>
									"Every challenge we've overcome together has
									made us stronger. Here's to more victories
									ahead!"
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BusinessHero;
