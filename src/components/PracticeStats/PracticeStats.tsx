import { useState } from 'react';
import QuestionsAnswered from './../QuestionsAnswered/QuestionsAnswered';
import TimeElapsed from './../TimeElapsed/TimeElapsed';
import SmartScore from './../SmartScore/SmartScore';
import './PracticeStats.css';

const PracticeStats = () => {
  const [questionsCount] = useState(0);
  const [smartScore] = useState(0);
  const [isTimerActive] = useState(true);

  // Функции для обновления состояния (можно вызвать из родительского компонента)
  /*const incrementQuestions = () => {
    setQuestionsCount(prev => prev + 1);
  };

  const updateSmartScore = (newScore: number) => {
    setSmartScore(Math.min(100, Math.max(0, newScore)));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };
*/
  return (
    <section className="practice-stats-container">
      <aside className="practice-statistics" aria-label="practice statistics">
        <div className="problems-and-timer-container">
          <QuestionsAnswered count={questionsCount} />
          <TimeElapsed isActive={isTimerActive} />
        </div>
        <SmartScore score={smartScore} />
      </aside>
    </section>
  );
};

export default PracticeStats;