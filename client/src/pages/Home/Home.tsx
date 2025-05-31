import React, { useState } from 'react';
import Hero from './components/Hero/Hero';
import CustomerJourney from './components/CustomerJourney/CustomerJourney';
import UseCases from './components/UseCases/UseCases';
import Pricing from './components/Pricing/Pricing';
import Impact from './components/Impact/Impact';
import Testimonials from './components/Testimonials/Testimonials';
import FinalCTA from './components/FinalCTA/FinalCTA';
import PromoOfferBanner from '../../components/PromoOfferBanner/PromoOfferBanner';

const Home: React.FC = () => {
	const [showPromo, setShowPromo] = useState(true);

	const handlePromoExpire = () => {
		setShowPromo(false);
	};

	return (
		<>
			<Hero />
			<CustomerJourney />
			<UseCases />
			{showPromo && (
				<PromoOfferBanner
					onExpire={handlePromoExpire}
					variant='trial'
				/>
			)}
			<Pricing />
			<Impact />
			<Testimonials />
			<FinalCTA />
		</>
	);
};

export default Home;
