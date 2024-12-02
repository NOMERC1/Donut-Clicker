from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, Float
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
import traceback
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)
engine = create_engine("sqlite:///clicker.db")
Base = declarative_base()
session_factory = sessionmaker(bind=engine)
session = scoped_session(session_factory)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    coins = Column(Integer, default=0)
    max_energy = Column(Integer, default=500)
    coins_per_click = Column(Float, default=1.0)
    completed_tasks_status = Column(JSON, default={"telegram": False, "vk": False, "omstu": False})
    last_tap_boost = Column(Float, default=0)
    last_full_tank = Column(Float, default=0)
    current_energy = Column(Integer, default=500)
    last_energy_update = Column(Float, default=datetime.now().timestamp())

Base.metadata.create_all(engine)

@app.route("/get_user_data", methods=["GET"])
def get_user_data():
    try:
        user = session.query(User).filter_by(id=1).first()
        if not user:
            user = User(
                coins=0, 
                max_energy=500,
                current_energy=500, 
                coins_per_click=1.0, 
                completed_tasks_status={"telegram": False, "vk": False, "omstu": False},
                last_energy_update=datetime.now().timestamp(),
            )
            session.add(user)
            session.commit()
        
        current_time = datetime.now().timestamp()
        cooldown_period = 8*60*60
        remaining_tap_boost_time = max(0, cooldown_period - (current_time - user.last_tap_boost))if user.last_tap_boost else 0
        remaining_full_tank_time = max(0, cooldown_period - (current_time - user.last_full_tank))if user.last_full_tank else 0
        seconds_since_last_update = current_time - user.last_energy_update
        energy_to_restore = int(seconds_since_last_update / 3)
        
        if energy_to_restore > 0:
            user.current_energy = min(user.current_energy + energy_to_restore, user.max_energy)
            user.last_energy_update = current_time
            session.commit()

        return jsonify({
            "coins": user.coins,
            "current_energy": user.current_energy,
            "max_energy": user.max_energy,
            "coins_per_click": user.coins_per_click,
            "completed_tasks_status": user.completed_tasks_status,
            "remaining_tap_boost_time": remaining_tap_boost_time,
            "remaining_full_tank_time": remaining_full_tank_time
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/save_user_data", methods=["POST"])
def save_user_data():
    data = request.json
    try:
        user = session.query(User).filter_by(id=1).first()
        if user:
            user.coins = data.get("coins", user.coins)
            user.current_energy = data.get("current_energy", user.current_energy)
            user.max_energy = data.get("max_energy", user.max_energy)
            user.coins_per_click = data.get("coins_per_click", user.coins_per_click)
            user.completed_tasks_status = data.get("completed_tasks_status", user.completed_tasks_status)
        else:
            user = User(
                coins=data.get("coins", 0),
                current_energy=data.get("current_energy", 500),
                max_energy=data.get("max_energy", 500),
                coins_per_click=data.get("coins_per_click", 1.0),
                completed_tasks_status=data.get("completed_tasks_status", {"telegram": False, "vk": False, "omstu": False}),
                last_energy_update=datetime.now().timestamp(),
            )
            session.add(user)
        session.commit()
        return jsonify({"message": "Data saved successfully!"}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        session.remove()

@app.route("/complete_task", methods=["POST"])
def complete_task():
    data = request.json
    task = data.get("task")
    coins_earned = data.get("coins", 2000)
    try:
        user = session.query(User).filter_by(id=1).first()
        if user:
            if user.completed_tasks_status.get(task, False):
                return jsonify({"message": "Task already completed!", "coins": user.coins}), 400

            user.completed_tasks_status[task] = True
            flag_modified(user, "completed_tasks_status")
            user.coins += coins_earned
            session.commit()

            return jsonify({"message": "Task completed, coins updated!", "coins": user.coins}), 200
        else:
            return jsonify({"error": "User not found!"}), 404
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        session.remove()

@app.route("/buy_upgrade", methods=["POST"])
def buy_upgrade():
    data = request.json
    upgrade_type = data.get("upgrade_type")
    cost = data.get("cost", 1000)
    try:
        user = session.query(User).filter_by(id=1).first()
        if not user:
            return jsonify({"error": "User not found!"}), 404

        if user.coins < cost:
            return jsonify({"error": "Not enough coins!"}), 400

        user.coins -= cost

        if upgrade_type == "multitap":
            user.coins_per_click *= 10
        elif upgrade_type == "energyLimit":
            if user.max_energy >= 1000:
                return jsonify({"error": "Energy limit already reached!"}), 400
            user.max_energy = 1000
        else:
            return jsonify({"error": "Unknown upgrade type!"}), 400
        session.commit()

        return jsonify({
            "message": f"Upgrade {upgrade_type} purchased successfully!",
            "coins": user.coins,
            "coins_per_click": user.coins_per_click,
            "max_energy": user.max_energy
        }), 200

    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        session.remove()

@app.route("/tap_boost", methods=["POST"])
def tap_boost():
    try:
        user = session.query(User).filter_by(id=1).first()
        if not user:
            return jsonify({"error": "User not found!"}), 404

        current_time = datetime.now().timestamp()
        cooldown_period = 8*60*60
        if user.last_tap_boost and current_time - user.last_tap_boost < cooldown_period:
            remaining_time = cooldown_period - (current_time - user.last_tap_boost)
            return jsonify({"error": "Cooldown active!", "remaining_time": remaining_time}), 400

        user.coins += 5000
        user.last_tap_boost = current_time
        session.commit()

        return jsonify({"message": "5000 coins added!", "coins": user.coins}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        session.remove()

@app.route("/full_tank", methods=["POST"])
def full_tank():
    try:
        user = session.query(User).filter_by(id=1).first()
        if not user:
            return jsonify({"error": "User not found!"}), 404

        current_time = datetime.now().timestamp()
        cooldown_period = 8 * 60 * 60
        if user.last_full_tank and current_time - user.last_full_tank < cooldown_period:
            remaining_time = cooldown_period - (current_time - user.last_full_tank)
            return jsonify({"error": "Cooldown active!", "remaining_time": remaining_time}), 400

        user.current_energy = user.max_energy
        user.last_full_tank = current_time
        session.commit()
        
        return jsonify({"message": "Energy fully restored!", "current_energy": user.current_energy}), 200
    except Exception as e:
        session.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        session.remove()

if __name__ == "__main__":
    app.run(debug=True)