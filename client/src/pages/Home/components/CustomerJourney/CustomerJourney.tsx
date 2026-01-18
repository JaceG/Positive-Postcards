import React from 'react';
import './CustomerJourney.css';

const CustomerJourney: React.FC = () => {
  return (
    <section className="customer-journey" id="how-it-works">
      <div className="section-header">
        <h2>Your Transformation Journey</h2>
        <p>See how daily postcards can create lasting change</p>
      </div>
      <div className="journey-timeline">
        <div className="journey-line"></div>
        <div className="journey-step">
          <div className="step-marker">1</div>
          <h3>Day 1: First Smile</h3>
          <p>Among bills and junk mail, a beautiful postcard brightens your day</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">7</div>
          <h3>Week 1: Anticipation</h3>
          <p>Checking mail becomes exciting. Others notice your improved mood</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">30</div>
          <h3>Month 1: New Ritual</h3>
          <p>Create a "positivity wall" to glance at when feeling stressed</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">∞</div>
          <h3>The Future: Transformed</h3>
          <p>Share the gift with others and continue building positive habits</p>
        </div>
      </div>
    </section>
  );
};

export default CustomerJourney;
