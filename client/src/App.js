import { useState, useEffect } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import "./App.css";

const socket = io.connect("https://my-code-collab.onrender.com");

function App() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript"); // <--- NEW STATE
  const [isJoined, setIsJoined] = useState(false);
  const [notification, setNotification] = useState("");

  // --- 1. SOCKET LISTENERS ---
  useEffect(() => {
    socket.on("receive_code", (data) => {
      setCode(data);
    });

    socket.on("notification", (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(""), 3000);
    });
  }, []);

  // --- 2. FUNCTIONS ---
  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", { room, username });
      setIsJoined(true);
    } else {
      alert("Please enter both a Room ID and a Username!");
    }
  };

  const generateRoomId = () => {
    setRoom(Math.random().toString(36).substring(7));
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(room);
    setNotification("ID COPIED TO CLIPBOARD");
  };

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("code_change", { code: value, room });
  };

  // Handle Language Change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // --- 3. THE DESIGN ---
  return (
    <div className="App" style={{ 
      minHeight: "100vh", 
      backgroundColor: "#000000", 
      color: "white", 
      fontFamily: "'Courier New', Courier, monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      
      <h1 style={{ marginTop: "30px", fontSize: "3rem", letterSpacing: "5px", textShadow: "2px 2px #333" }}>
        CODE COLLAB
      </h1>

      {!isJoined ? (
        // --- LOGIN SCREEN ---
        <div style={{ marginTop: "50px", backgroundColor: "#000", border: "2px solid white", padding: "40px", width: "400px", textAlign: "center", boxShadow: "10px 10px 0px white" }}>
          <h3 style={{ marginBottom: "30px", fontSize: "1.2rem", textTransform: "uppercase" }}>Enter The Room</h3>
          
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{display:"block", marginBottom:"8px", fontSize:"0.9rem", fontWeight: "bold"}}>USERNAME</label>
            <input onChange={(e) => setUsername(e.target.value)} style={{ width: "93%", padding: "12px", backgroundColor: "black", border: "1px solid white", color: "white", fontFamily: "inherit", fontSize: "1rem", outline: "none" }} />
          </div>

          <div style={{ marginBottom: "40px", textAlign: "left" }}>
            <label style={{display:"block", marginBottom:"8px", fontSize:"0.9rem", fontWeight: "bold"}}>ROOM ID</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input value={room} onChange={(e) => setRoom(e.target.value)} style={{ flex: 1, padding: "12px", backgroundColor: "black", border: "1px solid white", color: "white", fontFamily: "inherit", fontSize: "1rem", outline: "none" }} />
              <button onClick={generateRoomId} style={{ padding: "0 20px", backgroundColor: "white", color: "black", border: "none", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>GEN</button>
            </div>
          </div>

          <button onClick={joinRoom} style={{ width: "100%", padding: "15px", backgroundColor: "white", color: "black", border: "none", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", letterSpacing: "2px", fontFamily: "inherit", textTransform: "uppercase" }}>Join Room</button>
        </div>
      ) : (
        // --- EDITOR SCREEN ---
        <div style={{ width: "90%", marginTop: "20px" }}>
          
          {/* INFO BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "10px", borderBottom: "1px solid white", paddingBottom: "8px", height: "30px" }}>
            
            {/* Left Side: Room, User, AND Language Selector */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <span>ROOM: <b>{room}</b> <button onClick={copyRoomId} style={{marginLeft:"5px", background:"none", border:"1px solid white", color:"white", cursor:"pointer", padding: "0px 5px", fontSize:"0.8rem"}}>COPY</button></span>
              <span>USER: <b>{username}</b></span>
              
              {/* LANGUAGE SELECTOR */}
              <select 
                value={language} 
                onChange={handleLanguageChange}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  border: "1px solid white",
                  padding: "2px 5px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* Notification */}
            <div style={{ color: "#0f0", fontSize: "0.9rem", fontWeight: "bold", opacity: notification ? 1 : 0, transition: "opacity 0.3s ease" }}>
              {notification ? `> ${notification}` : ""}
            </div>
          </div>

          {/* MONACO EDITOR */}
          <div style={{ border: "1px solid white", height: "70vh" }}>
            <Editor
              height="100%"
              language={language} // <--- CONNECTED TO DROPDOWN
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                wordWrap: "on",
                padding: { top: 20 }
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
}

export default App;