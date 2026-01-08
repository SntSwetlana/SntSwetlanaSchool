import './../PracticeStats/PracticeStats.css';

const QuestionsAnswered = ({ count = 0 }) => {
  return (
    <section className="statistic-container problems-attempted">
      <h2 className="statistic-header">
        <div className="text-container">
          <span className="statistic-text">Questions<br />answered</span>
          <span className="extra-header-text"></span>
          <span className="statistic-text short">Questions</span>
        </div>
      </h2>
      <section className="statistic-content">
        {count}
      </section>
    </section>
  );
};

export default QuestionsAnswered;