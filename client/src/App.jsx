import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5050/")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px", fontSize: "22px" }}>
      <h1>Smart Women Safety Route Planner</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;