import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout.jsx"
import { PlayPage } from "./pages/PlayPage.jsx"
import { FriendsPage } from "./pages/FriendsPage.jsx"
import { TasksPage } from "./pages/TasksPage.jsx"
import { BoostPage } from "./pages/BoostPage.jsx"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PlayPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/boost" element={<BoostPage />} />
      </Route>
    </Routes>
  )
}

export default App