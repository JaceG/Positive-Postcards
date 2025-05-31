import React from 'react';
import './ProblemStats.css';

interface StatItemProps {
  number: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ number, label }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const ProblemStats: React.FC = () => {
  return (
    <div className="problem-stats">
      <h2 className="problem-title">
        The Hidden Crisis: We're More Connected Yet More Isolated Than Ever
      </h2>
      <div className="stats-grid">
        <StatItem 
          number="42%" 
          label="of adults report anxiety or depression symptoms"
        />
        <StatItem 
          number="160+" 
          label="times we check our phones daily"
        />
        <StatItem 
          number="91%" 
          label="of Gen Z experiences physical stress"
        />
        <StatItem 
          number="89%" 
          label="feel joy receiving personal mail"
        />
      </div>
    </div>
  );
};

export default ProblemStats;