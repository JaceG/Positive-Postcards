import React from 'react';
import './CustomerJourney.css';

const CustomerJourney: React.FC = () => {
  return (
    <section className="customer-journey" id="how-it-works">
      <div className="section-header">
        <h2>Sarah's Transformation Journey</h2>
        <p>See how daily postcards created lasting change</p>
      </div>
      <div className="journey-timeline">
        <div className="journey-line"></div>
        <div className="journey-step">
          <div className="step-marker">1</div>
          <h3>Day 1: First Smile</h3>
          <p>Among bills and junk mail, a beautiful postcard brightens her stressful day</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">7</div>
          <h3>Week 1: Anticipation</h3>
          <p>Checking mail becomes exciting. Partner notices her improved mood</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">30</div>
          <h3>Month 1: New Ritual</h3>
          <p>Creates a "positivity wall" that she glances at when stressed</p>
        </div>
        <div className="journey-step">
          <div className="step-marker">365</div>
          <h3>Year 1: Transformed</h3>
          <p>Gifted 12 subscriptions. Therapist notes significant improvement</p>
        </div>
      </div>
    </section>
  );
};

export default CustomerJourney;
