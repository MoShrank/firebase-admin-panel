import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Collections from "./pages/Collections/Collections";
import Collection from "./pages/Collection/Collection";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <Routes>
        <Route path="/" element={<Collections />} />
        <Route path="collection/:id" element={<Collection />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
