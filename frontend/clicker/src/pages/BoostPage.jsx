import React, { useState, useEffect } from "react";
import "./BoostPage.css";
import fire from "/assets/fire.png";
import flash from "/assets/flash.png";
import blast from "/assets/blast.png";
import robot from "/assets/robot.png";
import donutcoin from "/assets/donutcoin.png";

function BoostPage() {
  const [coins, setCoins] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [tapBoostCooldown, setTapBoostCooldown] = useState(0);
  const [isTapBoostDisabled, setIsTapBoostDisabled] = useState(false);
  const [fullTankCooldown, setFullTankCooldown] = useState(0);
  const [isFullTankDisabled, setIsFullTankDisabled] = useState(false);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState({multitap: false, energyLimit: false,});

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_user_data");
      const data = await response.json();
      setCoins(data.coins);
      setCoinsPerClick(data.coins_per_click);
      setMaxEnergy(data.max_energy || 500);
      setPurchasedUpgrades({multitap: data.coins_per_click > 1, energyLimit: data.max_energy > 500,});
      
      if (data.remaining_tap_boost_time > 0) {
        setTapBoostCooldown(data.remaining_tap_boost_time);
        setIsTapBoostDisabled(true);
      }
      
      if (data.remaining_full_tank_time > 0) {
        setFullTankCooldown(data.remaining_full_tank_time);
        setIsFullTankDisabled(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const buyUpgrade = async (upgradeType, cost) => {
    if (purchasedUpgrades[upgradeType]) return;

    if (coins < cost) {
      alert("Not enough coins!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/buy_upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upgrade_type: upgradeType, cost }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setCoins(data.coins);

        if (upgradeType === "multitap") {
          setCoinsPerClick(data.coins_per_click);
          setPurchasedUpgrades((prev) => ({ ...prev, multitap: true }));
        }

        if (upgradeType === "energyLimit") {
          setMaxEnergy(1000);
          setPurchasedUpgrades((prev) => ({ ...prev, energyLimit: true }));
        }
      } else {
        alert(data.error || "Failed to purchase upgrade.");
      }
    } catch (error) {
      console.error("Error purchasing upgrade:", error);
    }
  };

  const handleTapBoost = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/tap_boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        setCoins(data.coins);
        setIsTapBoostDisabled(true);
        setTapBoostCooldown(8 * 60 * 60);
      } else {
        alert(data.error || "Error during Tap Boost!");
        
        if (data.remaining_time) {
          setTapBoostCooldown(data.remaining_time);
        }
      }
    } catch (error) {
      console.error("Error with Tap Boost:", error);
    }
  };

  const handleFullTank = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/full_tank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        setMaxEnergy(data.current_energy);
        setIsFullTankDisabled(true);
        setFullTankCooldown(8 * 60 * 60);
      } else {
        alert(data.error || "Error during Full Tank!");
        
        if (data.remaining_time) {
          setFullTankCooldown(data.remaining_time);
        }
      }
    } catch (error) {
      console.error("Error with Full Tank:", error);
    }
  };

  useEffect(() => {
    if (tapBoostCooldown > 0) {
      const interval = setInterval(() => {
        setTapBoostCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTapBoostDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tapBoostCooldown]);

  useEffect(() => {
    if (fullTankCooldown > 0) {
      const interval = setInterval(() => {
        setFullTankCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFullTankDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [fullTankCooldown]);

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="boost-page">
      <h1 className="page-title">Your Daily Bonus</h1>

      <div className="boost-controls">
        <div className={`control-button left-align ${isTapBoostDisabled ? "disabled" : ""}`} onClick={!isTapBoostDisabled ? handleTapBoost : null}>
          <img src={fire} alt="Tap Boost" className="control-icon"/>
          <div className="control-info">
            <p className="control-title">Tap Boost</p>
            <p className="control-subtext">{isTapBoostDisabled ? "0/1" : "1/1"}{" "}{tapBoostCooldown > 0 && `(${Math.floor(tapBoostCooldown/3600)}h ${Math.floor(tapBoostCooldown/60)%60}m)`}</p>
          </div>
        </div>
        
        <div className={`control-button right-align ${isFullTankDisabled ? "disabled" : ""}`} onClick={!isFullTankDisabled ? handleFullTank : null}>
          <img src={flash} alt="Full Tank" className="control-icon"/>
          <div className="control-info">
            <p className="control-title">Full Tank</p>
            <p className="control-subtext">{isFullTankDisabled ? "0/1" : "1/1"}{" "}{fullTankCooldown > 0 && `(${Math.floor(fullTankCooldown/3600)}h ${Math.floor(fullTankCooldown/60)%60}m)`}</p>
          </div>
        </div>
      </div>

      <h2 className="boosters-title">Boosters:</h2>

      <div className="boosters">
        <div className={`booster-card ${purchasedUpgrades.multitap ? "disabled" : ""}`} onClick={() => buyUpgrade("multitap", 1000)}>
          <img src={blast} alt="Multitap" className="booster-icon"/>
          <div className="booster-info">
            <h3>Multitap</h3>
            <p>
              <img src={donutcoin} alt="DonutCoin" className="donut-icon"/> 1000 | +10x Coins per Click
            </p>
          </div>
          {purchasedUpgrades.multitap && <span className="checkmark">✔</span>}
        </div>

        <div className={`booster-card ${purchasedUpgrades.energyLimit ? "disabled" : ""}`} onClick={() => buyUpgrade("energyLimit", 1000)}>
          <img src={flash} alt="Energy Limit" className="booster-icon"/>
          <div className="booster-info">
            <h3>Energy Limit</h3>
            <p>
              <img src={donutcoin} alt="DonutCoin" className="donut-icon"/> 1000 | +500 Energy
            </p>
          </div>
          {purchasedUpgrades.energyLimit && <span className="checkmark">✔</span>}
        </div>

        <div className="booster-card">
          <img src={robot} alt="Tap Bot" className="booster-icon"/>
          <div className="booster-info">
            <h3>Tap Bot</h3>
            <p>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BoostPage };