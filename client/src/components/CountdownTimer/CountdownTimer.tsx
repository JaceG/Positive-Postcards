import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
	initialMinutes?: number;
	onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
	initialMinutes = 30,
	onExpire,
}) => {
	// Get or set initial time in localStorage
	const getInitialTime = () => {
		const savedEndTime = localStorage.getItem('promoEndTime');
		if (savedEndTime) {
			const remaining = parseInt(savedEndTime) - Date.now();
			if (remaining > 0) {
				return Math.floor(remaining / 1000);
			}
		}
		// Set new end time
		const endTime = Date.now() + initialMinutes * 60 * 1000;
		localStorage.setItem('promoEndTime', endTime.toString());
		return initialMinutes * 60;
	};

	const [timeLeft, setTimeLeft] = useState(getInitialTime);
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		if (timeLeft <= 0 && !isExpired) {
			setIsExpired(true);
			localStorage.removeItem('promoEndTime');
			onExpire?.();
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, isExpired, onExpire]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs
			.toString()
			.padStart(2, '0')}`;
	};

	if (isExpired) {
		return null;
	}

	const urgencyClass =
		timeLeft <= 300 ? 'urgent' : timeLeft <= 600 ? 'warning' : '';

	return (
		<div className={`countdown-timer ${urgencyClass}`}>
			<div className='timer-content'>
				<span className='timer-icon'>⏰</span>
				<div className='timer-text'>
					<div className='timer-label'>Limited Time Offer!</div>
					<div className='timer-display'>{formatTime(timeLeft)}</div>
				</div>
			</div>
		</div>
	);
};

export default CountdownTimer;
