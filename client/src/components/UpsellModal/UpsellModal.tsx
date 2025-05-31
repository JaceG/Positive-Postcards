import React from 'react';
import './UpsellModal.css';

interface UpsellModalProps {
	isOpen: boolean;
	onAccept: () => void;
	onDecline: () => void;
	currentOffer: 'trial' | 'regular';
}

const UpsellModal: React.FC<UpsellModalProps> = ({
	isOpen,
	onAccept,
	onDecline,
	currentOffer,
}) => {
	if (!isOpen) return null;

	return (
		<div className='upsell-modal-overlay'>
			<div className='upsell-modal'>
				<div className='upsell-content'>
					{currentOffer === 'trial' ? (
						<>
							<h2 className='upsell-headline'>
								Wait! Upgrade Your Trial 🚀
							</h2>
							<div className='upsell-offer'>
								<p className='offer-text'>
									Instead of just 7 days, get your{' '}
									<strong>
										ENTIRE FIRST MONTH for 50% OFF!
									</strong>
								</p>
								<div className='price-comparison'>
									<div className='price-item'>
										<span className='label'>
											Trial (7 days):
										</span>
										<span className='price'>$7</span>
									</div>
									<div className='arrow'>→</div>
									<div className='price-item featured'>
										<span className='label'>
											First Month (30 days):
										</span>
										<span className='price'>$37.50</span>
										<span className='savings'>
											Save $37.50!
										</span>
									</div>
								</div>
								<ul className='benefits'>
									<li>
										✓ 30 days of daily affirmations (vs only
										7)
									</li>
									<li>
										✓ Full month to experience
										transformation
									</li>
									<li>✓ Better value - only $1.25/day</li>
									<li>✓ Cancel anytime</li>
								</ul>
							</div>
							<div className='upsell-actions'>
								<button
									className='accept-button'
									onClick={onAccept}>
									Yes! Upgrade to 50% Off First Month
								</button>
								<button
									className='decline-button'
									onClick={onDecline}>
									No thanks, I'll stick with the 7-day trial
								</button>
							</div>
						</>
					) : (
						<>
							<h2 className='upsell-headline'>
								Don't Miss Out! 💝
							</h2>
							<div className='upsell-offer'>
								<p className='offer-text'>
									Get{' '}
									<strong>50% OFF your first month</strong> -
									This offer won't be available again!
								</p>
								<div className='price-breakdown'>
									<div className='original-price'>
										<span>Regular Price:</span>
										<span className='amount strikethrough'>
											$60
										</span>
									</div>
									<div className='special-price'>
										<span>Your Price:</span>
										<span className='amount highlight'>
											$37.50
										</span>
									</div>
								</div>
								<p className='urgency'>
									⏰ This one-time offer expires when you
									leave this page
								</p>
							</div>
							<div className='upsell-actions'>
								<button
									className='accept-button'
									onClick={onAccept}>
									Yes! Give me 50% OFF
								</button>
								<button
									className='decline-button'
									onClick={onDecline}>
									No thanks, I'll pay full price
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default UpsellModal;
