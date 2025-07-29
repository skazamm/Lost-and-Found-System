import React, { useState } from "react";

// Best practice: Use a base URL variable for easy updates later.
const API_URL = "http://localhost:5000/api";

function ReportForm() {
  // Form state for report fields
  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    item_category: "",
    location: "",
    date_event: "",
  });

  // State for image file and UI feedback
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle changes for text fields
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleImageChange = e => {
    setImage(e.target.files[0]);
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to submit a report.');
      setSubmitting(false);
      return;
    }

    // Required fields validation
    if (!form.title || !form.description || !form.location || !form.date_event) {
      setMessage('All required fields must be filled out.');
      setSubmitting(false);
      return;
    }

    let photo_url = '';
    // 1. Upload image if selected
    if (image) {
      const formData = new FormData();
      formData.append('image', image);

      try {
        const imgRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const imgData = await imgRes.json();
        if (!imgRes.ok || !imgData.url) {
          setMessage(imgData.error || 'Image upload failed.');
          setSubmitting(false);
          return;
        }
        photo_url = imgData.url;
      } catch (err) {
        setMessage('Image upload error.');
        setSubmitting(false);
        return;
      }
    }

    // 2. Submit report, always include photo_url (even if empty)
    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, photo_url }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Report submitted successfully!');
        setForm({
          type: 'lost',
          title: '',
          description: '',
          item_category: '',
          location: '',
          date_event: '',
        });
        setImage(null);
      } else {
        setMessage(data.error || 'Failed to submit.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

return (
  <div
    className={`
      max-w-[400px] mx-auto mt-10 p-6 rounded-xl
      bg-gray-50 shadow border border-gray-200
    `}
  >
    <h2 className="text-xl font-semibold text-center mb-4">
      Submit Lost/Found Report
    </h2>
    <form onSubmit={handleSubmit}>
      {/* Type */}
      <label className="block font-semibold mb-1">
        Type*
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="
            w-full mt-1 mb-3 px-3 py-2 rounded border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        >
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </label>
      {/* Title */}
      <label className="block font-semibold mb-1">
        Title*
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="
            w-full mt-1 mb-3 px-3 py-2 rounded border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        />
      </label>
      {/* Description */}
      <label className="block font-semibold mb-1">
        Description*
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          required
          className="
            w-full mt-1 mb-3 px-3 py-2 rounded border border-gray-300 resize-vertical
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        />
      </label>
      {/* Category */}
      <label className="block font-semibold mb-1">
        Category
        <input
          type="text"
          name="item_category"
          placeholder="Category (e.g., Wallet, Bag)"
          value={form.item_category}
          onChange={handleChange}
          className="
            w-full mt-1 mb-3 px-3 py-2 rounded border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        />
      </label>
      {/* Location */}
      <label className="block font-semibold mb-1">
        Location*
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          className="
            w-full mt-1 mb-3 px-3 py-2 rounded border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        />
      </label>
      {/* Date */}
      <label className="block font-semibold mb-1">
        Date of Event*
        <input
          type="date"
          name="date_event"
          value={form.date_event}
          onChange={handleChange}
          required
          className="
            w-full mt-1 mb-4 px-3 py-2 rounded border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-600
          "
        />
      </label>
      {/* Photo */}
      <label className="block font-semibold mb-1">
        Photo
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block mt-1 mb-4"
        />
      </label>
      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className={`
          w-full py-2 rounded-md font-semibold text-white
          bg-blue-600 hover:bg-blue-700 transition
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow
        `}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
    {/* Message */}
    <div className={`mt-3 min-h-[24px] text-center font-medium ${
      message.startsWith("✅") ? "text-emerald-600" : "text-red-500"
    }`}>
      {message}
    </div>
  </div>
);

}

export default ReportForm;
