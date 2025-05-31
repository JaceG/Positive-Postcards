import React from 'react';
import './Business.css';
import BusinessHero from './components/BusinessHero/BusinessHero';
import BusinessUseCases from './components/BusinessUseCases/BusinessUseCases';
import BusinessBenefits from './components/BusinessBenefits/BusinessBenefits';
import BusinessTestimonials from './components/BusinessTestimonials/BusinessTestimonials';
import BusinessCTA from './components/BusinessCTA/BusinessCTA';
import BusinessPricing from './components/BusinessPricing/BusinessPricing';

const Business: React.FC = () => {
	return (
		<div className='business-page'>
			<BusinessHero />
			<BusinessUseCases />
			<BusinessBenefits />
			<BusinessPricing />
			<BusinessTestimonials />
			<BusinessCTA />
		</div>
	);
};

export default Business;
