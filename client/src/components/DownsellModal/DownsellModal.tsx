import React from 'react';
import './DownsellModal.css';

interface DownsellModalProps {
	isOpen: boolean;
	onAccept: () => void;
	onDecline: () => void;
}

const DownsellModal: React.FC<DownsellModalProps> = ({
	isOpen,
	onAccept,
	onDecline,
}) => {
	if (!isOpen) return null;

	return (
		<div className='downsell-modal-overlay'>
			<div className='downsell-modal'>
				<button className='close-button' onClick={onDecline}>
					×
				</button>
				<div className='downsell-content'>
					<h2 className='downsell-headline'>
						Wait! Try Risk-Free for 7 Days 🎁
					</h2>
					<div className='downsell-offer'>
						<p className='offer-text'>
							Not ready to commit? We understand!
							<br />
							<strong>Try Positive Postcards for just $7</strong>
						</p>
						<div className='trial-features'>
							<div className='feature'>
								<span className='icon'>📬</span>
								<span>7-day trial with daily postcards</span>
							</div>
							<div className='feature'>
								<span className='icon'>❌</span>
								<span>Cancel anytime</span>
							</div>
							<div className='feature'>
								<span className='icon'>💳</span>
								<span>Only $7 total</span>
							</div>
						</div>
						<p className='risk-free'>
							Experience the joy of receiving daily affirmations
							<br />
							with absolutely no risk!
						</p>
					</div>
					<div className='downsell-actions'>
						<button className='accept-button' onClick={onAccept}>
							Yes! Let Me Try for $7
						</button>
						<button className='decline-button' onClick={onDecline}>
							No thanks, I'll continue with my order
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DownsellModal;
