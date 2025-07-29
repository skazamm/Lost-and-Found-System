import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import SpamReportsPanel from "./SpamReportsPanel"; // adjust the path if your file structure is different


// --- 3-dots menu button (per row) ---
function MenuButton({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [open]);

  

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      // Close only if outside both menu and button
      if (
        btnRef.current &&
        (btnRef.current.contains(e.target) ||
          document.getElementById("menu-popup")?.contains(e.target))
      )
        return;
      setOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const menu = (
    <div
      id="menu-popup"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 99999,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 8px 24px #0003",
        minWidth: 150,
        marginTop: 2,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
          setOpen(false);
        }}
        style={menuItemStyle}
      >
        View Details
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          setOpen(false);
        }}
        style={menuItemStyle}
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          setOpen(false);
        }}
        style={{ ...menuItemStyle, color: "crimson" }}
      >
        Delete
      </button>
    </div>
  );

return (
  <>
    <button
      ref={btnRef}
      className={`
        border-none bg-transparent text-xl cursor-pointer
        rounded-full transition
        hover:bg-blue-100 hover:text-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-600
        p-2
      `}
      onClick={e => {
        e.stopPropagation();
        setOpen(o => !o);
      }}
      tabIndex={0}
      aria-label="Open actions menu"
      type="button"
    >
      &#8942;
    </button>
    {open && ReactDOM.createPortal(menu, document.body)}
  </>
);

}

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "9px 14px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 15,
  outline: "none",
};

// --- Details Modal ---
function DetailsModal({ report, user, open, onClose }) {
  if (!open || !report) return null;
return (
  <div
    className="
      fixed inset-0 z-[2000] flex items-center justify-center
      bg-black/60
    "
    onClick={onClose}
  >
    <div
      className="
        bg-white rounded-xl p-8 w-[400px] max-h-[88vh] overflow-y-auto
        shadow-2xl relative
        border border-gray-200
      "
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        className="
          absolute top-3 right-4 text-2xl text-gray-400
          hover:text-red-500 focus:outline-none
        "
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <h3 className="mt-0 mb-4 text-blue-700 font-bold text-lg">{report.title}</h3>
      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="item"
          className="w-[92%] mx-auto mb-4 rounded-lg border border-gray-100"
        />
      )}
      <div className="text-gray-700 text-[16px] leading-7 space-y-1">
        <div>
          <span className="font-semibold text-gray-900">Type:</span> {report.type}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Status:</span> {report.status}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Description:</span> {report.description}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Category:</span> {report.item_category}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Location:</span> {report.location}
        </div>
        <div>
          <span className="font-semibold text-gray-900">Date:</span>{" "}
          {report.date_event ? new Date(report.date_event).toLocaleDateString() : ""}
        </div>
        <div>
          <span className="font-semibold text-gray-900">User:</span>{" "}
          {user ? `${user.username} (${user.email})` : ""}
        </div>
      </div>
    </div>
  </div>
);

}

// --- Edit Modal (Best Practice: Edit ALL fields) ---
function EditReportModal({ open, report, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    item_category: "",
    location: "",
    status: "",
    type: "",
    photo_url: "",
  });

  useEffect(() => {
    if (report) {
      setForm({
        title: report.title || "",
        description: report.description || "",
        item_category: report.item_category || "",
        location: report.location || "",
        status: report.status || "",
        type: report.type || "",
        photo_url: report.photo_url || "" 
      });
    }
  }, [report]);

  if (!open || !report) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

return (
  <div
    className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60"
    onClick={onClose}
  >
    <form
      onClick={e => e.stopPropagation()}
      onSubmit={handleSubmit}
      className="
        bg-white rounded-xl p-8 w-[400px] max-h-[88vh] overflow-y-auto
        shadow-2xl relative border border-gray-200
      "
    >
      <button
        type="button"
        className="
          absolute top-3 right-4 text-2xl text-gray-400
          hover:text-red-500 focus:outline-none
        "
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>
      <h3 className="mt-0 mb-4 font-bold text-blue-700 text-lg">Edit Report</h3>
      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={3}
        className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-vertical"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
      <input
        name="item_category"
        value={form.item_category}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        required
        className="w-full mb-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="">Select...</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        required
        className="w-full mb-5 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="active">Active</option>
        <option value="claimed">Claimed</option>
        <option value="deleted">Deleted</option>
      </select>
      <button
        type="submit"
        className="
          w-full py-2 rounded-md font-semibold
          bg-blue-600 text-white shadow hover:bg-blue-700 transition
        "
      >
        Save
      </button>
    </form>
  </div>
);

}

