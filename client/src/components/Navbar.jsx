import "./Navbar.css";

function Navbar() {
    return (
        <header className="navbar">
            <div className="logo">
                🎯 Quiz App
            </div>

            <div className="user">
                <span>👤 Shated</span>
                <button>
                    Выйти
                </button>
            </div>
        </header>
    );
}

export default Navbar;
