import { Link } from "react-router-dom";
import "./Nav.css";

function Nav() {
  return (
    <nav id="nav">
        {/* a nav bar with buttons like home, create template, login */}
      {/* <h1>Cross-Walking Tool</h1> */}

          <Link to="/">Home</Link>
            <Link to="/create-template">Create Template</Link>
          <Link to="/board">Board</Link>
          <Link to="/search">Search</Link>
          <Link to="/login">Login</Link>
        
    </nav>
  );
}

export default Nav;