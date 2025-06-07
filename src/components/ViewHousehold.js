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

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

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
                              {member.position}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 mt-2">
                      No other members listed.
                    </p>
                  )}
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
