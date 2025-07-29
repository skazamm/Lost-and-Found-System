import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

// Helper: get user from token (decode JWT)
function getUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function ViewReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState({ type: "", category: "", keyword: "" });
  const [message, setMessage] = useState("");
  const [spam, setSpam] = useState({}); // Local record of spammed reports

  const user = getUser();

  useEffect(() => {
    const fetchReports = async () => {
      let query = [];
      if (filter.type) query.push(`type=${filter.type}`);
      if (filter.category) query.push(`category=${filter.category}`);
      if (filter.keyword) query.push(`q=${filter.keyword}`);

      let url = `${API_URL}/reports`;
      if (query.length) url += "?" + query.join("&");

      try {
        const res = await fetch(url);
        const data = await res.json();
        setReports(data);
      } catch {
        setReports([]);
      }
    };
    fetchReports();
  }, [filter, message]);

  const handleChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // SPAM logic
  const reportSpam = async (report_id) => {
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/reports/${report_id}/spam`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSpam(prev => ({ ...prev, [report_id]: true }));
        setMessage("Report flagged as spam.");
      } else {
        setMessage("Failed to report as spam.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  // Permissions
  function canSpam(report) {
    if (!user) return false;
    // Prevent reporting your own or admin's report as spam
    if (user.role === "admin" || user.user_id === report.user_id) return false;
    return !spam[report.report_id];
  }

  // Table column definitions for best alignment
 const columns = [
  { key: "type", label: "Type", width: 70, align: "left" },
  { key: "title", label: "Title", width: 110, align: "left" },
  { key: "description", label: "Description", width: 140, align: "left" },
  { key: "item_category", label: "Category", width: 90, align: "left" },
  { key: "location", label: "Location", width: 92, align: "left" },
  { key: "date_event", label: "Date", width: 84, align: "center" },
  { key: "status", label: "Status", width: 76, align: "center" },
  { key: "photo_url", label: "Photo", width: 78, align: "center" },
  { key: "actions", label: "Actions", width: 108, align: "center" }
];


 return (
  <div
    className={`
      max-w-[1220px] mx-auto mt-10 mb-10 p-9 rounded-xl min-h-[420px]
      shadow-xl bg-gray-100
    `}
  >
    <h2 className="mb-6 text-2xl font-semibold">Lost &amp; Found Reports</h2>
    {/* Filters */}
    <div className="mb-5 flex gap-2">
      <select
        name="type"
        value={filter.type}
        onChange={handleChange}
        className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="">All Types</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>
      <input
        name="category"
        placeholder="Category (e.g. Wallet, Bag)"
        value={filter.category}
        onChange={handleChange}
        className="px-3 py-1.5 min-w-[180px] rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        name="keyword"
        placeholder="Search keyword"
        value={filter.keyword}
        onChange={handleChange}
        className="px-3 py-1.5 min-w-[180px] rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
    <div className="text-red-600 mb-3">{message}</div>
    <div className="overflow-x-auto rounded-xl shadow bg-white">
      <table className="w-full border-collapse bg-white table-fixed">
        <thead>
          <tr>
            {columns.map((col) =>
              col.key !== "actions" || user ? (
                <th
                  key={col.key}
                  className={`
                    font-bold text-gray-700 text-left px-2 py-3 bg-gray-100 border-b-2 border-gray-200
                  `}
                  style={{ width: col.width, minWidth: col.width, textAlign: col.align }}
                >
                  {col.label}
                </th>
              ) : null
            )}
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 && (
            <tr>
              <td
                colSpan={user ? columns.length : columns.length - 1}
                className="text-center text-gray-500 py-6"
              >
                No reports found.
              </td>
            </tr>
          )}
          {reports.map((r) => (
            <tr key={r.report_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="text-left px-2 py-2">{r.type}</td>
              <td className="text-left px-2 py-2">
                {r.title?.length > 40 ? r.title.slice(0, 37) + "..." : r.title}
              </td>
              <td className="text-left px-2 py-2">
                {r.description?.length > 52 ? r.description.slice(0, 49) + "..." : r.description}
              </td>
              <td className="text-left px-2 py-2">{r.item_category}</td>
              <td className="text-left px-2 py-2">{r.location}</td>
              <td className="text-center px-2 py-2">
                {r.date_event ? new Date(r.date_event).toLocaleDateString() : ""}
              </td>
              <td className="text-center px-2 py-2">{r.status}</td>
              <td className="text-center px-2 py-2">
                {r.photo_url ? (
                  <img
                    src={r.photo_url}
                    alt="item"
                    className="w-[58px] h-[58px] object-cover rounded bg-gray-100 mx-auto"
                  />
                ) : (
                  <span className="text-gray-400">No photo</span>
                )}
              </td>
              {/* Actions: only spam, not edit/delete */}
              {user && (
                <td className="text-center px-2 py-2">
                  {canSpam(r) ? (
                    <button
                      className={`
                        font-semibold text-red-500 hover:underline cursor-pointer
                        text-[15px] px-2 py-1 transition
                        disabled:opacity-60
                      `}
                      onClick={() => reportSpam(r.report_id)}
                      disabled={spam[r.report_id]}
                      style={{
                        background: "none",
                        border: "none",
                      }}
                    >
                      {spam[r.report_id] ? "Spam Reported" : "Report as Spam"}
                    </button>
                  ) : spam[r.report_id] ? (
                    <span className="text-gray-400">Spam reported</span>
                  ) : (
                    ""
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

}

export default ViewReports;
