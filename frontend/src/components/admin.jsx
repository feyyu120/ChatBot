import { useState, useEffect } from "react";
import { FaUpload, FaList, FaTrash, FaSpinner } from "react-icons/fa";
import "../styles/admin.css";

const API_UPLOAD = "http://localhost:5000/api/admin/upload";
const API_POSTS = "http://localhost:5000/api/admin/my-posts";

export default function Admin() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);


  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("upload"); 

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(API_POSTS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (status) setStatus("");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setStatus("❌ Not logged in");

    if (!text.trim() && !file) return setStatus("❌ Enter text or select file");

    setLoading(true);
    setStatus("");

    try {
      const formData = new FormData();
      if (title.trim()) formData.append("title", title);
      if (text.trim()) formData.append("text", text);
      if (file) formData.append("file", file);

      const res = await fetch(API_UPLOAD, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("❌ " + (data.message || "Upload failed"));
        return;
      }

      setStatus("✅ Uploaded successfully!");
      setText("");
      setTitle("");
      setFile(null);


      const updatedPosts = await fetch(API_POSTS, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      setPosts(updatedPosts);
    } catch (err) {
      console.error(err);
      setStatus("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Delete this post?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        setStatus("🗑️ Post deleted");
      } else {
        setStatus("❌ Delete failed");
      }
    } catch (err) {
      setStatus("❌ Server error");
    }
  };

  return (
    <div className="admin-dashboard">
     
      <aside className="sidebar">
        <div className="sidebar-header" style={{width:250}}>
          <h3>Admin Panel</h3>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${viewMode === "upload" ? "active" : ""}`}
            onClick={() => setViewMode("upload")}
          >
            <FaUpload /> New Upload
          </button>

          <button
            className={`nav-btn ${viewMode === "posts" ? "active" : ""}`}
            onClick={() => setViewMode("posts")}
          >
            <FaList /> Recent Posts ({posts.length})
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {viewMode === "upload" ? (
          <>
            <h2 className="page-title">Upload New Knowledge</h2>

            <div className="upload-card">
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="title-input"
              />

              <textarea
                placeholder="Type or Paste text you can also upload file..."
                value={text}
                onChange={handleTextChange}
                rows={8}
                className="text-input"
              />

              <div className="file-upload">
                <label className="file-label">
                  <FaUpload /> Choose PDF or TXT file
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    hidden
                  />
                </label>
                {file && <span className="file-name">{file.name}</span>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`submit-btn ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spin" /> Uploading...
                  </>
                ) : (
                  "Upload Now"
                )}
              </button>

              {status && (
                <p className={`status ${status.includes("✅") ? "success" : "error"}`}>
                  {status}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="page-title">All Your Posts</h2>

            {postsLoading ? (
              <div className="loading-posts">
                <FaSpinner className="spin" /> Loading your posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="no-posts">
                <p>No posts yet. Upload your first knowledge entry!</p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    <div className="post-header">
                      <h3>{post.title || "Untitled"}</h3>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="post-preview">
                      {post.content?.substring(0, 120)}
                      {post.content?.length > 120 ? "..." : ""}
                    </p>

                    {post.fileUrl && (
                      <a href={post.fileUrl} target="_blank" className="post-file">
                        📄 View File
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(post._id)}
                      className="delete-btn"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}