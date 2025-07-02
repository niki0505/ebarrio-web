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

  // const handleSavePosition = async (member) => {
  //   try {
  //     await api.put(`/household/${householdID}/member/${member._id}`, {
  //       position: editedPosition,
  //     });

  //     setSelectedHousehold((prev) => ({
  //       ...prev,
  //       members: prev.members.map((m) =>
  //         m._id === member._id ? { ...m, position: editedPosition } : m
  //       ),
  //     }));

  //     setEditingMemberId(null);
  //     setEditedPosition("");
  //     alert("The member's position successfully updated.");
  //   } catch (error) {
  //     console.error("Error updating position:", error);
  //   }
  // };

  // const handleCancelEdit = () => {
  //   setEditingMemberId(null);
  //   setEditedPosition("");
  // };

  // const handleRemoveMember = async (member) => {
  //   const isConfirmed = await confirm(
  //     "Are you sure you want to remove this member?"
  //   );
  //   if (!isConfirmed) return;

  //   try {
  //     await api.delete(`/household/${householdID}/member/${member._id}`);
  //     setSelectedHousehold((prev) => ({
  //       ...prev,
  //       members: prev.members.filter((m) => m._id !== member._id),
  //     }));
  //     alert("Member has been removed successfully.");
  //   } catch (error) {
  //     console.error("Error removing member:", error);
  //   }
  // };

  // const handleAddMember = () => {
  //   setNewMembers((prev) => [
  //     ...prev,
  //     {
  //       tempId: Date.now(),
  //       resID: null,
  //       position: "",
  //       resident: "",
  //       isNew: true,
  //     },
  //   ]);
  // };

  // const handleSaveNewMember = async (member) => {
  //   if (!member.resID || !member.position) {
  //     alert("Please select resident and position.");
  //     return;
  //   }
  //   try {
  //     const payload = {
  //       resID: member.resID._id,
  //       position: member.position,
  //     };

  //     const response = await api.post(
  //       `/household/${householdID}/member`,
  //       payload
  //     );

  //     setSelectedHousehold((prev) => ({
  //       ...prev,
  //       members: [...(prev.members || []), response.data],
  //     }));

  //     setNewMembers((prev) => prev.filter((m) => m.tempId !== member.tempId));
  //   } catch (error) {
  //     console.error("Error adding new member:", error);
  //   }
  // };

  // const handleCancelNewMember = (tempId) => {
  //   setNewMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  // };

  // const handleMemberInputChange = (index, value) => {
  //   setNewMembers((prev) => {
  //     const updated = [...prev];
  //     updated[index].resident = value;
  //     updated[index].resID = null;
  //     return updated;
  //   });
  //   if (value.length > 0) {
  //     const filtered = residents
  //       .filter((r) => !r.householdno)
  //       .filter((r) => {
  //         const fullName = `${r.firstname} ${
  //           r.middlename ? r.middlename + " " : ""
  //         }${r.lastname}`.toLowerCase();
  //         return fullName.includes(value.toLowerCase());
  //       });
  //     setMemberSuggestions((prev) => ({
  //       ...prev,
  //       [index]: filtered,
  //     }));
  //   } else {
  //     setMemberSuggestions((prev) => ({
  //       ...prev,
  //       [index]: [],
  //     }));
  //   }
  // };

  // const handleMemberSuggestionClick = (index, resident) => {
  //   setNewMembers((prev) => {
  //     const updated = [...prev];
  //     updated[index].resID = resident;
  //     updated[index].resident = `${resident.firstname} ${
  //       resident.middlename ? resident.middlename + " " : ""
  //     }${resident.lastname}`;
  //     return updated;
  //   });

  //   setMemberSuggestions((prev) => ({
  //     ...prev,
  //     [index]: [],
  //   }));
  // };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content w-[70rem] h-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Household</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  />
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            {selectedHousehold && (
              <div className="modal-form-container">
                <div className="modal-form">
                  <div className="col-span-1 flex-row">
                    <label>
                      <strong>Household No.:</strong>
                      {selectedHousehold.householdno}
                    </label>
                  </div>

                  <div className="col-span-1">
                    <strong>Address: </strong>
                    {selectedHousehold.members?.find(
                      (member) => member.position === "Head"
                    )?.resID?.address || "No address found"}
                  </div>

                  <div className="col-span-1">
                    <label>
                      <strong>Ethnicity: </strong> {selectedHousehold.ethnicity}
                    </label>
                  </div>

                  {selectedHousehold.ethnicity === "IP Household" && (
                    <div className="col-span-1">
                      <label>
                        <strong>Tribe: </strong>
                        {selectedHousehold.tribe}
                      </label>
                    </div>
                  )}

                  <div>
                    <label>
                      <strong>Socioeconomic Status: </strong>
                      {selectedHousehold.sociostatus}
                    </label>
                  </div>

                  {(selectedHousehold.sociostatus === "NHTS Non-4Ps" ||
                    selectedHousehold.sociostatus === "NHTS 4Ps") && (
                    <div>
                      <label>
                        <strong>NHTS No.: </strong>
                        {selectedHousehold.nhtsno}
                      </label>
                    </div>
                  )}

                  <div>
                    <label>
                      <strong>Water Source: </strong>
                      {selectedHousehold.watersource}
                    </label>
                  </div>

                  <div>
                    <label>
                      <strong>Toilet Facility: </strong>
                      {selectedHousehold.toiletfacility}
                    </label>
                  </div>

                  <div>
                    <h1 className="mt-8 font-bold">Members:</h1>
                    {selectedHousehold.members &&
                    selectedHousehold.members.length > 0 ? (
                      <div className="overflow-x-auto mt-2 max-h-[16rem]">
                        <table className="min-w-full table-auto border-collapse border border-gray-300 text-xs">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-4 py-2">
                                #
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Name
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Position in the Family
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Sex
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
                                PhilHealth ID
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Membership Type
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                PhilHealth Category
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Medical History
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Last Menstrual Period
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Using any FP method?
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Family Planning Method
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                FP Status
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Classification
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Educational Attainment
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Religion
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
                                  {member.resID.lastname},{" "}
                                  {member.resID.firstname}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.position}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.sex}
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
                                  {member.resID.philhealthid || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.philhealthtype || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.philhealthcategory || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.haveDiabetes ||
                                  member.resID.haveHypertension ||
                                  member.resID.haveTubercolosis ||
                                  member.resID.haveSurgery ? (
                                    <>
                                      {member.resID.haveDiabetes && (
                                        <div>Diabetes</div>
                                      )}
                                      {member.resID.haveHypertension && (
                                        <div>Hypertension</div>
                                      )}
                                      {member.resID.haveTubercolosis && (
                                        <div>Tubercolosis</div>
                                      )}
                                      {member.resID.haveSurgery && (
                                        <div>Surgery</div>
                                      )}
                                    </>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.lastmenstrual || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.haveFPmethod || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.fpmethod || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.fpstatus || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.isSenior ||
                                  member.resID.isInfant ||
                                  member.resID.isPregnant ||
                                  member.resID.isPWD ||
                                  member.resID.isNewborn ||
                                  member.resID.isUnder5 ||
                                  member.resID.isSchoolAge ||
                                  member.resID.isAdolescent ||
                                  member.resID.isAdolescentPregnant ||
                                  member.resID.isAdult ||
                                  member.resID.isPostpartum ||
                                  member.resID.isWomenOfReproductive ? (
                                    <>
                                      {member.resID.isSenior && (
                                        <div>Senior Citizen</div>
                                      )}
                                      {member.resID.isInfant && (
                                        <div>Infant</div>
                                      )}
                                      {member.resID.isPregnant && (
                                        <div>Pregnant</div>
                                      )}
                                      {member.resID.isPWD && <div>PWD</div>}
                                      {member.resID.is4Ps && <div>4Ps</div>}
                                      {member.resID.isSoloParent && (
                                        <div>Solo Parent</div>
                                      )}
                                      {member.resID.isNewborn && (
                                        <div>Newborn</div>
                                      )}
                                      {member.resID.isUnder5 && (
                                        <div>Under 5 y.o.</div>
                                      )}
                                      {member.resID.isSchoolAge && (
                                        <div>School Age</div>
                                      )}
                                      {member.resID.isAdolescent && (
                                        <div>Adolescent</div>
                                      )}
                                      {member.resID.isAdolescentPregnant && (
                                        <div>Adolescent Pregnant</div>
                                      )}
                                      {member.resID.isAdult && <div>Adult</div>}
                                      {member.resID.isPostpartum && (
                                        <div>Postpartum</div>
                                      )}
                                      {member.resID.isWomenOfReproductive && (
                                        <div>Women of Reproductive Age</div>
                                      )}
                                    </>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.educationalattainment || "N/A"}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {member.resID.religion || "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No members found.</p>
                    )}
                  </div>

                  <div>
                    <h1 className="mt-8 font-bold">Vehicles:</h1>
                    {selectedHousehold.vehicles &&
                    selectedHousehold.vehicles.length > 0 ? (
                      <div className="overflow-x-auto mt-2 max-h-[16rem]">
                        <table className="min-w-full table-auto border-collapse border border-gray-300 text-xs">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-4 py-2">
                                #
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Model
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Color
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Kind
                              </th>
                              <th className="border border-gray-300 px-4 py-2">
                                Plate Number
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedHousehold.vehicles.map(
                              (vehicle, index) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 px-4 py-2">
                                    {index + 1}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    {vehicle.model}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    {vehicle.color}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    {vehicle.kind}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2">
                                    {vehicle.platenumber}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No vehicles found.</p>
                    )}
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
