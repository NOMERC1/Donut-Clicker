import React, { useEffect, useState } from 'react';
import './TasksPage.css';
import telegram from '/assets/telegram.png';
import omstu from '/assets/omgtu.png';
import vk from '/assets/vk.png';

function TasksPage() {
  const [counter, setCounter] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({telegram: false, vk: false, omstu: false,});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_user_data");
        const data = await response.json();
        setCounter(data.coins);
        setCompletedTasks(data.completed_tasks_status || { telegram: false, vk: false, omstu: false });
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleTaskClick = async (task, coins, url) => {
    if (!completedTasks[task]) {
      try {
        const response = await fetch("http://127.0.0.1:5000/complete_task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, coins }),
        });
        const data = await response.json();
        if (data.coins) {
          setCounter(data.coins);
          setCompletedTasks((prev) => ({ ...prev, [task]: true }));
        } else if (data.message) {
          alert(data.message);
        }
      } catch (error) {
        console.error("Ошибка при обновлении данных на сервере:", error);
      }
      window.open(url, '_blank');
    }
  };

  return (
    <div className="tasks-page">
      <div className="header">
        <h1>Social Tasks!</h1>
        <p>Your balance: <span className="balance">{counter} coins</span></p>
      </div>

      <div className="task-list">
        <div className={`task-item ${completedTasks.telegram ? 'disabled' : ''}`} onClick={() => handleTaskClick('telegram', 2000, 'https://t.me/omgtu_live')}>
          <div className="task-icon">
            <img src={telegram} alt="Telegram Icon"/>
          </div>
          <div className="task-info">
            <h3>Join Telegram</h3>
            <p>Earn +2000 Coins</p>
          </div>
          {completedTasks.telegram && <span className="checkmark">✔</span>}
        </div>

        <div className={`task-item ${completedTasks.vk ? 'disabled' : ''}`} onClick={() => handleTaskClick('vk', 2000, 'https://vk.com/omskpoliteh')}>
          <div className="task-icon">
            <img src={vk} alt="VK Icon"/>
          </div>
          <div className="task-info">
            <h3>Join VK</h3>
            <p>Earn +2000 Coins</p>
          </div>
          {completedTasks.vk && <span className="checkmark">✔</span>}
        </div>

        <div className={`task-item ${completedTasks.omstu ? 'disabled' : ''}`} onClick={() => handleTaskClick('omstu', 2000, 'https://www.omgtu.ru/')}>
          <div className="task-icon">
            <img src={omstu} alt="OMSTU Icon"/>
          </div>
          <div className="task-info">
            <h3>Apply to OMSTU</h3>
            <p>Earn +2000 Coins</p>
          </div>
          {completedTasks.omstu && <span className="checkmark">✔</span>}
        </div>
      </div>
    </div>
  );
}

export { TasksPage };