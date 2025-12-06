import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Government from "./Government";
import Mypage from "./Mypage";

function App() {
    return (
        <Router>
            <nav style={{ padding: "10px", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
                <Link to="/" style={{ marginRight: "20px" }}>住民票発行 (Government)</Link>
                <Link to="/mypage">マイページ (Mypage)</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Government />} />
                <Route path="/government" element={<Government />} />
                <Route path="/mypage" element={<Mypage />} />
            </Routes>
        </Router>
    );
}

export default App;