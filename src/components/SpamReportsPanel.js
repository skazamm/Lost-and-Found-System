import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function SpamReportsPanel({ onSpamCountChange }) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [spamReports, setSpamReports] = useState([]);


  // Fetch flagged (spam) reports
  const fetchSpamReports = async () => {
    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/reports-spam`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSpamReports(data);
      // Notify parent of current spam count
      if (onSpamCountChange) onSpamCountChange(data.length);
    } catch {
      setMessage("Failed to load spam reports.");
      setSpamReports([]);
      if (onSpamCountChange) onSpamCountChange(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSpamReports();
    // Only on mount; refresh on actions below
    // eslint-disable-next-line
  }, []);

  // Call the count update on change
  useEffect(() => {
    if (onSpamCountChange) onSpamCountChange(spamReports.length);
    // eslint-disable-next-line
  }, [spamReports.length]);

  // Dismiss spam flags
  const dismissSpam = async (report_id) => {
    if (!window.confirm("Remove spam flags for this report?")) return;
    setMessage("");
    setBusyId(report_id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/reports/${report_id}/dismiss-spam`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setMessage("Spam flags removed.");
      await fetchSpamReports();
      if (onSpamCountChange) onSpamCountChange();

    } catch {
      setMessage("Failed to dismiss spam.");
    }
    setBusyId(null);
  };

  // Delete report permanently
  const deleteReport = async (report_id) => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setMessage("");
    setBusyId(report_id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/reports/${report_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setMessage("Report deleted.");
      await fetchSpamReports();
      if (onSpamCountChange) onSpamCountChange();

    } catch {
      setMessage("Delete failed.");
    }
    setBusyId(null);
  };

return (
  <div style={{ marginTop: 30 }}>
    <div style={{ color: "#ef4444", marginBottom: 12 }}>{message}</div>
    {loading ? (
      <div>Loading...</div>
    ) : (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 10px #e0e7ff"
        }}
      >
        <thead>
          <tr>
            <th style={{ minWidth: 70, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Type</th>
            <th style={{ minWidth: 120, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Title</th>
            <th style={{ minWidth: 50, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Flags</th>
            <th style={{ minWidth: 100, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Flagged By</th>
            <th style={{ minWidth: 90, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Date</th>
            <th style={{ minWidth: 80, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Status</th>
            <th style={{ minWidth: 70, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Photo</th>
            <th style={{ minWidth: 140, textAlign: "center", background: "#f3f4f6", color: "#374151", fontWeight: 700, padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {spamReports.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "#aaa", padding: 28 }}>
                No flagged reports.
              </td>
            </tr>
          ) : (
            spamReports.map((r) => (
              <tr key={r.report_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>{r.type}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>{r.title}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>{r.flag_count}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle", fontSize: 13, padding: 8 }}>
                  {(r.flagged_by || []).join(", ")}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>
                  {r.date_event ? new Date(r.date_event).toLocaleDateString() : ""}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>{r.status}</td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>
                  {r.photo_url ? (
                    <img
                      src={r.photo_url}
                      alt="item"
                      style={{
                        width: 45,
                        height: 45,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #e0e7ff",
                        background: "#f3f4f6",
                        display: "block",
                        margin: "0 auto"
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/45?text=No+Photo";
                      }}
                    />
                  ) : (
                    <span style={{ color: "#ccc" }}>No photo</span>
                  )}
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: 8 }}>
                  <button
                    onClick={() => deleteReport(r.report_id)}
                    style={{
                      color: "#fff",
                      background: "#ef4444", // Alert Red
                      marginRight: 8,
                      padding: "6px 16px",
                      borderRadius: 5,
                      border: "none",
                      fontWeight: 600,
                      cursor: busyId ? "not-allowed" : "pointer",
                      opacity: busyId === r.report_id ? 0.7 : 1,
                      minWidth: 70,
                      transition: "background 0.2s"
                    }}
                    disabled={!!busyId}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => dismissSpam(r.report_id)}
                    style={{
                      color: "#fff",
                      background: "#22c55e", // Success Green
                      padding: "6px 16px",
                      borderRadius: 5,
                      border: "none",
                      fontWeight: 600,
                      cursor: busyId ? "not-allowed" : "pointer",
                      opacity: busyId === r.report_id ? 0.7 : 1,
                      minWidth: 70,
                      transition: "background 0.2s"
                    }}
                    disabled={!!busyId}
                  >
                    Dismiss
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )}
  </div>
);

}

export default SpamReportsPanel;
