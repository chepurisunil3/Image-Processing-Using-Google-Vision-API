import { useMemo, useState } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import Main from "./components/Main";

const getInitialUser = () => {
  const saved = sessionStorage.getItem("isLoggedin");
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    sessionStorage.removeItem("isLoggedin");
    return null;
  }
};

function App() {
  const [userData, setUserData] = useState(getInitialUser);
  const isLoggedIn = useMemo(() => Boolean(userData), [userData]);

  const handleLogin = (nextUserData) => {
    sessionStorage.setItem("isLoggedin", JSON.stringify(nextUserData));
    setUserData(nextUserData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedin");
    sessionStorage.clear();
    setUserData(null);
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          <Header userData={userData} onLogout={handleLogout} />
          <Main userData={userData} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
