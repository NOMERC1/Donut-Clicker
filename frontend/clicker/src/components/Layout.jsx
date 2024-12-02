import { Link, Outlet } from "react-router-dom"
import './Layout.css';
import task from "/assets/task.png";
import joystick from "/assets/joystick.png";
import friends from "/assets/friends.png";

function Layout() {
    return (
        <div className="layout">
            <ul className="menu">
                <li>
                    <Link to="/friends" className="menu-button">
                        <img src={friends} alt="Friends Icon" />
                        <span>Friends</span>
                    </Link>
                </li>

                <li>
                    <Link to="/" className="menu-button">
                        <img src={joystick} alt="Play Icon" />
                        <span>Play</span>
                    </Link>
                </li>

                <li>
                    <Link to="/tasks" className="menu-button">
                        <img src={task} alt="Tasks Icon" />
                        <span>Tasks</span>
                    </Link>
                </li>
            </ul>
            <Outlet />
        </div>
    )
}

export { Layout }
