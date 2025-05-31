import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
	return (
		<footer className='footer'>
			<div className='footer-logo'>Positive Postcards</div>
			<div className='footer-links'>
				<a href='#about'>About Us</a>
				<a href='#story'>Our Story</a>
				<a href='#faq'>FAQ</a>
				<a href='#contact'>Contact</a>
				<a href='#corporate'>Corporate</a>
				<a href='#careers'>Careers</a>
			</div>
			<div className='social-links'>
				<a
					href='https://instagram.com/positivepostcards'
					aria-label='Instagram'>
					📷
				</a>
				<a
					href='https://facebook.com/positivepostcards'
					aria-label='Facebook'>
					📘
				</a>
				<a
					href='https://twitter.com/positivepostcards'
					aria-label='Twitter'>
					🐦
				</a>
				<a
					href='https://pinterest.com/positivepostcards'
					aria-label='Pinterest'>
					📌
				</a>
			</div>
			<p className='copyright'>
				© 2025 Positive Postcards. Spreading joy, one card at a time.
			</p>
		</footer>
	);
};

export default Footer;
