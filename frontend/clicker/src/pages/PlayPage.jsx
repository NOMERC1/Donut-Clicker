import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PlayPage.css';
import donut from '/assets/donut.png';
import rocket from '/assets/rocket.png';
import donutcoin from '/assets/donutcoin.png';

function PlayPage() {
  const [counter, setCounter] = useState(0);
  const [energy, setEnergy] = useState(500);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [effects, setEffects] = useState([]);
  const [coinsPerClick, setCoinsPerClick] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_user_data");
        const data = await response.json();
        setCounter(data.coins);
        setEnergy(data.current_energy);
        setMaxEnergy(data.max_energy);
        setCoinsPerClick(data.coins_per_click);
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (energy < maxEnergy) {
      const timer = setInterval(() => {setEnergy((prevEnergy) => Math.min(prevEnergy + 1, maxEnergy));}, 3000);
      return () => clearInterval(timer);
    }
  }, [energy, maxEnergy]);

  const clickHandle = async (e) => {
    if (energy > 0) {
      const newCounter = counter + coinsPerClick;
      setCounter(newCounter);
      setEnergy((prevEnergy) => prevEnergy - 1);
      const { clientX, clientY } = e;
      setEffects((prev) => [...prev, { id: Date.now(), x: clientX, y: clientY, value: coinsPerClick },]);
      setTimeout(() => {setEffects((prev) => prev.filter((effect) => effect.id !== Date.now()));}, 2000);

      try {
        await fetch("http://127.0.0.1:5000/save_user_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coins: newCounter,
            current_energy: energy -1,
            max_energy: maxEnergy,
            coins_per_click: coinsPerClick,
          }),
        });
      } catch (error) {
        console.error("Ошибка при сохранении данных на сервере:", error);
      }
    }
  };

  return (
    <div className="playpage-container">
      <div className="header">
        <div className="coin-balance">
          <span>Coin balance</span>
          <div className="coin-display">
            <img src={donutcoin} alt="DonutCoin" width={30} height={30}/>
            <h1>{counter}</h1>
          </div>
        </div>

        <div className="energy-bar">
          <span>Energy: {energy}/{maxEnergy}</span>
          <div className="energy-progress">
            <div className="energy-fill" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="box" style={{ position: 'relative' }}>
        <img src={donut} alt="Donut" width={256} height={256} onClick={clickHandle}/>
        <img src={donut} alt="Donut" width={256} height={256} style={{ position: 'absolute', zIndex: '-1', filter: 'blur(15px)' }}/>
        {effects.map((effect) => (<span key={effect.id} className="click-effect" style={{top: effect.y - 20, left: effect.x - 10,}}> +{effect.value}</span>))}
      </div>

      <Link to="/boost" className="boost-button">
        <img src={rocket} alt="Boost Icon"/>
        <span>Boost</span>
      </Link>
    </div>
  );
}
export { PlayPage };