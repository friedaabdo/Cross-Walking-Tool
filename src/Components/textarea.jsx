import "./textarea.css";
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Quill's empty content HTML string used by the editor
const EMPTY_HTML = "<p><br></p>";

// Normalize editor HTML to an app-friendly string. If the editor contains
// the empty Quill HTML, treat it as an empty string.
const normalizeEditorHtml = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  return trimmed === EMPTY_HTML ? "" : trimmed;
};

/*
Textarea component
- `pageName`: used for the placeholder text
- `value`: controlled content (string, either plain text or HTML)
- `onChange`: callback invoked with normalized HTML when content changes

Behavior summary:
- Initializes a Quill editor instance once and keeps a ref to it.
- Listens to Quill's `text-change` events and forwards normalized HTML
  to `onChange`.
- When the `value` prop changes, the effect writes it into the editor,
  preserving HTML when the value looks like markup, or setting plain text.
*/
function Textarea({ pageName, value, onChange }) {
  // Mutable refs to store the Quill instance and DOM nodes
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  const toolbarRef = useRef(null);

  // Initialize Quill once when the DOM refs are ready
  useEffect(() => {
    // Exit early if DOM refs not ready or Quill already initialized
    if (!containerRef.current || !toolbarRef.current || quillRef.current) {
      return;
    }

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: `Enter ${pageName} info. Each item on a new line.`,
      modules: {
        toolbar: toolbarRef.current,
      },
    });

    // Forward normalized HTML to the parent when Quill content changes
    const handleTextChange = () => {
      onChange?.(normalizeEditorHtml(quill.root.innerHTML));
    };

    quill.on("text-change", handleTextChange);

    quillRef.current = quill;

    // Cleanup on unmount: detach handler and clear ref
    return () => {
      quill.off("text-change", handleTextChange);
      quillRef.current = null;
    };
  }, [onChange, pageName]);

  // Keep the editor content in sync when the `value` prop changes.
  // If `value` looks like HTML (contains '<'), we write it directly into
  // the editor root; otherwise we set plain text so Quill handles formatting.
  useEffect(() => {
    if (!quillRef.current) {
      return;
    }

    const nextValue = value ?? "";
    const currentValue = normalizeEditorHtml(quillRef.current.root.innerHTML);

    if (nextValue !== currentValue) {
      if (nextValue.includes("<")) {
        // If incoming value is HTML, set the editor's innerHTML directly.
        quillRef.current.root.innerHTML = nextValue || EMPTY_HTML;
        return;
      }

      // Otherwise write plain text (preserves Quill formatting behavior)
      quillRef.current.setText(nextValue);
    }
  }, [value]);

  return (
    <div className="textarea-quill-shell">
      {/* Toolbar DOM node passed to Quill during initialization */}
      <div ref={toolbarRef} className="textarea-quill-toolbar">
        <span className="ql-formats">
          <button className="ql-bold" />
          {/* Italic/underline intentionally omitted for simplicity */}
        </span>
        <span className="ql-formats">
          {/* Only the bullet list is enabled here */}
          <button className="ql-list" value="bullet" />
        </span>
      </div>

      {/* Editor container node where Quill mounts the editor */}
      <div ref={containerRef} className="textarea-quill-editor" />
    </div>
  );
}

export default Textarea;
