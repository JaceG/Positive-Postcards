import React from 'react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  return (
    <section className="testimonials">
      <div className="section-header">
        <h2>What You Could Experience</h2>
        <p>Imagine starting each day with positivity</p>
      </div>
      <div className="testimonial-slider">
        <div className="quote-mark">"</div>
        <p className="testimonial-text">
          Imagine getting a Positive Postcard each day that completely changes your morning routine. 
          It's like receiving a hug through the mail. You'll want to keep every single one and 
          share the experience with friends going through tough times.
        </p>
        <div className="testimonial-author">
          <div className="author-avatar"></div>
          <div className="author-info">
            <div className="author-name">Your Future Self</div>
            <div className="author-details">Starting a journey of daily positivity</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
