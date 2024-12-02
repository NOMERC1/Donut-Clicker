import React from "react";
import "./FriendsPage.css";
import giftbox from "/assets/giftbox.png";

function FriendsPage() {
  return (
    <div className="friends-page">
      <h1 className="page-title">Invite friends!</h1>
      <div className="content-wrapper">
        <div className="invite-card">
          <div className="invite-card-content">
            <img src={giftbox} alt="GiftBox" className="gift-icon"/>
            <div className="invite-card-info">
              <h3>Invite a Friend</h3>
              <p className="reward-text">
                <span className="highlight">+10,000</span> for you 
              </p>
            </div>
          </div>
        </div>

        <div className="invite-link-card">
          <p className="link-title">My Invite Link</p>
          <div className="invite-link">
            <span className="loading-text">Loading your invite link...</span>
            <button className="copy-button">Copy</button>
          </div>
        </div>
      </div>
      <p className="referrals-text">My Referrals</p>
    </div>
  );
}

export { FriendsPage };