import "./Nav.css";

function Nav() {
  return (
    <nav id="nav">
        {/* a nav bar with buttons like home, create template, login */}
      {/* <h1>Cross-Walking Tool</h1> */}
       
          <a href="/">Home</a>
            <a href="/create-template">Create Template</a>
          <a href="/board">Board</a>
          <a href="/search">Search</a>
          <a href="/login">Login</a>
        
    </nav>
  );
}

export default Nav;