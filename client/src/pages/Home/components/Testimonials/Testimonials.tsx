import React from 'react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  return (
    <section className="testimonials">
      <div className="section-header">
        <h2>Stories of Transformation</h2>
        <p>Real people, real change, one postcard at a time</p>
      </div>
      <div className="testimonial-slider">
        <div className="quote-mark">"</div>
        <p className="testimonial-text">
          Getting a Positive Postcard each day completely changed my morning routine. 
          It's like receiving a hug through the mail. I've kept every single one and 
          have gifted 12 subscriptions to friends going through tough times.
        </p>
        <div className="testimonial-author">
          <div className="author-avatar"></div>
          <div className="author-info">
            <div className="author-name">Sarah M.</div>
            <div className="author-details">Marketing Manager • Member since Day 1</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
