import { Link } from "react-router-dom";
import "./Nav.css";

function Nav({ clearCreateTemplateDraft }) {
  return (
    <nav id="nav">

          <Link to="/">Home</Link>
            <Link
              to="/create-template"
              onClick={() => {
                clearCreateTemplateDraft?.();
              }}
            >
              Create Template
            </Link>
          <Link to="/board">Board</Link>
          <Link to="/search">Search</Link>
          <Link to="/login">Login</Link>
        
    </nav>
  );
}

export default Nav;