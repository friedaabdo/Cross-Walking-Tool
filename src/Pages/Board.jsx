import { useState, useEffect } from "react";

function Board() {
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
      <h1>Board Page</h1>

      <section className="templates-section">
        <h2>Templates</h2>
        {loading && <p>Loading templates…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && templates.length === 0 && <p>No templates found.</p>}

        {!loading && !error && templates.map((t) => (
          <div key={t.id} className="template-item" style={{ backgroundColor: '#f9f9f9', padding: '10px', marginBottom: '8px' }}>
            <h3>{t.title}</h3>
            {t.description && <p>{t.description}</p>}
            <small>Created: {t.created_at ?? t.updated_at}</small>
          </div>
        ))}
      </section>

    </div>
  );
}

export default Board;