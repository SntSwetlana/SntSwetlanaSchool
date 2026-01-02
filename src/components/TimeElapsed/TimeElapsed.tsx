import React, { useState, useEffect } from 'react';
import './../PracticeStats/PracticeStats.css';

const TimeElapsed = ({ isActive = true }) => {
  const [time, setTime] = useState(0); // время в секундах

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const formatted = formatTime(time);

  return (
    <section className="statistic-container time-elapsed">
      <h2 className="statistic-header">
        <div className="text-container">
          <span className="statistic-text">Time<br />elapsed</span>
          <span className="extra-header-text"></span>
          <span className="statistic-text short">Time</span>
        </div>
      </h2>
      <section className="statistic-content">
        <section className="practice-timer">
          <table className="timer">
            <tbody>
              <tr className="time-values">
                <td headers="hours-label" className="hours-value">{formatted.hours}</td>
                <td headers="minutes-label" className="minutes-value">{formatted.minutes}</td>
                <td headers="seconds-label" className="seconds-value">{formatted.seconds}</td>
              </tr>
              <tr className="time-labels">
                <th id="hours-label" className="hours-label">hr</th>
                <th id="minutes-label" className="minutes-label">min</th>
                <th id="seconds-label" className="seconds-label">sec</th>
              </tr>
            </tbody>
          </table>
        </section>
      </section>
    </section>
  );
};

export default TimeElapsed;