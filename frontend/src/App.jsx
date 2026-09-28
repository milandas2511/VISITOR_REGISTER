import { useEffect, useMemo, useState } from "react";
import api from "./api";

const emptyForm = {
  name: "",
  mobile: "",
  company: "",
  personToMeet: "",
  purpose: ""
};

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function App() {
  const [visitors, setVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchVisitors = async (query = "") => {
    try {
      setLoading(true);
      const response = await api.get("/visitors", {
        params: query ? { search: query } : {}
      });
      setVisitors(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load visitors");
    } finally {
      setLoading(false);
    }
  };

  const fetchToday = async () => {
    try {
      const response = await api.get("/visitors/today");
      setTodayVisitors(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchToday();
  }, []);

  const totalVisitors = visitors.length;
  const todayCount = todayVisitors.length;

  const recentVisitors = useMemo(
    () => visitors.slice(0, 5),
    [visitors]
  );

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/visitors/${editingId}`, form);
        setMessage("Visitor updated successfully.");
      } else {
        await api.post("/visitors", form);
        setMessage("Visitor registered successfully.");
      }

      resetForm();
      await Promise.all([fetchVisitors(search), fetchToday()]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (visitor) => {
    setEditingId(visitor._id);
    setForm({
      name: visitor.name,
      mobile: visitor.mobile,
      company: visitor.company,
      personToMeet: visitor.personToMeet,
      purpose: visitor.purpose
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this visitor record?")) return;

    try {
      await api.delete(`/visitors/${id}`);
      setMessage("Visitor deleted successfully.");
      await Promise.all([fetchVisitors(search), fetchToday()]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete visitor");
    }
  };

  const handleSearch = async (event) => {
    const value = event.target.value;
    setSearch(value);
    await fetchVisitors(value);
  };

  const handleExport = () => {
    window.open("http://localhost:5000/api/visitors/export", "_blank");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>VisitorDesk</h1>
          <p>Employee Visitor Registration System</p>
        </div>
        <div className="live-badge">Reception</div>
      </header>

      <main className="container">
        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        <section className="stats">
          <div className="stat-card">
            <span>Today's Visitors</span>
            <strong>{todayCount}</strong>
          </div>
          <div className="stat-card">
            <span>Total Records</span>
            <strong>{totalVisitors}</strong>
          </div>
          <div className="stat-card">
            <span>System Status</span>
            <strong className="online">Online</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="card form-card">
            <div className="section-title">
              <div>
                <h2>{editingId ? "Edit Visitor" : "Register Visitor"}</h2>
                <p>Enter visitor details below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Visitor Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </label>

              <label>
                Company / College Name
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company or college"
                  required
                />
              </label>

              <label>
                Person to Meet
                <input
                  name="personToMeet"
                  value={form.personToMeet}
                  onChange={handleChange}
                  placeholder="Employee name"
                  required
                />
              </label>

              <label>
                Purpose of Visit
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Meeting, interview, delivery..."
                  rows="3"
                  required
                />
              </label>

              <div className="button-row">
                <button className="primary" type="submit">
                  {editingId ? "Update Visitor" : "Register Visitor"}
                </button>
                {editingId && (
                  <button className="secondary" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card recent-card">
            <div className="section-title">
              <div>
                <h2>Recent Visitors</h2>
                <p>Latest visitor registrations.</p>
              </div>
            </div>

            {recentVisitors.length === 0 ? (
              <div className="empty">No visitor records yet.</div>
            ) : (
              <div className="recent-list">
                {recentVisitors.map((visitor) => (
                  <div className="recent-item" key={visitor._id}>
                    <div className="avatar">
                      {visitor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{visitor.name}</strong>
                      <span>{visitor.company}</span>
                      <small>{formatDate(visitor.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card table-card">
          <div className="table-header">
            <div>
              <h2>Visitor Records</h2>
              <p>Search, edit, delete, or export visitor records.</p>
            </div>

            <div className="toolbar">
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Search name or mobile..."
              />
              <button className="export-btn" onClick={handleExport}>
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty">Loading records...</div>
          ) : visitors.length === 0 ? (
            <div className="empty">No matching visitor records found.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Mobile</th>
                    <th>Company / College</th>
                    <th>Person to Meet</th>
                    <th>Purpose</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td>{visitor.name}</td>
                      <td>{visitor.mobile}</td>
                      <td>{visitor.company}</td>
                      <td>{visitor.personToMeet}</td>
                      <td>{visitor.purpose}</td>
                      <td>{formatDate(visitor.createdAt)}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(visitor)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(visitor._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>
        Employee Visitor Registration System • MERN Stack Project
      </footer>
    </div>
  );
}

export default App;
