import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

// Connect to the backend
const socket = io.connect("http://localhost:3001");

function App() {
  const [code, setCode] = useState("// Write your code here...");

  useEffect(() => {
    socket.on("receive_code", (data) => {
      setCode(data);
    });
  }, []);

  const handleChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
    socket.emit("code_change", newCode);
  };

  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>CodeCollab Demo</h1>
      <textarea
        value={code}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "500px",
          fontSize: "16px",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: "20px",
          border: "none",
          outline: "none"
        }}
      />
    </div>
  );
}

export default App;