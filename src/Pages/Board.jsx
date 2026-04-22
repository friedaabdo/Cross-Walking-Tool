import { useNavigate } from "react-router-dom";

function Board() {
  const navigate = useNavigate();

  return (
    <div className="board">
      <h1>Board Page</h1>
      <p>This is the board page.</p>
      {/* create a dummy content for the board page where it shows what crosswalks are being worked on. add a button on top to add a new crosswalk */}
        {/* make button go to home page */}
        <button className="add-crosswalk-button" onClick={() => navigate('/')}>
          Add New Crosswalk
        </button>
        <div className="crosswalk-list">
            <h2>Working Crosswalks</h2>
          <div className="crosswalk-item" style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
            <h3>Crosswalk 1</h3>
            <p>Learning Experience: Introduction to Psychology</p>
            <p>CUNY Course: PSY 101</p>
            {/* add drop down with dummy names for who has submitted a crosswalk. */}
            <p>Submitted By:</p>
            <select className="submitter-dropdown">
              <option value="">Alice</option>
              <option value="bob">Bob</option>
                <option value="carol">Carol</option>
            </select>
            <button className="view-crosswalk-button">View Crosswalk</button>

          </div>
          {/* change the info below to be different dummy info */}
          <div className="crosswalk-item" style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
            <h3>Crosswalk 2</h3>
            <p>Learning Experience: Introduction to Biology</p>
            <p>CUNY Course: BIO 101</p>
            {/* add drop down with dummy names for who has submitted a crosswalk. */}
            <p>Submitted By:</p>
            <select className="submitter-dropdown">
              <option value="">Alice</option>
              <option value="bob">Bob</option>
                <option value="carol">Carol</option>
            </select>
            <button className="view-crosswalk-button">View Crosswalk</button>

          </div>
        </div>

    </div>
  );
}

export default Board;