import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

/**
 * THEME COLORS
 * Accent: #ffeb3b (yellow)
 * Primary: #3f51b5 (blue)
 * Secondary: #f50057 (pink)
 */
const COLORS = {
  accent: "#ffeb3b",
  primary: "#3f51b5",
  secondary: "#f50057",
};

// Supabase setup from environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Name of notes table expected in Supabase
const NOTES_TABLE = "notes";

// PUBLIC_INTERFACE
function App() {
  // State management
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  // Change all "content" state to "body"
  const [activeNote, setActiveNote] = useState({ title: "", body: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch notes from Supabase on mount
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // Apply filtering when notes or searchText changes
  useEffect(() => {
    const txt = searchText.trim().toLowerCase();
    setFilteredNotes(
      notes.filter(
        (n) =>
          n.title.toLowerCase().includes(txt) ||
          n.content.toLowerCase().includes(txt)
      )
    );
  }, [notes, searchText]);

  // Set active note by id
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find((n) => n.id === activeNoteId);
      if (note) {
        setActiveNote({
          title: note.title,
          content: (note.content !== undefined ? note.content : (note.body ?? "")),
        });
      }
      setIsEditing(false);
    } else {
      setActiveNote({ title: "", content: "" });
      setIsEditing(false);
    }
  }, [activeNoteId, notes]);

  // PUBLIC_INTERFACE
  async function fetchNotes() {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) setErrorMessage("Failed to fetch notes.");
    else {
      // Map "body" from backend to "content" for frontend compatibility
      setNotes((data || []).map(n => ({
        ...n,
        content: n.body ?? "", // For display in UI
      })));
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function handleCreateNote() {
    setErrorMessage("");
    const title = "Untitled Note";
    // Create note with "body" field for Supabase
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .insert({ title, body: "" })
      .select()
      .single();
    if (error) setErrorMessage("Could not create note.");
    else {
      // Map "body" to "content" for frontend state
      const uiNote = { ...data, content: data.body ?? "" };
      setNotes([uiNote, ...notes]);
      setActiveNoteId(uiNote.id);
      setIsEditing(true);
    }
  }

  // PUBLIC_INTERFACE
  async function handleSaveNote(e) {
    e.preventDefault();
    setErrorMessage("");
    if (!activeNote.title.trim()) {
      setErrorMessage("Title cannot be empty.");
      return;
    }
    // Update "body" instead of "content"
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .update({
        title: activeNote.title,
        body: activeNote.content,
      })
      .eq("id", activeNoteId)
      .select()
      .single();
    if (error) setErrorMessage("Failed to save note.");
    else {
      // Map "body" to "content" for frontend state
      const uiNote = { ...data, content: data.body ?? "" };
      setNotes((prev) =>
        prev.map((note) => (note.id === uiNote.id ? uiNote : note))
      );
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleDeleteNote() {
    if (!window.confirm("Delete this note?")) return;
    setErrorMessage("");
    const { error } = await supabase
      .from(NOTES_TABLE)
      .delete()
      .eq("id", activeNoteId);
    if (error) setErrorMessage("Error deleting note.");
    else {
      setNotes((prev) => prev.filter((note) => note.id !== activeNoteId));
      setActiveNoteId(null);
    }
  }

  // Search notes
  // PUBLIC_INTERFACE
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // When editing or creating note, sync input fields
  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    setActiveNote((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Initiate edit mode
  // PUBLIC_INTERFACE
  function handleEditNote() {
    setIsEditing(true);
  }

  // Cancel edit, revert changes
  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    if (activeNoteId) setActiveNoteId(activeNoteId);
    setIsEditing(false);
  }

  // Select a note by id
  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    setActiveNoteId(noteId);
    setSidebarOpen(false);
  }

  // Toggle sidebar in mobile/tablet
  // PUBLIC_INTERFACE
  function handleSidebarToggle() {
    setSidebarOpen((prev) => !prev);
  }

  // Theme
  // PUBLIC_INTERFACE
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Style helpers for theme colors
  const themeVars = {
    "--primary-color": COLORS.primary,
    "--secondary-color": COLORS.secondary,
    "--accent-color": COLORS.accent,
    "--sidebar-bg": "#f8f9fa",
    "--sidebar-border": "#e9ecef",
    "--sidebar-active-bg": "#e3f2fd",
    "--note-hover-bg": "#f5f5f5",
    "--main-bg": "#fff",
    "--main-border": "#e1e1e1",
    "--error": COLORS.secondary,
    "--button-bg": COLORS.primary,
    "--button-accent-bg": COLORS.accent,
    "--button-text": "#fff",
    "--input-bg": "#fcfcfc",
    "--input-border": "#e0e0e0",
    "--search-bg": "#f5f5f5",
    "--search-border": "#e0e0e0",
  };

  // Main render
  return (
    <div
      className="notes-app"
      style={{
        ...themeVars,
        background: "var(--main-bg)",
        minHeight: "100vh",
      }}
    >
      <div className="theme-switcher-bar">
        <button
          className="theme-toggle-btn"
          onClick={() =>
            setTheme((t) => (t === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <div className="container">
        <aside
          className={`sidebar${sidebarOpen ? " open" : ""}`}
          style={{
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--sidebar-border)",
          }}
        >
          <div className="sidebar-header">
            <span className="sidebar-title">🗒️ Notes</span>
            <button className="sidebar-toggle" onClick={handleSidebarToggle}>
              ☰
            </button>
          </div>
          <div className="sidebar-actions">
            <button
              className="primary-btn"
              onClick={handleCreateNote}
              tabIndex={0}
              style={{
                background: "var(--button-accent-bg)",
                color: COLORS.primary,
              }}
            >
              + New Note
            </button>
            <input
              className="search-input"
              type="text"
              placeholder="Search notes..."
              value={searchText}
              onChange={handleSearchChange}
              style={{
                background: "var(--search-bg)",
                border: "1px solid var(--search-border)",
                marginTop: "10px",
              }}
            />
          </div>
          <ul className="notes-list">
            {loading ? (
              <li className="notes-loading">Loading...</li>
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <li
                  key={note.id}
                  className={`notes-list-item${
                    note.id === activeNoteId ? " active" : ""
                  }`}
                  onClick={() => handleSelectNote(note.id)}
                  tabIndex={0}
                  style={{
                    background:
                      note.id === activeNoteId
                        ? "var(--sidebar-active-bg)"
                        : "transparent",
                  }}
                >
                  <div className="note-title">
                    {note.title.trim() || <em>(Untitled)</em>}
                  </div>
                  <div className="note-snippet">
                    {note.content
                      ? note.content.replace(/\n/g, " ").slice(0, 48) +
                        (note.content.length > 48 ? "…" : "")
                      : ""}
                  </div>
                </li>
              ))
            ) : (
              <li className="notes-empty">No notes found.</li>
            )}
          </ul>
        </aside>
        <main
          className="main-area"
          style={{
            background: "var(--main-bg)",
            borderLeft: "none",
          }}
        >
          <div className="main-content">
            {activeNoteId ? (
              <form className="note-form" onSubmit={handleSaveNote}>
                {isEditing ? (
                  <>
                    <input
                      className="note-title-input"
                      name="title"
                      autoFocus
                      type="text"
                      maxLength={128}
                      value={activeNote.title}
                      onChange={handleChange}
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--primary-color)",
                      }}
                      required
                    />
                    <textarea
                      className="note-content-input"
                      name="content"
                      placeholder="Type your note..."
                      value={activeNote.content}
                      onChange={handleChange}
                      rows={12}
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        marginTop: "10px",
                        minHeight: "168px",
                        resize: "vertical",
                        color: "#353535",
                      }}
                      required
                    />
                    <div className="actions-row note-form-actions">
                      <button
                        className="primary-btn"
                        type="submit"
                        style={{ background: "var(--button-bg)" }}
                      >
                        💾 Save
                      </button>
                      <button
                        className="secondary-btn"
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          background: "#cccccc",
                          color: "#333",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="note-title-main">{activeNote.title}</h2>
                    <pre className="note-content-main">
                      {activeNote.content || <em>(empty)</em>}
                    </pre>
                    <div className="actions-row">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={handleEditNote}
                        style={{ background: "var(--button-bg)" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="danger-btn"
                        type="button"
                        onClick={handleDeleteNote}
                        style={{ background: "var(--error)" }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              <div className="no-selection">
                <p>
                  <strong>Select a note</strong> or{" "}
                  <button
                    onClick={handleCreateNote}
                    className="link-like"
                    style={{
                      color: "var(--button-accent-bg)",
                    }}
                  >
                    create a new note
                  </button>
                  .
                </p>
              </div>
            )}
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
