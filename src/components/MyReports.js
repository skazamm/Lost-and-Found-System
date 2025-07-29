import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const API_URL = "http://localhost:5000/api";

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
      if (
        btnRef.current &&
        (btnRef.current.contains(e.target) ||
          document.getElementById("menu-popup-user")?.contains(e.target))
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
      id="menu-popup-user"
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
        border-none bg-transparent text-[20px] cursor-pointer
        hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300
        transition
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
function DetailsModal({ report, open, onClose }) {
  if (!open || !report) return null;
return (
  <div
    className={`
      fixed inset-0 z-[2000] flex items-center justify-center
      bg-black/60
    `}
    onClick={onClose}
  >
    <div
      className={`
        bg-white p-8 rounded-2xl w-[400px] max-h-[88vh] overflow-y-auto
        shadow-2xl relative
        border border-gray-200
      `}
      onClick={e => e.stopPropagation()}
    >
      <button
        className={`
          absolute top-2.5 right-5 text-[24px] bg-none border-none cursor-pointer
          text-gray-500 hover:text-red-500 transition
          focus:outline-none focus:ring-2 focus:ring-red-400
        `}
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        &times;
      </button>
      <h3 className="mt-0 mb-4 text-xl font-semibold text-blue-700">{report.title}</h3>
      {report.photo_url && (
        <img
          src={report.photo_url}
          alt="item"
          className="w-[92%] mx-auto my-5 rounded-lg shadow"
        />
      )}
      <div className="text-base text-gray-700 leading-relaxed">
        <strong>Type:</strong> {report.type}<br />
        <strong>Status:</strong> {report.status}<br />
        <strong>Description:</strong> {report.description}<br />
        <strong>Category:</strong> {report.item_category}<br />
        <strong>Location:</strong> {report.location}<br />
        <strong>Date:</strong>{" "}
        {report.date_event
          ? new Date(report.date_event).toLocaleDateString()
          : ""}
      </div>
    </div>
  </div>
);

}

// --- Edit Modal ---
function EditReportModal({ open, report, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    item_category: "",
    location: "",
    status: "",
  });

  useEffect(() => {
    if (report) {
      setForm({
        title: report.title || "",
        description: report.description || "",
        item_category: report.item_category || "",
        location: report.location || "",
        status: report.status || "",
        photo_url: report.photo_url || "",

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
      className={`
        bg-white p-8 rounded-2xl w-[400px] max-h-[88vh] overflow-y-auto
        shadow-2xl relative border border-gray-200
      `}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`
          absolute top-2.5 right-5 text-[24px] bg-none border-none cursor-pointer
          text-gray-500 hover:text-red-500 transition
          focus:outline-none focus:ring-2 focus:ring-red-400
        `}
      >
        &times;
      </button>
      <h3 className="mt-0 mb-4 text-xl font-semibold text-blue-700">Edit Report</h3>
      <label className="font-semibold mb-1 block">Title</label>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        required
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="font-semibold mb-1 block">Description</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={3}
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="font-semibold mb-1 block">Category</label>
      <input
        name="item_category"
        value={form.item_category}
        onChange={handleChange}
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="font-semibold mb-1 block">Location</label>
      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <label className="font-semibold mb-1 block">Status</label>
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        required
        className="w-full mb-5 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="active">Active</option>
        <option value="claimed">Claimed</option>
        <option value="deleted">Deleted</option>
      </select>
      <button
        type="submit"
        className={`
          w-full py-2 rounded-md font-semibold
          bg-blue-600 text-white shadow hover:bg-blue-700 transition
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        Save
      </button>
    </form>
  </div>
);

}

function MyReports() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  // Modal state
  const [details, setDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
 
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [message]);

  // Fetch user's reports
  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setReports([]);
      try {
        const res = await fetch(`${API_URL}/my-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setReports(data);
      } catch {
        setReports([]);
      }
    };
    fetchReports();
  }, [message, editing]); // Refresh after message or edit

  // Save changes (modal)
  const saveEdit = async (fields) => {
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/reports/${editingReport.report_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(fields),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Report updated!");
        setEditing(false);
        setEditingReport(null);
      } else {
        setMessage(data.error || "Update failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Delete a report
  const deleteReport = async (id) => {
    setMessage("");
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Report deleted!");
      } else {
        setMessage(data.error || "Delete failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Table columns (for alignment)
  const columns = [
    { key: "type", label: "Type", width: 80, align: "left" },
    { key: "title", label: "Title", width: 150, align: "left" },
    { key: "status", label: "Status", width: 95, align: "center" },
    { key: "date_event", label: "Date", width: 110, align: "center" },
    { key: "photo_url", label: "Photo", width: 90, align: "center" },
    { key: "actions", label: "Actions", width: 120, align: "center" },
  ];

return (
  <div className="
    max-w-[750px] mx-auto mt-10 bg-gray-100 p-8 rounded-2xl min-h-[420px]
    shadow-xl border border-gray-200
  ">
    <h2 className="mb-6 text-xl font-bold text-blue-700">My Lost &amp; Found Reports</h2>
    <div className="mb-3 min-h-[24px] text-red-500 font-medium">{message}</div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-3 py-3 text-[15px] font-bold text-gray-700 bg-gray-50
                  ${col.align === "center" ? "text-center" : "text-left"}
                `}
                style={{
                  width: col.width,
                  minWidth: col.width,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-400 py-8 font-medium"
              >
                No reports found.
              </td>
            </tr>
          )}
          {reports.map((r) => (
            <tr key={r.report_id} className="border-b border-gray-100 hover:bg-blue-50 transition">
              {/* Type */}
              <td className="text-left px-2 py-2">{r.type}</td>
              {/* Title */}
              <td className="text-left px-2 py-2">
                {r.title.length > 36 ? r.title.slice(0, 33) + "..." : r.title}
              </td>
              {/* Status */}
              <td className="text-center px-2 py-2">
                <span className={`
                  rounded-full px-2 py-1 text-xs font-semibold
                  ${r.status === "claimed" ? "bg-emerald-100 text-emerald-600" :
                    r.status === "deleted" ? "bg-red-100 text-red-500" :
                    "bg-blue-100 text-blue-700"}
                `}>
                  {r.status}
                </span>
              </td>
              {/* Date */}
              <td className="text-center px-2 py-2">
                {r.date_event
                  ? new Date(r.date_event).toLocaleDateString()
                  : ""}
              </td>
              {/* Photo */}
              <td className="text-center px-2 py-2">
                {r.photo_url ? (
                  <img
                    src={r.photo_url}
                    alt="item"
                    className="w-14 h-14 object-cover rounded-md border border-gray-200 mx-auto"
                  />
                ) : (
                  <span className="text-gray-400">No photo</span>
                )}
              </td>
              {/* Actions: MenuButton */}
              <td className="text-center px-2 py-2">
                <MenuButton
                  onView={() => setDetails(r)}
                  onEdit={() => {
                    setEditingReport(r);
                    setEditing(true);
                  }}
                  onDelete={() => deleteReport(r.report_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Details modal */}
    <DetailsModal
      report={details}
      open={!!details}
      onClose={() => setDetails(null)}
    />
    {/* Edit modal */}
    <EditReportModal
      open={editing}
      report={editingReport}
      onSave={saveEdit}
      onClose={() => {
        setEditing(false);
        setEditingReport(null);
      }}
    />
  </div>
);

}

export default MyReports;
