import { useState } from "react";
import { loginUser, registerUser } from "../api/apicalls";
import "./Login.css";

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const showMessage = (message) => {
    setPopupText(message);
    setShowPopup(true);
    window.setTimeout(() => {
      setShowPopup(false);
      setPopupText("");
    }, 2000);
  };

  const changeView = () => {
    setIsLogin((prev) => !prev);
  };

  const isValidEmail = (value) => {
    const atPosition = value.indexOf("@");
    const dotPosition = value.lastIndexOf(".");
    return !(
      atPosition < 1 ||
      dotPosition < atPosition + 2 ||
      dotPosition + 2 >= value.length
    );
  };

  const loginOrRegister = async () => {
    if (!isValidEmail(emailId)) {
      showMessage("Invalid EmailID");
      return;
    }

    const normalizedEmail = emailId.toLowerCase();

    try {
      if (isLogin) {
        const data = await loginUser(normalizedEmail, password);
        if (data.success) {
          onLogin({
            email: normalizedEmail,
            username: data.username,
          });
        } else {
          showMessage(data.message || "Login failed");
        }
        return;
      }

      const data = await registerUser(normalizedEmail, password, username);
      if (data.success) {
        onLogin({
          email: normalizedEmail,
          username,
        });
      } else {
        showMessage(data.message || "Registration failed");
      }
    } catch (error) {
      showMessage("Unable to process request");
    }
  };

  return (
    <>
      <div className="login-content">
        <div className="login-form">
          <h1>{isLogin ? "Welcome Back" : "Create Your Account"}</h1>
          <p className="login-subtitle">
            {isLogin
              ? "Sign in to process your images and access previous OCR history."
              : "Register once and keep all your extracted text in one place."}
          </p>

          <label htmlFor="email-input">Email Address</label>
          <input
            id="email-input"
            autoComplete="off"
            type="email"
            placeholder="Email Id"
            value={emailId}
            onChange={(event) => setEmailId(event.target.value)}
          />
          {!isLogin && (
            <>
              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                autoComplete="off"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </>
          )}
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            autoComplete="off"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="button" onClick={loginOrRegister}>
            {isLogin ? "Login" : "Register & Login"}
          </button>
          <h4 className="toggle-auth" onClick={changeView}>
            {isLogin ? "Not yet Registered?" : "Already Registered?"}
          </h4>
        </div>
      </div>
      {showPopup && <h4 className="errorText">{popupText}</h4>}
    </>
  );
}

export default Login;
