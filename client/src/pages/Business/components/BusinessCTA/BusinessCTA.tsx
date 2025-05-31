import React from 'react';
import './BusinessCTA.css';

const BusinessCTA: React.FC = () => {
	return (
		<section className='business-cta'>
			<div className='container'>
				<div className='business-cta-content'>
					<div className='cta-main'>
						<h2>Ready to Transform Your Workplace?</h2>
						<p>
							Join hundreds of forward-thinking companies who are
							building stronger teams and deeper relationships
							through the simple power of positive mail.
						</p>

						<div className='cta-buttons'>
							<a
								href='#schedule-demo'
								className='btn btn-primary btn-lg'>
								Schedule a Demo
							</a>
							<a
								href='#start-trial'
								className='btn btn-secondary'>
								Start Free Trial
							</a>
						</div>

						<div className='cta-guarantees'>
							<div className='guarantee-item'>
								<span className='guarantee-icon'>🚀</span>
								<span>Setup in 24 hours</span>
							</div>
							<div className='guarantee-item'>
								<span className='guarantee-icon'>💯</span>
								<span>30-day money-back guarantee</span>
							</div>
							<div className='guarantee-item'>
								<span className='guarantee-icon'>📞</span>
								<span>Dedicated customer success</span>
							</div>
						</div>
					</div>

					<div className='cta-sidebar'>
						<div className='contact-card'>
							<h3>Need a Custom Solution?</h3>
							<p>
								Our enterprise team specializes in creating
								tailored programs for large organizations,
								government agencies, and complex requirements.
							</p>

							<div className='contact-options'>
								<div className='contact-option'>
									<div className='contact-icon'>📧</div>
									<div className='contact-details'>
										<div className='contact-label'>
											Email
										</div>
										<a href='mailto:enterprise@positivepostcards.com'>
											enterprise@positivepostcards.com
										</a>
									</div>
								</div>

								<div className='contact-option'>
									<div className='contact-icon'>📞</div>
									<div className='contact-details'>
										<div className='contact-label'>
											Phone
										</div>
										<a href='tel:+1-555-POSTCARDS'>
											+1 (555) POST-CARDS
										</a>
									</div>
								</div>
							</div>

							<a
								href='#enterprise-contact'
								className='contact-cta'>
								Contact Enterprise Sales →
							</a>
						</div>

						<div className='resources-card'>
							<h3>Helpful Resources</h3>
							<ul className='resources-list'>
								<li>
									<a href='#roi-calculator'>
										🧮 ROI Calculator
									</a>
								</li>
								<li>
									<a href='#implementation-guide'>
										📋 Implementation Guide
									</a>
								</li>
								<li>
									<a href='#case-studies'>
										📊 Customer Case Studies
									</a>
								</li>
								<li>
									<a href='#wellness-whitepaper'>
										📄 Workplace Wellness Report
									</a>
								</li>
								<li>
									<a href='#demo-video'>
										▶️ Platform Demo Video
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className='final-stats'>
					<div className='final-stat'>
						<div className='stat-value'>2 weeks</div>
						<div className='stat-description'>
							Average implementation time
						</div>
					</div>
					<div className='final-stat'>
						<div className='stat-value'>94%</div>
						<div className='stat-description'>
							Customer satisfaction rate
						</div>
					</div>
					<div className='final-stat'>
						<div className='stat-value'>$2.3M</div>
						<div className='stat-description'>
							Average annual savings for 200+ employee companies
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BusinessCTA;
