import { useContext, useEffect, useState } from "react";
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";

function FAQs() {
  const { fetchFAQslist, FAQslist } = useContext(InfoContext);
  const confirm = useConfirm();
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What is the barangay hotline?",
      answer: "You may call 1234567.",
    },
    {
      id: 2,
      question: "How to request barangay clearance?",
      answer: "Go to the barangay hall with valid ID.",
    },
  ]);

  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFAQslist();
  }, []);

  console.log(FAQslist);

  const handleChange = (e) => {
    setNewFAQ({ ...newFAQ, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to create a new FAQ?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      await api.post("/createfaq", {
        ...newFAQ,
      });
      alert("FAQ is successfully created!");
      setNewFAQ({ question: "", answer: "" });
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleEdit = (faq) => {
    setNewFAQ({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id);
  };

  const handleUpdate = () => {
    setFaqs(
      faqs.map((faq) => (faq.id === editingId ? { ...faq, ...newFAQ } : faq))
    );
    setEditingId(null);
    setNewFAQ({ question: "", answer: "" });
  };

  const handleDelete = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  return (
    <div className="modal-container">
      <div className="modal-content h-auto w-[30rem] p-4">
        <h2 className="text-xl font-bold mb-4">Barangay FAQs</h2>

        <div className="space-y-4 mb-6">
          {FAQslist.map((faq) => (
            <div
              key={faq._id}
              className="p-3 border rounded shadow-sm bg-white"
            >
              <p className="font-semibold">Q: {faq.question}</p>
              <p className="text-gray-600">A: {faq.answer}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="btn btn-sm bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="btn btn-sm bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            type="text"
            name="question"
            value={newFAQ.question}
            onChange={handleChange}
            placeholder="Enter question"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="answer"
            value={newFAQ.answer}
            onChange={handleChange}
            placeholder="Enter answer"
            className="w-full p-2 border rounded"
          />

          {editingId ? (
            <div className="space-x-2">
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update FAQ
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setNewFAQ({ question: "", answer: "" });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add FAQ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FAQs;
