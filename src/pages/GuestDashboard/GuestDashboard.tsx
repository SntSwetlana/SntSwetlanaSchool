// pages/GuestDashboard.tsx
import React from 'react';

const GuestDashboard: React.FC = () => {
  // Тяжелый компонент загружается только для админов
  return (
    <div className="guest-dashboard">
      <h1>Guest Dashboard</h1>
    </div>
  );
};

export default GuestDashboard;