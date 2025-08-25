import { useContext, useEffect, useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

//ICONS
import { FaEdit } from "react-icons/fa";
import { IoArchiveSharp } from "react-icons/io5";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

function FAQs() {
  const { fetchFAQslist, FAQslist } = useContext(InfoContext);
  const confirm = useConfirm();

  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const [editingId, setEditingId] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

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
      alert("FAQ has been successfully created.");
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
    setEditingId(faq._id);
  };

  const handleUpdate = async () => {
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to update this FAQ?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      await api.post(`/editfaq/${editingId}`, {
        ...newFAQ,
      });
      alert("FAQ has been successfully updated.");
      setEditingId(null);
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

  const handleArchive = async (faqID) => {
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to archive this FAQ?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      await api.put(`/archivefaq/${faqID}`);
      alert("FAQ has been successfully archived.");
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

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <>
      <div className="modal-container">
        <div className="modal-content h-[24rem] w-[30rem]">
          <div className="dialog-title-bar">
            <div className="flex flex-col w-full">
              <div className="dialog-title-bar-items">
                <h2 className="modal-title">Frequently Asked Questions</h2>
                <IoClose class="dialog-title-bar-icon"></IoClose>
              </div>
              <hr className="dialog-line" />
            </div>
          </div>

          <div className="modal-form-container">
            <div className="h-full overflow-y-auto flex-col">
              <div className="flex flex-col space-y-2">
                {FAQslist.map((faq) => (
                  <div
                    key={faq._id}
                    className="cursor-pointer bg-gray-200 rounded-[8px] shadow-sm"
                    onClick={() => toggleFAQ(faq._id)}
                  >
                    {/* Question header */}
                    <div className="flex items-center justify-between p-2">
                      <p className="form-label !font-semibold ">{faq.question}</p>
                      <p className="text-btn-color-blue text-lg">
                        {expandedFAQ === faq._id ? (
                          <FaMinus className="text-[14px] text-navy-blue" />
                        ) : (
                          <FaPlus className="text-[14px] text-navy-blue" />
                        )}
                      </p>
                    </div>

                    {expandedFAQ === faq._id && (
                      <div className="border-t border-gray-500" />
                    )}

                    {/* Expanded answer */}
                    <div
                      className={`faq-answer ${
                        expandedFAQ === faq._id ? "expanded" : ""
                      }`}
                    >
                      <p className="form-label !font-subTitle !font-semibold ml-2 mt-2">
                        - {faq.answer}
                      </p>
                      <div className="mt-2 mr-4 mb-4 space-x-2 flex flex-row items-center justify-end">
                        <button
                          className="table-actions-container"
                          type="button"
                          onClick={() => handleEdit(faq)}
                        >
                          <FaEdit className="text-[16px] text-btn-color-blue" />
                          <label className="text-btn-color-blue text-xs">
                            EDIT
                          </label>
                        </button>

                        <button
                          className="table-actions-container"
                          type="button"
                          onClick={() => handleArchive(faq._id)}
                        >
                          <IoArchiveSharp className="text-[16px] text-btn-color-blue" />
                          <label className="text-btn-color-blue text-xs">
                            ARCHIVE
                          </label>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-navy-blue font-medium text-[16px] mt-4">
                Add Question
              </p>

              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  name="question"
                  value={newFAQ.question}
                  onChange={handleChange}
                  placeholder="Enter question"
                  className="form-input"
                />
                <input
                  type="text"
                  name="answer"
                  value={newFAQ.answer}
                  onChange={handleChange}
                  placeholder="Enter answer"
                  className="form-input"
                />
              </div>

              {editingId ? (
                <div className="flex gap-x-4 justify-center">
                  <button
                    onClick={handleUpdate}
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Update FAQ
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewFAQ({ question: "", answer: "" });
                    }}
                    className="actions-btn bg-btn-color-gray hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleAdd}
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Add FAQ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQs;