const API_URL = "http://localhost:5000/api";

// --- MAIN ADMIN DASHBOARD ---
function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    category: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [flaggedCount, setFlaggedCount] = useState(0);
  
useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);


  // Modal state
  const [details, setDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const reportsPerPage = 10;
useEffect(() => {
  // Fetch flagged/spam reports count when dashboard loads
  const fetchFlaggedCount = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/reports-spam", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedCount(data.length);
      } else {
        setFlaggedCount(0);
      }
    } catch {
      setFlaggedCount(0);
    }
  };

  fetchFlaggedCount();
}, []);

  // Data fetch
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const repRes = await fetch(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(await repRes.json());
        const userRes = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(await userRes.json());
        setLoading(false);
      } catch {
        setMessage("Error loading data.");
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filtering
  const filteredReports = reports.filter(
    (r) =>
      (!filters.type || r.type === filters.type) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.category ||
        (r.item_category &&
          r.item_category.toLowerCase().includes(filters.category.toLowerCase()))) &&
      (!filters.search ||
        (r.title && r.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (r.description &&
          r.description.toLowerCase().includes(filters.search.toLowerCase())) ||
        (r.location && r.location.toLowerCase().includes(filters.search.toLowerCase())))
  );

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginated = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Get user object by id
  const getUserObj = (uid) => users.find((u) => u.user_id === uid);

  // --- ACTIONS ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.report_id !== id));
        setMessage("Report deleted.");
      } else {
        setMessage("Delete failed.");
      }
    } catch {
      setMessage("Delete failed (server error).");
    }
  };

  // Handle save in modal (edit all fields)
  const handleEditSave = async (updatedFields) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/reports/${editingReport.report_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedFields),
        }
      );
      if (res.ok) {
        setReports(
          reports.map((r) =>
            r.report_id === editingReport.report_id
              ? { ...r, ...updatedFields }
              : r
          )
        );
        setMessage("Report updated!");
        setEditing(false);
        setEditingReport(null);
      } else {
        setMessage("Update failed.");
      }
    } catch {
      setMessage("Update failed (server error).");
    }
  };

  // Table/column styles
  const thStyle = {
    padding: "10px 8px",
    border: "1px solid #ddd",
    fontWeight: 600,
    background: "#f5f5f5",
    width: "17%",
  };
  const tdStyle = {
    border: "1px solid #eee",
    padding: 6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 160,
  };

  // Filter options
  const typeOptions = Array.from(new Set(reports.map((r) => r.type))).filter(
    Boolean
  );
  const statusOptions = Array.from(
    new Set(reports.map((r) => r.status))
  ).filter(Boolean);
  const categoryOptions = Array.from(
    new Set(reports.map((r) => r.item_category))
  ).filter(Boolean);

  const [tab, setTab] = useState("all"); // "all" or "spam"

