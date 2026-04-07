import React, { useState } from "react";
import { login, register, predict } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = mode === "login"
      ? await login(username, password)
      : await register(username, password);

    if (res.status === "ok" || res.status === "created") {
      setUser(username);
    } else {
      alert("Fail");
    }
  };

  const handleDetect = async () => {
    const res = await predict(file, user);
    setResult(res);
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h1>{mode === "login" ? "Login" : "Register"}</h1>
        <form onSubmit={handleAuth}>
          <input name="username" placeholder="Username" /><br /><br />
          <input name="password" type="password" /><br /><br />
          <button type="submit">Submit</button>
        </form>
        <br />
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          Switch
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>🔌 Circuit Detection</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />

      <button onClick={handleDetect}>Detect</button>

      {result && (
        <div>
          <h2>Total: {result.total}</h2>
          <img
            src={`data:image/png;base64,${result.image}`}
            width="400"
            alt="result"
          />
          <pre>{JSON.stringify(result.details, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
