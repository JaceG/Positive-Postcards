import React from 'react';
import ProblemStats from '../ProblemStats/ProblemStats';
import './Hero.css';

interface PostcardProps {
	className: string;
	message: string;
}

const PostcardPreview: React.FC<PostcardProps> = ({ className, message }) => (
	<div className={`floating-postcard ${className}`}>
		<div className='postcard-content'>"{message}"</div>
	</div>
);

const Hero: React.FC = () => {
	return (
		<section className='hero'>
			<ProblemStats />

			<div className='hero-content'>
				<div className='hero-text'>
					<h1>
						Transform Your Mindset
						<br />
						<span className='gradient-text'>
							One Postcard at a Time
						</span>
					</h1>

					<p className='hero-subtitle'>
						While digital wellness apps add to screen fatigue, we
						deliver tangible joy through beautiful affirmation
						postcards that create lasting positive change.
					</p>

					<div className='value-points'>
						<div className='value-point'>
							<div className='value-icon'>💌</div>
							<div className='value-text'>
								Physical mail creates 2.5x stronger emotional
								impact than digital messages
							</div>
						</div>
						<div className='value-point'>
							<div className='value-icon'>🌱</div>
							<div className='value-text'>
								Daily positive reinforcement rewires your brain
								for happiness
							</div>
						</div>
						<div className='value-point'>
							<div className='value-icon'>🎁</div>
							<div className='value-text'>
								Perfect gift that keeps giving for months, not
								moments
							</div>
						</div>
					</div>

					<div className='cta-section'>
						<div className='founding-badge'>
							🎉 Limited Time: Founding Member Pricing - Save 50%
						</div>
						<div className='cta-buttons'>
							<a href='#pricing' className='btn btn-primary'>
								Start Your Journey
							</a>
						<span className='price-note'>
							From <strong>just $2/day</strong>
						</span>
						</div>
					</div>
				</div>

				<div className='postcard-showcase'>
					<PostcardPreview
						className='postcard-1'
						message='You are capable of amazing things'
					/>
					<PostcardPreview
						className='postcard-2'
						message="Today's challenges are tomorrow's strengths"
					/>
					<PostcardPreview
						className='postcard-3'
						message='Your presence makes the world brighter'
					/>
				</div>
			</div>
		</section>
	);
};

export default Hero;