return (
  <div
    style={{
      background: "#f3f4f6", // Soft Gray
      maxWidth: 950,
      padding: 36,
      borderRadius: 18,
      margin: "40px auto",
      width: "100%",
      minHeight: 550,
      boxShadow: "0 4px 20px 0 #dbeafe", // Lighter blue shadow
      border: "1px solid #e5e7eb" // Subtle border
    }}
  >
    <h2 style={{ color: "#2563eb", fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h2>

    {/* TABS */}
    <div style={{ marginBottom: 18, display: "flex", gap: 10 }}>
      <button
        style={{
          padding: "8px 18px",
          marginRight: 12,
          border: tab === "all" ? "2px solid #2563eb" : "1px solid #cbd5e1",
          background: tab === "all" ? "#e0e7ff" : "#f3f4f6",
          fontWeight: tab === "all" ? 700 : 400,
          borderRadius: 8,
          cursor: "pointer",
          color: tab === "all" ? "#2563eb" : "#374151",
          transition: "background 0.2s, border 0.2s, color 0.2s",
        }}
        onClick={() => setTab("all")}
      >
        All Reports
      </button>
      <button
        style={{
          padding: "8px 18px",
          paddingRight: flaggedCount > 0 ? 48 : 22,
          border: tab === "spam" ? "2px solid #ef4444" : "1px solid #cbd5e1",
          background: tab === "spam" ? "#fef2f2" : "#f3f4f6",
          fontWeight: tab === "spam" ? 700 : 400,
          borderRadius: 8,
          color: "#ef4444",
          cursor: "pointer",
          position: "relative",
          minWidth: 140,
          transition: "background 0.2s, border 0.2s, color 0.2s",
        }}
        onClick={() => setTab("spam")}
      >
        Flagged/Spam
        {flaggedCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              background: "#ef4444", // Alert Red
              color: "#fff",
              borderRadius: "999px",
              fontSize: 13,
              fontWeight: "bold",
              minWidth: 22,
              height: 22,
              padding: "0 7px",
              lineHeight: "22px",
              display: "inline-block",
              textAlign: "center",
              boxShadow: "0 2px 8px #0001",
            }}
          >
            {flaggedCount}
          </span>
        )}
      </button>
    </div>

    {/* ---- ALL REPORTS TAB ---- */}
    {tab === "all" && (
      <>
        {/* Filters */}
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              padding: "7px 10px",
              borderRadius: 7,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#374151",
            }}
          >
            <option value="">All Types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            style={{
              padding: "7px 10px",
              borderRadius: 7,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#374151",
            }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            style={{
              padding: "7px 10px",
              borderRadius: 7,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#374151",
            }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by title/desc/location"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            style={{
              minWidth: 180,
              padding: "7px 10px",
              borderRadius: 7,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#374151",
            }}
          />
          <button
            onClick={() =>
              setFilters({
                type: "",
                status: "",
                category: "",
                search: "",
              })
            }
            style={{
              padding: "7px 18px",
              background: "#fbbf24", // Gold
              color: "#374151",
              border: "none",
              borderRadius: 7,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
              marginLeft: 10,
            }}
          >
            Reset
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                background: "#fff",
                tableLayout: "fixed",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 12px #e0e7ff",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th
                    style={{
                      ...thStyle,
                      width: 70,
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", color: "#999" }}
                    >
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((r) => (
                    <tr key={r.report_id}>
                      <td style={tdStyle}>{r.type}</td>
                      <td style={tdStyle}>
                        {r.title.length > 36
                          ? r.title.slice(0, 33) + "..."
                          : r.title}
                      </td>
                      <td style={tdStyle}>{r.status}</td>
                      <td style={tdStyle}>
                        {r.date_event
                          ? new Date(r.date_event).toLocaleDateString()
                          : ""}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <MenuButton
                          onView={() => setDetails(r)}
                          onEdit={() => {
                            setEditingReport(r);
                            setEditing(true);
                          }}
                          onDelete={() => handleDelete(r.report_id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination controls */}
            <div style={{ marginTop: 15, display: "flex", gap: 7 }}>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                style={{
                  padding: "6px 16px",
                  background: "#e0e7ff",
                  color: "#2563eb",
                  border: "none",
                  borderRadius: 7,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: 500
                }}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  style={{
                    fontWeight: currentPage === i + 1 ? "bold" : "normal",
                    padding: "6px 12px",
                    background: currentPage === i + 1 ? "#2563eb" : "#fff",
                    color: currentPage === i + 1 ? "#fff" : "#374151",
                    border: "1px solid #cbd5e1",
                    borderRadius: 7,
                    cursor: "pointer",
                  }}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 16px",
                  background: "#e0e7ff",
                  color: "#2563eb",
                  border: "none",
                  borderRadius: 7,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 500
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        <div style={{ color: "#ef4444", marginTop: 14 }}>{message}</div>
        {/* Details Modal */}
        <DetailsModal
          report={details}
          user={getUserObj(details?.user_id)}
          open={!!details}
          onClose={() => setDetails(null)}
        />
        {/* Edit Modal */}
        <EditReportModal
          open={editing}
          report={editingReport}
          onSave={handleEditSave}
          onClose={() => {
            setEditing(false);
            setEditingReport(null);
          }}
        />
      </>
    )}

    {/* ---- SPAM/FLAGGED TAB ---- */}
    {tab === "spam" && (
      <div style={{ marginTop: 28 }}>
        <h3 style={{ color: "#ef4444" }}>Flagged Reports (Spam)</h3>
        <SpamReportsPanel onSpamCountChange={setFlaggedCount} />
      </div>
    )}
  </div>
);

}

export default AdminDashboard;
