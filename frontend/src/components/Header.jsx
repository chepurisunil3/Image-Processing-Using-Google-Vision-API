import "./Header.css";

function Header({ userData, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <h2>Sunny Labs Image Intelligence</h2>
          <p>
            Upload images, extract text, and revisit your history instantly.
          </p>
        </div>
        <div className="header-actions">
          <div className="user-badge">{userData?.username}</div>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
