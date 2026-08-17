import { useState, useEffect } from "react";
import Template from "../Components/template.jsx";

function Board({ clearAddEquivDraft }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/learning-experiences/templates")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setTemplates(data || []);
        console.log("Fetched templates data:", data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load templates");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="board">
      <h1>Templates</h1>

      <section className="templates-section">
        <h2>Templates</h2>
        {loading && <p>Loading templates…</p>}
        {error && <p className="board-error">{error}</p>}
        {!loading && !error && templates.length === 0 && <p>No templates found.</p>}

          
        {!loading && !error && templates.map((t) => (
          <Template
            key={t.experience_id}
            title={t.title}
            description={t.description}
            link={t.link}
            experience_id={t.experience_id}
            user={t.user}
            clearAddEquivDraft={clearAddEquivDraft}
          />
        ))}
      </section>

    </div>
  );
}

export default Board;