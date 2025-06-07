import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";

function ViewHousehold({ onClose, householdID }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [selectedHousehold, setSelectedHousehold] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedPosition, setEditedPosition] = useState("");
  const [newMembers, setNewMembers] = useState([]);
  const { fetchResidents, residents } = useContext(InfoContext);
  const [memberSuggestions, setMemberSuggestions] = useState([]);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const response = await api.get(`/gethousehold/${householdID}`);
        setSelectedHousehold(response.data);
      } catch (error) {
        console.log("Error in fetching household", error);
      }
    };
    fetchHousehold();
  }, []);

  const sortedMembers = Array.isArray(selectedHousehold.members)
    ? [...selectedHousehold.members].sort((a, b) => {
        if (a.position?.toLowerCase() === "head") return -1;
        if (b.position?.toLowerCase() === "head") return 1;
        return 0;
      })
    : [];

  const handleEditMember = (member) => {
    setEditingMemberId(member._id);
    setEditedPosition(member.position);
  };

  const handleSavePosition = async (member) => {
    try {
      await api.put(`/household/${householdID}/member/${member._id}`, {
        position: editedPosition,
      });

      setSelectedHousehold((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m._id === member._id ? { ...m, position: editedPosition } : m
        ),
      }));

      setEditingMemberId(null);
      setEditedPosition("");
      alert("The member's position successfully updated.");
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditedPosition("");
  };

  const handleRemoveMember = async (member) => {
    const confirmDelete = await confirm(
      "Are you sure you want to remove this member?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/household/${householdID}/member/${member._id}`);
      setSelectedHousehold((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m._id !== member._id),
      }));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleAddMember = () => {
    setNewMembers((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        resID: null,
        position: "",
        resident: "",
        isNew: true,
      },
    ]);
  };

  const handleSaveNewMember = async (member) => {
    if (!member.resID || !member.position) {
      alert("Please select resident and position.");
      return;
    }
    try {
      const payload = {
        resID: member.resID._id,
        position: member.position,
      };

      const response = await api.post(
        `/household/${householdID}/member`,
        payload
      );

      setSelectedHousehold((prev) => ({
        ...prev,
        members: [...(prev.members || []), response.data],
      }));

      setNewMembers((prev) => prev.filter((m) => m.tempId !== member.tempId));
    } catch (error) {
      console.error("Error adding new member:", error);
    }
  };

  const handleCancelNewMember = (tempId) => {
    setNewMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  const handleMemberInputChange = (index, value) => {
    setNewMembers((prev) => {
      const updated = [...prev];
      updated[index].resident = value;
      updated[index].resID = null;
      return updated;
    });
    if (value.length > 0) {
      const filtered = residents
        .filter((r) => !r.householdno)
        .filter((r) => {
          const fullName = `${r.firstname} ${
            r.middlename ? r.middlename + " " : ""
          }${r.lastname}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        });
      setMemberSuggestions((prev) => ({
        ...prev,
        [index]: filtered,
      }));
    } else {
      setMemberSuggestions((prev) => ({
        ...prev,
        [index]: [],
      }));
    }
  };

  const handleMemberSuggestionClick = (index, resident) => {
    setNewMembers((prev) => {
      const updated = [...prev];
      updated[index].resID = resident;
      updated[index].resident = `${resident.firstname} ${
        resident.middlename ? resident.middlename + " " : ""
      }${resident.lastname}`;
      return updated;
    });

    setMemberSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Household</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            {selectedHousehold && (
              <div className="modal-form-container">
                <div>
                  <label>Household No.: </label>
                </div>

                <div>
                  <label>Address:</label>
                </div>
                <div>
                  <label>Members:</label>
                  {selectedHousehold.members &&
                  selectedHousehold.members.length > 0 ? (
                    <table className="min-w-full table-auto border-collapse border border-gray-300 mt-2">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 ">
                            #
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Name
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Position in the Family
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Age
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Birthdate
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Civil Status
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Occupation
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedMembers.map((member, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">
                              {index + 1}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID.lastname}, {member.resID.firstname}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {editingMemberId === member._id ? (
                                <select
                                  value={editedPosition}
                                  onChange={(e) =>
                                    setEditedPosition(e.target.value)
                                  }
                                  className="form-input"
                                >
                                  <option value="">Select Position</option>
                                  <option value="Head">Head</option>
                                  <option value="Spouse">Spouse</option>
                                  <option value="Child">Child</option>
                                  <option value="Parent">Parent</option>
                                  <option value="Sibling">Sibling</option>
                                  <option value="Grandparent">
                                    Grandparent
                                  </option>
                                  <option value="Grandchild">Grandchild</option>
                                  <option value="In-law">In-law</option>
                                  <option value="Relative">Relative</option>
                                  <option value="Housemate">Housemate</option>
                                  <option value="Househelp">Househelp</option>
                                  <option value="Other">Other</option>
                                </select>
                              ) : (
                                member.position
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID.age}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID.birthdate}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID.civilstatus}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID.occupation
                                ? member.resID.occupation
                                : "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {editingMemberId === member._id ? (
                                <>
                                  <button
                                    className="text-green-600 hover:underline mr-2"
                                    onClick={() => handleSavePosition(member)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="text-gray-600 hover:underline"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="text-blue-600 hover:underline mr-2"
                                    onClick={() => handleEditMember(member)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-600 hover:underline"
                                    onClick={() => handleRemoveMember(member)}
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}

                        {newMembers.map((member, index) => (
                          <tr key={`new-${member.tempId}`}>
                            <td className="border border-gray-300 px-4 py-2">
                              {sortedMembers.length + index + 1}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="text"
                                placeholder="Enter name"
                                value={member.resident || ""}
                                onChange={(e) =>
                                  handleMemberInputChange(index, e.target.value)
                                }
                                className="form-input w-full"
                                autoComplete="off"
                              />
                              {memberSuggestions[index] &&
                                memberSuggestions[index].length > 0 && (
                                  <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto">
                                    {memberSuggestions[index].map((res) => {
                                      const fullName = `${res.firstname} ${
                                        res.middlename
                                          ? res.middlename + " "
                                          : ""
                                      }${res.lastname}`;
                                      return (
                                        <li
                                          key={res._id}
                                          className="p-2 hover:bg-gray-200 cursor-pointer"
                                          onClick={() =>
                                            handleMemberSuggestionClick(
                                              index,
                                              res
                                            )
                                          }
                                        >
                                          {fullName}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <select
                                className="form-input"
                                value={member.position}
                                onChange={(e) =>
                                  setNewMembers((prev) =>
                                    prev.map((m) =>
                                      m.tempId === member.tempId
                                        ? { ...m, position: e.target.value }
                                        : m
                                    )
                                  )
                                }
                              >
                                <option value="">Select Position</option>
                                <option value="Head">Head</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Grandparent">Grandparent</option>
                                <option value="Grandchild">Grandchild</option>
                                <option value="In-law">In-law</option>
                                <option value="Relative">Relative</option>
                                <option value="Housemate">Housemate</option>
                                <option value="Househelp">Househelp</option>
                                <option value="Other">Other</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID?.age || "-"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID?.birthdate || "-"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID?.civilstatus || "-"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {member.resID?.occupation || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                className="text-green-600 hover:underline mr-2"
                                onClick={() => handleSaveNewMember(member)}
                                disabled={!member.resID || !member.position}
                              >
                                Save
                              </button>
                              <button
                                className="text-gray-600 hover:underline"
                                onClick={() =>
                                  handleCancelNewMember(member.tempId)
                                }
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 mt-2">
                      No other members listed.
                    </p>
                  )}
                  <div className="mt-4">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={handleAddMember}
                    >
                      Add Member
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ViewHousehold;
