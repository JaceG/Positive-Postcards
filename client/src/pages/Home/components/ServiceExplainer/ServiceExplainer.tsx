import React from 'react';
import './ServiceExplainer.css';

const ServiceExplainer: React.FC = () => {
	return (
		<section className='service-explainer'>
			<div className='container'>
				<div className='explainer-content'>
					<h2 className='explainer-title'>
						What is Positive Postcards?
					</h2>
					<p className='explainer-description'>
						Sign up yourself or someone you care about to receive
						beautiful postcards with positive affirmations delivered
						to your mailbox every day. Each postcard is carefully
						designed to brighten your day and help build a positive
						mindset, one uplifting message at a time.
					</p>
					<div className='explainer-steps'>
						<div className='step'>
							<div className='step-number'>1</div>
							<div className='step-content'>
								<h3>Sign Up</h3>
								<p>
									Choose a subscription for yourself or as a
									gift
								</p>
							</div>
						</div>
						<div className='step'>
							<div className='step-number'>2</div>
							<div className='step-content'>
								<h3>Receive Daily Postcards</h3>
								<p>
									Get beautifully designed affirmations in
									your mailbox
								</p>
							</div>
						</div>
						<div className='step'>
							<div className='step-number'>3</div>
							<div className='step-content'>
								<h3>Build Positivity</h3>
								<p>
									Transform your mindset with daily
									encouragement
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ServiceExplainer;
