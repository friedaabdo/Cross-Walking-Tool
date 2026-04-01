import "./textarea.css";
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const EMPTY_HTML = "<p><br></p>";

const normalizeEditorHtml = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  return trimmed === EMPTY_HTML ? "" : trimmed;
};

function Textarea({ pageName, value, onChange }) {
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !toolbarRef.current || quillRef.current) {
      return;
    }

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: `Enter ${pageName} info. Each field on a new line.`,
      modules: {
        toolbar: toolbarRef.current,
      },
    });

    const handleTextChange = () => {
      onChange?.(normalizeEditorHtml(quill.root.innerHTML));
    };

    quill.on("text-change", handleTextChange);

    quillRef.current = quill;

    return () => {
      quill.off("text-change", handleTextChange);
      quillRef.current = null;
    };
  }, [onChange, pageName]);

  useEffect(() => {
    if (!quillRef.current) {
      return;
    }

    const nextValue = value ?? "";
    const currentValue = normalizeEditorHtml(quillRef.current.root.innerHTML);

    if (nextValue !== currentValue) {
      if (nextValue.includes("<")) {
        quillRef.current.root.innerHTML = nextValue || EMPTY_HTML;
        return;
      }

      quillRef.current.setText(nextValue);
    }
  }, [value]);

  return (
    <div className="textarea-quill-shell">
      <div ref={toolbarRef} className="textarea-quill-toolbar">
        <span className="ql-formats">
          {/* <button className="ql-bold" /> */}
          {/* <button className="ql-italic" />
          <button className="ql-underline" /> */}
        </span>
        <span className="ql-formats">
          {/* <button className="ql-list" value="ordered" /> */}
          <button className="ql-list" value="bullet" />
        </span>
      </div>
      <div ref={containerRef} className="textarea-quill-editor" />
    </div>
  );
}

export default Textarea;