import React from 'react';
import './FinalCTA.css';

const FinalCTA: React.FC = () => {
	return (
		<section className='final-cta'>
			<div className='final-cta-content'>
				<h2>Ready to Transform Your Days?</h2>
				<p>
					Join thousands who are building resilience and spreading joy
					through the simple power of positive mail
				</p>
				<div className='cta-button-group'>
					<a href='#pricing' className='btn btn-primary'>
						Start Your Subscription
					</a>
					<a href='#gift' className='btn btn-secondary'>
						🎁 Send as a Gift
					</a>
				</div>
				<p className='guarantee'>
					<strong>30-Day Happiness Guarantee</strong> • Cancel anytime
					• Refer 3 friends, get 1 month free!
				</p>
			</div>
		</section>
	);
};

export default FinalCTA;
