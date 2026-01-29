// pages/GuestDashboard.tsx
import { useState} from 'react';
import './TestDashboard.css';
import Quizlets from '../../components/Quizlets';
import { useAuth } from '../../contexts/AuthContext';

interface TestDashboardProps {
    name: string;
}

const TestDashboard: React.FC<TestDashboardProps> = ({ name }) => {
    const [showQuizlets, setShowQuizlets] = useState(false);
     const { userData } = useAuth();
    const hndlQuizComponentClick = () => {
        if (!showQuizlets)
            setShowQuizlets(true);
        else
            setShowQuizlets(false);
    };
  // Тяжелый компонент загружается только для админов
  return (
    <div className="test-dashboard">
      <button   className="basegrammar-button">Base grammar exercises</button>
      <button   className="quizlets-button"
        onClick={hndlQuizComponentClick}
      >
        quizlet component
      </button>
      {showQuizlets && <Quizlets name={userData?.username} />}
    </div>
  );
};
export default TestDashboard;