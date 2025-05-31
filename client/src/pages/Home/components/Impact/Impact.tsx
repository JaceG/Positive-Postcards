import React from 'react';
import './Impact.css';

const Impact: React.FC = () => {
  const impacts = [
    {
      title: 'For Recipients',
      icon: '🌟',
      benefits: [
        'Daily dopamine boost from meaningful mail',
        'Reduced anxiety through positive reinforcement',
        'Improved self-talk and thought patterns',
        'Treasured collection of encouragement'
      ]
    },
    {
      title: 'For Gift Givers',
      icon: '💝',
      benefits: [
        'Gift that keeps giving for months',
        'Maintain connection across any distance',
        'Support loved ones through challenges',
        'More meaningful than one-time gifts'
      ]
    },
    {
      title: 'For Society',
      icon: '🌍',
      benefits: [
        'Accessible mental health support for all',
        'Reduced screen time and digital fatigue',
        'Revival of meaningful postal connections',
        'Sustainable, eco-friendly practices'
      ]
    }
  ];

  return (
    <section className="impact" id="impact">
      <div className="section-header">
        <h2>The Positive Postcards Impact</h2>
        <p>Creating ripples of positivity that extend far beyond the mailbox</p>
      </div>
      <div className="impact-grid">
        {impacts.map((impact, index) => (
          <div key={index} className="impact-card">
            <div className="impact-icon">{impact.icon}</div>
            <h3>{impact.title}</h3>
            <ul className="impact-list">
              {impact.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Impact;
