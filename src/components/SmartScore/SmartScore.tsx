import React, { useState } from 'react';
import './../PracticeStats/PracticeStats.css';

const SmartScore = ({ score = 0, showHelp = true }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTooltipToggle = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <section className="statistic-container smartscore">
      <h2 className="statistic-header">
        <div className="text-container">
          <span className="statistic-text">SmartScore</span>
          <span className="extra-header-text"></span>
        </div>
        <div className="subheader-container">
          <section className="statistic-subheader smartscore">
            <h3 className="subheader-text">out of 100</h3>
          </section>
          {showHelp && (
            <section className="help-info-container smartscore">
              <img 
                className="question-mark-icon" 
                src="data:image/svg+xml,%3csvg width='14' height='15' viewBox='0 0 14 15' fill='none' xmlns='http://www.w3.org/2000/svg'%3e %3ccircle cx='7' cy='7' r='7' fill='white'/%3e %3cpath d='M6.42578 9.38477C6.42188 9.24414 6.41992 9.13867 6.41992 9.06836C6.41992 8.6543 6.47852 8.29688 6.5957 7.99609C6.68164 7.76953 6.82031 7.54102 7.01172 7.31055C7.15234 7.14258 7.4043 6.89844 7.76758 6.57812C8.13477 6.25391 8.37305 5.99609 8.48242 5.80469C8.5918 5.61328 8.64648 5.4043 8.64648 5.17773C8.64648 4.76758 8.48633 4.4082 8.16602 4.09961C7.8457 3.78711 7.45312 3.63086 6.98828 3.63086C6.53906 3.63086 6.16406 3.77148 5.86328 4.05273C5.5625 4.33398 5.36523 4.77344 5.27148 5.37109L4.1875 5.24219C4.28516 4.44141 4.57422 3.82813 5.05469 3.40234C5.53906 2.97656 6.17773 2.76367 6.9707 2.76367C7.81055 2.76367 8.48047 2.99219 8.98047 3.44922C9.48047 3.90625 9.73047 4.45898 9.73047 5.10742C9.73047 5.48242 9.64258 5.82812 9.4668 6.14453C9.29102 6.46094 8.94727 6.8457 8.43555 7.29883C8.0918 7.60352 7.86719 7.82812 7.76172 7.97266C7.65625 8.11719 7.57812 8.2832 7.52734 8.4707C7.47656 8.6582 7.44727 8.96289 7.43945 9.38477H6.42578ZM6.36133 11.5V10.2988H7.5625V11.5H6.36133Z' fill='%23E76836'/%3e %3c/svg%3e" 
                alt="Help"
                onClick={handleTooltipToggle}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ cursor: 'pointer' }}
              />
              {showTooltip && (
                <section className="tool-tip-content">
                  <p className="tool-tip-text">
                    SmartScore is a dynamic measure of progress towards mastery, rather than a percentage grade. 
                    It tracks your skill level as you tackle progressively more difficult questions. 
                    Consistently answer questions correctly to reach excellence (90), or conquer the Challenge Zone to achieve mastery (100)! 
                    <a href="https://www.snt.com/materials/SmartScore_Guide.pdf" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </p>
                </section>
              )}
            </section>
          )}
        </div>
      </h2>
      <section className="statistic-content">
        <section className="smartscore-container" id="smartscore-container-id">
          <span className="dynamic-height-smartscore-goal-container" style={{ height: '0px' }}></span>
          <div className="current-smartscore" data-cy="current-smartscore">
            <span className="smartscore-text">{score}</span>
            <img 
              className="checkmark" 
              src="data:image/svg+xml,%3csvg width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'%3e %3cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.4807 15.5C11.2264 15.5 10.9815 15.39 10.8024 15.1931L8.27078 12.4106C7.9041 12.0076 7.91067 11.3611 8.28536 10.9667C8.65985 10.5721 9.26092 10.5796 9.6278 10.9822L11.3868 12.9157L16.2921 5.90717C16.6075 5.4569 17.2022 5.36587 17.6216 5.70546C18.0405 6.0446 18.1243 6.68467 17.8092 7.13517L12.2391 15.093C12.0727 15.3308 11.8182 15.4786 11.5419 15.4978C11.5216 15.4993 11.5013 15.5 11.4807 15.5Z' fill='%234E90ED'/%3e %3c/svg%3e" 
              alt="checkmark-icon" 
              style={{ opacity: score >= 100 ? 1 : 0 }}
            />
            <div className="smartscore-checkmark-tooltip-container" style={{ opacity: score >= 100 ? 1 : 0 }}>
              <span className="check-tooltip">You met your goal!</span>
            </div>
          </div>
        </section>
        <div className="">
          <section className="ribbons"></section>
          <section className="medals">
            <img 
              className="gold-medal" 
              src="data:image/png;base64,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" 
              alt="Gold Medal" 
            />
          </section>
        </div>
      </section>
      <section className="break-link">
        <a href="https://www.snt.com/recommendations/" target="_blank" rel="noopener noreferrer">
          Need a break?
        </a>
      </section>
    </section>
  );
};

export default SmartScore;