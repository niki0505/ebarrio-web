import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { InfoContext } from "../context/InfoContext";
import OpenCamera from "./OpenCamera";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { FiCamera, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { BiSolidImageAlt } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function AccountSettings({ isCollapsed }) {
  const { user, logout } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [isProfileClicked, setProfileClicked] = useState(
    user.role !== "Technical Admin"
  );
  const [isUsernameClicked, setUsernameClicked] = useState(
    user.role === "Technical Admin"
  );
  const [isPasswordClicked, setPasswordClicked] = useState(false);
  const [isQuestionsClicked, setQuestionsClicked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [renewpassword, setRenewPassword] = useState("");
  const [securityquestions, setSecurityQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const confirm = useConfirm();
  const [residentInfo, setResidentInfo] = useState([]);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [mobileNumError, setMobileNumError] = useState("");
  const [curPasswordError, setCurPasswordError] = useState("");
  const [emMobileNumError, setEmMobileNumError] = useState("");
  const [telephoneNumError, setTelephoneNumError] = useState("");
  const { fetchResidents, residents } = useContext(InfoContext);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [id, setId] = useState();
  const [signature, setSignature] = useState(null);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [residentForm, setResidentForm] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
    emergencyaddress: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
    mother: "",
    father: "",
    spouse: "",
    siblings: [],
    children: [],
    numberofsiblings: 0,
    numberofchildren: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    course: "",
  });

  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showConfirmAnswer1, setShowConfirmAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);
  const [showConfirmAnswer2, setShowConfirmAnswer2] = useState(false);
  const [showSecurityPass, setShowSecurityPass] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/getcurrentuser/${user.userID}`);

        setUserDetails(response.data);

        try {
          const response2 = await api.get(
            `/getresident/${response.data.empID.resID._id}`
          );
          setResidentInfo(response2.data);
        } catch (error) {
          console.log("Error fetching resident", error);
        }

        if (
          !Array.isArray(response.data.securityquestions) ||
          response.data.securityquestions.length === 0
        ) {
          return;
        }

        setSecurityQuestions([
          {
            question: response.data.securityquestions[0]?.question || "",
            answer: "",
          },
          {
            question: response.data.securityquestions[1]?.question || "",
            answer: "",
          },
        ]);
      } catch (error) {
        console.log("Error fetching user details", error);
      }
    };
    fetchUserDetails();
  }, [user.userID]);

  const handleMenu1 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setProfileClicked(true);
    setUsernameClicked(false);
    setPasswordClicked(false);
    setQuestionsClicked(false);
  };
  const handleMenu2 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setUsernameClicked(true);
    setProfileClicked(false);
    setPasswordClicked(false);
    setQuestionsClicked(false);
  };
  const handleMenu3 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setPasswordClicked(true);
    setUsernameClicked(false);
    setProfileClicked(false);
    setQuestionsClicked(false);
  };

  const handleMenu4 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setQuestionsClicked(true);
    setPasswordClicked(false);
    setUsernameClicked(false);
    setProfileClicked(false);
  };

  const handleSecurityChange = (index, field, value) => {
    const updated = [...securityquestions];
    updated[index][field] = value;
    setSecurityQuestions(updated);
  };

  const securityQuestionsList = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What was your childhood name?",
    "What is your favorite book?",
    "What is your favorite movie of all time?",
    "What is the name of your first crush?",
    "What is the name of your favorite teacher?",
    "What is the name of of your first childhood friend?",
    "What city you were born in?",
  ];

  const handleUsernameChange = async () => {
    let hasErrors = false;

    let uerrors = [];

    if (!username) {
      uerrors.push("Username must not be empty.");
      setUsernameErrors(uerrors);
      hasErrors = true;
    }

    if (!password) {
      setCurPasswordError("Password must not be empty.");
      hasErrors = true;
    }

    if (username === user.username) {
      alert("The new username must be different from the current username.");
      hasErrors = true;
    }

    if (usernameErrors !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const isConfirmed = await confirm(
        "Are you sure you want to update your username?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      try {
        await api.get(`/checkusername/${username}`);
        try {
          await api.put(`/changeusername/${user.userID}`, {
            username,
            password,
          });
          alert("Username has been changed successfully.");
          setUsername("");
          setPassword("");
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
    } catch (error) {
      console.log("Error in changing username", error);
    }
  };

  const handlePasswordChange = async () => {
    let hasErrors = false;
    let nerrors = [];
    let rerrors = [];

    if (!password) {
      setCurPasswordError("Password must not be empty.");
      hasErrors = true;
    }

    if (!newpassword) {
      nerrors.push("Password must not be empty.");
      setPasswordErrors(nerrors);
      hasErrors = true;
    }

    if (!renewpassword) {
      rerrors.push("Password must not be empty.");
      setRePasswordErrors(rerrors);
      hasErrors = true;
    }

    if (passwordErrors.length !== 0) {
      hasErrors = true;
    }

    if (repasswordErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to update your password?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      if (newpassword !== renewpassword) {
        alert("Passwords do not match.");
        return;
      }
      try {
        await api.put(`/changepassword/${user.userID}`, {
          newpassword,
          password,
        });
        alert("Password has been changed successfully. Please log in again.");
        logout();
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
    } catch (error) {
      console.log("Error in changing password", error);
    }
  };

  const handleQuestionsChange = async () => {
    let hasErrors = false;
    const modifiedQuestions = securityquestions.map((q, index) => {
      const current = userDetails.securityquestions?.[index];
      const isSameQuestion = current?.question === q.question;
      const hasNewAnswer = q.answer?.trim() !== "";

      if (!isSameQuestion && hasNewAnswer) {
        return q;
      } else if (isSameQuestion && hasNewAnswer) {
        return { question: q.question, answer: q.answer };
      } else {
        return null;
      }
    });

    const hasChanges = modifiedQuestions.some((q) => q !== null);
    if (!password) {
      setCurPasswordError("Password must not be empty.");
      hasErrors = true;
    } else {
      if (!hasChanges) {
        alert("No changes detected in your security questions.");
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to update your security questions?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      try {
        await api.put(`/changesecurityquestions/${user.userID}`, {
          securityquestions: modifiedQuestions,
          password,
        });
        alert("Security questions have been changed successfully.");
        setPassword("");
        setSecurityQuestions((prevQuestions) =>
          prevQuestions.map((q) => ({
            ...q,
            answer: "",
          }))
        );
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
    } catch (error) {
      console.log("Error in changing security questions", error);
    }
  };

  /* Profile */

  useEffect(() => {
    if (residentInfo) {
      let houseNumber = "";
      let streetName = "";
      const siblingsLength = residentInfo.siblings
        ? residentInfo.siblings.length
        : 0;
      const childrenLength = residentInfo.children
        ? residentInfo.children.length
        : 0;

      const address = residentInfo.address || "";

      const firstWord = address.trim().split(" ")[0];
      const isNumber = !isNaN(firstWord);

      if (isNumber) {
        houseNumber = firstWord;
        const preStreetName = address.split("Aniban")[0].trim();
        const streetWords = preStreetName.split(" ");
        streetWords.shift();
        streetName = streetWords.join(" ");
      } else {
        streetName = address.split("Aniban")[0].trim();
        houseNumber = "";
      }

      let formattedNumber =
        residentInfo.mobilenumber && residentInfo.mobilenumber.length > 0
          ? "+63" + residentInfo.mobilenumber.slice(1)
          : "";

      let formattedEmergencyNumber =
        residentInfo.emergencymobilenumber &&
        residentInfo.emergencymobilenumber.length > 0
          ? "+63" + residentInfo.emergencymobilenumber.slice(1)
          : "";

      let formattedTelephone =
        residentInfo.telephone && residentInfo.telephone.length > 0
          ? "+63" + residentInfo.telephone.slice(1)
          : "+63";

      setResidentForm((prevForm) => ({
        ...prevForm,
        ...residentInfo,
        numberofsiblings: siblingsLength,
        numberofchildren: childrenLength,
        street: streetName,
        housenumber: houseNumber,
        mobilenumber: formattedNumber,
        emergencymobilenumber: formattedEmergencyNumber,
        telephone: formattedTelephone,
      }));
      if (residentInfo.picture) setId(residentInfo.picture);
      if (residentInfo.signature) setSignature(residentInfo.signature);
    }
  }, [residentInfo]);

  const renderSiblingsDropdown = () => {
    const numberOfSiblings = parseInt(residentForm.numberofsiblings, 10) || 0;

    const siblingsDropdowns = [];
    for (let i = 0; i < numberOfSiblings; i++) {
      siblingsDropdowns.push(
        <div key={i} className="form-group">
          <label htmlFor={`sibling-${i}`} className="form-label">
            Sibling
          </label>
          <select
            id={`sibling-${i}`}
            name={`sibling-${i}`}
            onChange={(e) => handleMultipleDropdownChange(e, i, "siblings")}
            value={residentForm.siblings[i]}
            className="form-input"
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option key={element._id} value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return siblingsDropdowns;
  };

  const renderChildrenDropdown = () => {
    const numberOfChildren = parseInt(residentForm.numberofchildren, 10) || 0;

    const childrenDropdowns = [];
    for (let i = 0; i < numberOfChildren; i++) {
      childrenDropdowns.push(
        <div key={i} className="form-group">
          <label htmlFor={`child-${i}`} className="form-label">
            Child
          </label>
          <select
            id={`child-${i}`}
            name={`child-${i}`}
            onChange={(e) => handleMultipleDropdownChange(e, i, "children")}
            value={residentForm.children[i]}
            className="form-input"
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option key={element._id} value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return childrenDropdowns;
  };

  // DROPDOWN VALUES
  const suffixList = ["Jr.", "Sr.", "I", "II", "III", "IV", "None"];
  const salutationList = [
    "Mr.",
    "Mrs.",
    "Mx.",
    "Dr.",
    "Prof.",
    "Rev.",
    "Hon.",
    "Capt.",
    "Col.",
    "Gen.",
    "Lt.",
    "Sgt.",
    "None",
  ];
  const sexList = ["Male", "Female"];
  const genderList = [
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Agender",
    "Other",
    "Prefer not to say",
  ];
  const civilstatusList = [
    "Single",
    "Married",
    "Divorced",
    "Widowed",
    "Separated",
    "Annulled",
    "Common-Law/Live-In",
  ];
  const bloodtypeList = [
    "A",
    "A-",
    "B",
    "B-",
    "AB",
    "AB-",
    "O",
    "O-",
    "Unknown",
  ];
  const religionList = [
    "Adventist",
    "Aglipayan (Philippine Independence Church)",
    "Baptist World Alliance",
    "Born Again Christian",
    "Church of Christ",
    "Church Jesus Christ and the Latter Day Saints",
    "Church of the Nazarene",
    "El Shaddai",
    "Evangelical",
    "Full Gospel",
    "Iglesia ni Cristo",
    "Islam",
    "Jehovah’s Witnesses",
    "Judaism",
    "MCGI (Dating Daan)",
    "Methodist",
    "Mormons",
    "Pentecost",
    "Protestants",
    "Roman Catholic",
    "Seventh Day Adventists (Central Phil. Union Conf.)",
    "Worldwide Church of God",
    "Other",
    "Prefer not to say",
  ];
  const nationalityList = [
    "Filipino",
    "American",
    "Chinese",
    "Indian",
    "Japanese",
    "Korean",
    "Australian",
    "British",
    "Canadian",
    "German",
    "French",
    "Spanish",
    "Italian",
    "Mexican",
    "Russian",
    "Other",
  ];

  const streetList = [
    "Zapote-Molino Road",
    "1st Street",
    "2nd Street",
    "3rd Street",
    "4th Street",
    "5th Street",
    "6th Street",
    "8th Street",
    "8th Street Exnt",
    "5th Street Exnt",
    "Dominga Rivera Street",
    "Tabing-Ilog Street",
    "Arko",
    "9th Street",
    "10th Street",
    "11th Street",
  ];

  const employmentstatusList = [
    "Employed",
    "Part-Time",
    "Student",
    "Unemployed",
    "Seasonal",
    "Contractual",
    "Compensation",
    "Self-Employed",
    "Retired",
    "Displaced Worker",
    "Homemaker",
    "Intern",
    "Working for Private Household",
    "Working for Private Business/Establishment/Farm",
    "Working for Government/Government Corporation",
    "Self-Employed with No Paid Employee",
    "Employer in Own Family-Oriented Farm/Business",
    "Working with Pay on Own-Family Operated Farm/Business",
    "Working without Pay on Own-Family Operated Farm/Business",
  ];

  const monthlyincomeList = [
    "0-1,000",
    "1,001-5,000",
    "5,001-10,000",
    "10,001-25,000",
    "25,001-50,000",
    "50,001-75,000",
    "75,001-100,000",
    "100,001-250,000",
    "250,001-500,000",
    "500,001-1,000,000",
    "1,000,001+",
  ];

  const educationalattainmentList = [
    "No Formal Education",
    "Day Care",
    "Kindergarten/Preparatory",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "1st Year PS/N-T/TV",
    "2nd Year PS/N-T/TV",
    "3rd Year PS/N-T/TV",
    "1st Year College",
    "2nd Year College",
    "3rd Year College",
    "4th Year College or Higher",
    "ALS Elementary",
    "ALS Secondary",
    "SPED Elementary",
    "SPED Secondary",
    "Grade School Graduate",
    "High School Graduate",
    "Post-Secondary Graduate",
    "Post-Grad with Units",
    "College Graduate",
    "Masters/PHD Graduate",
  ];

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultipleDropdownChange = (e, index, field) => {
    const selectedValue = e.target.value;
    const updatedArray = [...residentForm[field]];
    updatedArray[index] = selectedValue;
    setResidentForm({
      ...residentForm,
      [field]: updatedArray,
    });
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersOnly = value.replace(/[^a-zA-Z\s.]/g, "");
    const capitalizeFirstLetter = lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const numbersAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: numbersOnly,
    }));
  };

  const lettersNumbersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersAndNumbersOnly = value.replace(/[^a-zA-Z0-9\s.,]/g, "");
    const capitalizeFirstLetter = lettersAndNumbersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const stringsAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const stringsOnly = value.replace(/[^a-zA-Z0-9./:?&=]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: stringsOnly,
    }));
  };

  const toggleCamera = () => {
    setIsCameraOpen(true);
  };

  const handleUploadID = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleUploadSig = (event) => {
    hiddenInputRef2.current.click();
  };

  const handleChangeID = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsIDProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setId(url);
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsIDProcessing(false);
      }
    }
  };

  const handleDone = (url) => {
    setIsIDProcessing(true);
    setTimeout(() => {
      setIsCameraOpen(false);
      setId(url);
      setIsIDProcessing(false);
    }, 500);
  };

  const handleClose = () => {
    setIsCameraOpen(false);
  };
  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    let hasErrors = false;

    if (!id) {
      alert("Picture is required");
      hasErrors = true;
    } else if (!signature) {
      alert("Signature is required");
      hasErrors = true;
    }
    if (residentForm.mobilenumber && residentForm.mobilenumber.length !== 13) {
      setMobileNumError("Invalid mobile number.");
      hasErrors = true;
    }
    if (residentForm.mobilenumber && residentForm.mobilenumber.length !== 13) {
      setEmMobileNumError("Invalid mobile number.");
      hasErrors = true;
    }

    if (
      residentForm.telephone.length > 3 &&
      residentForm.telephone.length < 12
    ) {
      setTelephoneNumError("Invalid telephone.");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      let idPicture;
      let signaturePicture;
      const isConfirmed = await confirm(
        "Are you sure you want to edit this resident profile?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      if (residentForm.numberofsiblings == 0) {
        residentForm.siblings = [];
      } else {
        residentForm.siblings = residentForm.siblings.slice(
          0,
          residentForm.numberofsiblings
        );
      }

      if (residentForm.numberofchildren == 0) {
        residentForm.children = [];
      } else {
        residentForm.children = residentForm.children.slice(
          0,
          residentForm.numberofchildren
        );
      }
      const fulladdress = `${residentForm.housenumber} ${residentForm.street} Aniban 2, Bacoor, Cavite`;
      if (id !== residentInfo.picture) {
        console.log("Uploading new picture...");
        idPicture = await uploadToFirebase(id);
      } else {
        idPicture = residentInfo.picture;
      }

      if (signature !== residentInfo.signature) {
        signaturePicture = await uploadToFirebase(signature);
      } else {
        signaturePicture = residentInfo.signature;
      }

      let formattedMobileNumber = residentForm.mobilenumber;
      formattedMobileNumber = "0" + residentForm.mobilenumber.slice(3);

      let formattedEmergencyMobileNumber = residentForm.emergencymobilenumber;
      formattedEmergencyMobileNumber =
        "0" + residentForm.emergencymobilenumber.slice(3);

      let formattedTelephone = residentForm.telephone;
      if (residentForm.telephone) {
        formattedTelephone = "0" + residentForm.telephone.slice(3);
        delete residentForm.telephone;
      }

      delete residentForm.mobilenumber;
      delete residentForm.emergencymobilenumber;

      const updatedResidentForm = {
        ...residentForm,
        picture: idPicture,
        signature: signaturePicture,
        address: fulladdress,
        mobilenumber: formattedMobileNumber,
        emergencymobilenumber: formattedEmergencyMobileNumber,
        telephone: formattedTelephone,
      };

      await api.put(`/updateresident/${residentInfo._id}`, updatedResidentForm);
      alert("Profile successfully updated!");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSignature(url);
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  const mobileInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));

    if (name === "mobilenumber") {
      if (value.length >= 13) {
        setMobileNumError(null);
      } else {
        setMobileNumError("Invalid mobile number.");
      }
    }

    if (name === "emergencymobilenumber") {
      if (value.length >= 13) {
        setEmMobileNumError(null);
      } else {
        setEmMobileNumError("Invalid mobile number.");
      }
    }
  };

  const telephoneInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 11) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));

    if (name === "telephone") {
      if (value === "+63") {
        setTelephoneNumError(null);
      } else if (value.length > 11) {
        setTelephoneNumError(null);
      } else {
        setTelephoneNumError("Invalid mobile number.");
      }
    }
  };

  const usernameValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setUsername(formattedVal);

    if (!formattedVal) {
      errors.push("Username must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores."
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore");
    }

    setUsernameErrors(errors);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRenewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty");
    }
    if (formattedVal !== newpassword && formattedVal.length > 0) {
      errors.push("Passwords do not match");
    }
    setRePasswordErrors(errors);
  };

  const curpasswordValidation = (e) => {
    let val = e.target.value;
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

    if (!formattedVal) {
      setCurPasswordError("Password must not be empty.");
    } else {
      setCurPasswordError(null);
    }
  };

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setNewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    setPasswordErrors(errors);
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Account Settings</div>
        <div className="flex flex-col lg:flex-row mt-4 gap-10">
          {/* Left Panel */}
          <div className="flex flex-col mt-4">
            {user.role !== "Technical Admin" && (
              <p
                onClick={handleMenu1}
                className={`cursor-pointer text-base font-bold ${
                  isProfileClicked
                    ? "bg-btn-color-blue rounded-md text-[#fff] w-[14rem] p-2 opacity-70"
                    : "p-2 font-medium"
                }`}
              >
                Profile
              </p>
            )}

            <p
              onClick={handleMenu2}
              className={`cursor-pointer text-base font-bold ${
                isUsernameClicked
                  ? "bg-btn-color-blue rounded-md text-[#fff] w-[14rem] p-2 opacity-70"
                  : "p-2 font-medium"
              }`}
            >
              Change Username
            </p>
            <p
              onClick={handleMenu3}
              className={`cursor-pointer text-base font-bold ${
                isPasswordClicked
                  ? "bg-btn-color-blue rounded-md text-[#fff] w-[14rem] p-2 opacity-70"
                  : "p-2 font-medium"
              }`}
            >
              Change Password
            </p>
            <p
              onClick={handleMenu4}
              className={`cursor-pointer text-base font-bold ${
                isQuestionsClicked
                  ? "bg-btn-color-blue rounded-md text-[#fff] w-[14rem] p-2 opacity-70"
                  : "p-2 font-medium"
              }`}
            >
              Edit Security Questions
            </p>
          </div>

          {/* Right Panel */}
          <div className="cols-span-3">
            {/* Profile */}
            <div>
              {isProfileClicked && (
                <>
                  <div className="white-bg-container">
                    <h3 className="section-title">Personal Information</h3>
                    <hr class="section-divider" />
                    <div className="upload-container">
                      <div className="picture-upload-wrapper">
                        <h3 className="form-label">
                          Picture<label className="text-red-600">*</label>
                        </h3>
                        <div className="upload-box">
                          <input
                            onChange={handleChangeID}
                            type="file"
                            style={{ display: "none" }}
                            ref={hiddenInputRef1}
                          />
                          <div className="upload-content">
                            <div className="preview-container ">
                              {isIDProcessing ? (
                                <p>Processing...</p>
                              ) : id ? (
                                <img
                                  src={id}
                                  className="w-full h-full object-contain bg-white"
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <BiSolidImageAlt className="w-16 h-16" />
                                  <p>Attach Image</p>
                                </div>
                              )}
                            </div>

                            <div className="upload-picture-btn">
                              <button
                                onClick={toggleCamera}
                                className="upload-btn"
                              >
                                <FiCamera />
                              </button>
                              <button
                                onClick={handleUploadID}
                                className="upload-btn"
                              >
                                <FiUpload />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="picture-upload-wrapper">
                        <h3 className="form-label">
                          Signature<label className="text-red-600">*</label>
                        </h3>
                        <div className="upload-box">
                          <input
                            onChange={handleChangeSig}
                            type="file"
                            style={{ display: "none" }}
                            ref={hiddenInputRef2}
                          />
                          <div className="upload-content">
                            <div className="preview-container">
                              {isSignProcessing ? (
                                <p>Processing...</p>
                              ) : signature ? (
                                <img
                                  src={signature}
                                  className="w-full h-full object-contain bg-white"
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <BiSolidImageAlt className="w-16 h-16" />
                                  <p>Attach Image</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="upload-signature-btn">
                            <button
                              onClick={handleUploadSig}
                              className="upload-btn"
                            >
                              <FiUpload className="upload-btn-img" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                    >
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">
                            First Name<label className="text-red-600">*</label>
                          </label>
                          <input
                            type="text"
                            name="firstname"
                            value={residentForm.firstname}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter first name"
                            required
                            className="form-input input-box"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Middle Name</label>
                          <input
                            name="middlename"
                            value={residentForm.middlename}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter middle name"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Last Name<label className="text-red-600">*</label>
                          </label>
                          <input
                            name="lastname"
                            value={residentForm.lastname}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter last name"
                            required
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label for="suffix" className="form-label">
                            Suffix
                          </label>
                          <select
                            id="suffix"
                            name="suffix"
                            onChange={handleDropdownChange}
                            value={residentForm.suffix}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {suffixList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Alias</label>
                          <input
                            name="alias"
                            value={residentForm.alias}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter alias"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label for="salutation" className="form-label">
                            Salutation
                          </label>
                          <select
                            id="salutation"
                            name="salutation"
                            onChange={handleDropdownChange}
                            value={residentForm.salutation}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>

                            {salutationList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="sex" className="form-label">
                            Sex<label className="text-red-600">*</label>
                          </label>
                          <select
                            id="sex"
                            name="sex"
                            onChange={handleDropdownChange}
                            required
                            value={residentForm.sex}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {sexList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="gender" className="form-label">
                            Gender
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            onChange={handleDropdownChange}
                            value={residentForm.gender}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {genderList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Birthdate<label className="text-red-600">*</label>
                          </label>
                          <input
                            type="date"
                            name="birthdate"
                            onChange={(e) => {
                              const { name, value } = e.target;
                              setResidentForm((prev) => ({
                                ...prev,
                                [name]: value,
                              }));
                            }}
                            value={residentForm.birthdate}
                            placeholder="Enter birthdate"
                            min="1900-01-01"
                            required
                            className="form-input p-2"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Birthplace</label>
                          <input
                            name="birthplace"
                            value={residentForm.birthplace}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter birthplace"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label for="civilstatus" className="form-label">
                            Civil Status
                            <label className="text-red-600">*</label>
                          </label>
                          <select
                            id="civilstatus"
                            name="civilstatus"
                            onChange={handleDropdownChange}
                            required
                            value={residentForm.civilstatus}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {civilstatusList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="bloodtype" className="form-label">
                            Blood Type
                          </label>
                          <select
                            id="bloodtype"
                            name="bloodtype"
                            onChange={handleDropdownChange}
                            value={residentForm.bloodtype}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {bloodtypeList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label for="religion" className="form-label">
                            Religion
                          </label>
                          <select
                            id="religion"
                            name="religion"
                            onChange={handleDropdownChange}
                            value={residentForm.religion}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {religionList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="nationality" className="form-label">
                            Nationality<label className="text-red-600">*</label>
                          </label>
                          <select
                            id="nationality"
                            name="nationality"
                            onChange={handleDropdownChange}
                            required
                            value={residentForm.nationality}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {nationalityList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group space-x-5">
                          <label className="form-label ">
                            Registered Voter
                          </label>
                          <div className="flex flex-row space-x-10">
                            <div className="flex flex-row justify-center gap-1">
                              <input
                                type="radio"
                                name="voter"
                                onChange={handleRadioChange}
                                value="Yes"
                                checked={residentForm.voter === "Yes"}
                              />
                              <h1>Yes</h1>
                            </div>
                            <div className="flex flex-row justify-center gap-1">
                              <input
                                type="radio"
                                name="voter"
                                onChange={handleRadioChange}
                                value="No"
                                checked={residentForm.voter === "No"}
                              />
                              <h1>No</h1>
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Precinct</label>
                          <input
                            name="precinct"
                            value={residentForm.precinct}
                            onChange={lettersNumbersAndSpaceOnly}
                            placeholder="Enter precinct"
                            className="form-input"
                          />
                        </div>

                        <div className="form-group space-x-5">
                          <label className="form-label">Deceased</label>
                          <div className="flex flex-row space-x-10">
                            <div className="flex flex-row justify-center gap-1">
                              <input
                                type="radio"
                                name="deceased"
                                onChange={handleRadioChange}
                                value="Yes"
                                checked={residentForm.deceased === "Yes"}
                              />
                              <h1>Yes</h1>
                            </div>
                            <div className="flex flex-row justify-center gap-1">
                              <input
                                type="radio"
                                name="deceased"
                                onChange={handleRadioChange}
                                value="No"
                                checked={residentForm.deceased === "No"}
                              />
                              <h1>No</h1>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <h3 className="section-title mt-8">
                        Contact Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            name="email"
                            value={residentForm.email}
                            onChange={stringsAndNoSpaceOnly}
                            placeholder="Enter email"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Mobile Number
                            <label className="text-red-600">*</label>
                          </label>
                          <input
                            name="mobilenumber"
                            value={residentForm.mobilenumber}
                            onChange={mobileInputChange}
                            placeholder="Enter mobile number"
                            required
                            className="form-input"
                            maxLength={13}
                          />
                          {mobileNumError ? (
                            <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                              {mobileNumError}
                            </label>
                          ) : null}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Telephone</label>
                          <input
                            name="telephone"
                            value={residentForm.telephone}
                            onChange={telephoneInputChange}
                            placeholder="Enter telephone"
                            className="form-input"
                            maxLength={13}
                          />
                          {telephoneNumError ? (
                            <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                              {telephoneNumError}
                            </label>
                          ) : null}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Facebook</label>
                          <input
                            name="facebook"
                            value={residentForm.facebook}
                            onChange={stringsAndNoSpaceOnly}
                            placeholder="Enter facebook"
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* In Case Of Emergency Situation */}
                      <h3 className="section-title mt-8">
                        In Case Of Emergency Situation
                      </h3>
                      <hr class="section-divider" />
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">
                            Name<label className="text-red-600">*</label>
                          </label>
                          <input
                            name="emergencyname"
                            value={residentForm.emergencyname}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter name"
                            required
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Mobile Number
                            <label className="text-red-600">*</label>
                          </label>
                          <input
                            name="emergencymobilenumber"
                            value={residentForm.emergencymobilenumber}
                            onChange={mobileInputChange}
                            placeholder="Enter mobile number"
                            required
                            maxLength={13}
                            className="form-input"
                          />
                          {emMobileNumError ? (
                            <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                              {emMobileNumError}
                            </label>
                          ) : null}
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Address<label className="text-red-600">*</label>
                          </label>
                          <input
                            name="emergencyaddress"
                            value={residentForm.emergencyaddress}
                            onChange={lettersNumbersAndSpaceOnly}
                            placeholder="Enter address"
                            required
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* Family Information */}
                      <h3 className="section-title mt-8">Family Information</h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label for="mother" className="form-label">
                            Mother
                          </label>
                          <select
                            id="mother"
                            name="mother"
                            onChange={handleDropdownChange}
                            value={residentForm.mother}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>

                            {residents.map((element) => (
                              <option value={element._id}>
                                {element.middlename
                                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                                  : `${element.firstname} ${element.lastname}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="father" className="form-label">
                            Father
                          </label>
                          <select
                            id="father"
                            name="father"
                            onChange={handleDropdownChange}
                            value={residentInfo.father}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {residents.map((element) => (
                              <option value={element._id}>
                                {element.middlename
                                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                                  : `${element.firstname} ${element.lastname}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="spouse" className="form-label">
                            Spouse
                          </label>
                          <select
                            id="spouse"
                            name="spouse"
                            onChange={handleDropdownChange}
                            value={residentInfo.spouse}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {residents.map((element) => (
                              <option value={element._id}>
                                {element.middlename
                                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                                  : `${element.firstname} ${element.lastname}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-group">
                          <label className="form-label mt-4">Siblings</label>
                          <input
                            name="numberofsiblings"
                            value={residentForm.numberofsiblings}
                            onChange={numbersAndNoSpaceOnly}
                            placeholder="Enter number of siblings"
                            className="form-input"
                          />
                        </div>
                      </div>
                      {parseInt(residentForm.numberofsiblings, 10) > 0 && (
                        <div className="form-grid mt-4">
                          {renderSiblingsDropdown()}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-group">
                          <label className="form-label mt-4 ">Children</label>
                          <input
                            name="numberofchildren"
                            value={residentForm.numberofchildren}
                            onChange={numbersAndNoSpaceOnly}
                            placeholder="Enter number of siblings"
                            className="form-input"
                          />
                        </div>
                      </div>

                      {parseInt(residentForm.numberofchildren, 10) > 0 && (
                        <div className="form-grid mt-4 ">
                          {renderChildrenDropdown()}
                        </div>
                      )}

                      {/* Address Information */}
                      <h3 className="section-title mt-8">
                        Address Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">House Number</label>
                          <input
                            name="housenumber"
                            value={residentForm.housenumber}
                            onChange={numbersAndNoSpaceOnly}
                            placeholder="Enter house number"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label for="street" className="form-label">
                            Street<label className="text-red-600">*</label>
                          </label>
                          <select
                            id="street"
                            name="street"
                            onChange={handleDropdownChange}
                            required
                            value={residentForm.street}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {streetList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="HOAname" className="form-label">
                            HOA Name
                          </label>
                          <select
                            id="HOAname"
                            name="HOAname"
                            onChange={handleDropdownChange}
                            value={residentForm.HOAname}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            <option value="Bermuda Town Homes">
                              Bermuda Town Homes
                            </option>
                            <option value="None">None</option>
                          </select>
                        </div>
                      </div>

                      {/* Employment Information */}
                      <h3 className="section-title mt-8">
                        Employment Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label for="employmentstatus" className="form-label">
                            Employment Status
                          </label>
                          <select
                            id="employmentstatus"
                            name="employmentstatus"
                            onChange={handleDropdownChange}
                            value={residentForm.employmentstatus}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {employmentstatusList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Occupation</label>
                          <input
                            name="occupation"
                            value={residentForm.occupation}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter occupation"
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label for="monthlyincome" className="form-label">
                            Monthly Income
                          </label>
                          <select
                            id="monthlyincome"
                            name="monthlyincome"
                            onChange={handleDropdownChange}
                            value={residentForm.monthlyincome}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {monthlyincomeList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Educational Information */}
                      <h3 className="section-title mt-8">
                        Educational Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="form-group">
                          <label
                            for="educationalattainment"
                            className="form-label whitespace-nowrap"
                          >
                            Highest Educational Attainment
                          </label>
                          <select
                            id="educationalattainment"
                            name="educationalattainment"
                            onChange={handleDropdownChange}
                            value={residentForm.educationalattainment}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {educationalattainmentList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label for="typeofschool" className="form-label">
                            Type of School
                          </label>
                          <select
                            id="typeofschool"
                            name="typeofschool"
                            onChange={handleDropdownChange}
                            value={residentForm.typeofschool}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                          </select>
                        </div>
                        <div className="form-group ">
                          <label className="form-label">Course</label>
                          <input
                            name="course"
                            value={residentForm.course}
                            onChange={lettersAndSpaceOnly}
                            placeholder="Enter course"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="function-btn-container">
                        <button
                          type="submit"
                          className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D] mt-4"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Change Username */}
            {isUsernameClicked && (
              <div className="white-bg-container w-[30rem] h-auto">
                <div className="header-text">Change Username</div>
                <div className="p-4">
                  <div>
                    <label className="form-label">Current Username</label>
                    <div>
                      <label className="text-[#808080]">{user.username}</label>
                    </div>
                  </div>

                  <div className="employee-form-group mt-4">
                    <label for="newusername" className="form-label">
                      New Username
                    </label>
                    <input
                      placeholder="Enter New Username"
                      type="text"
                      id="name"
                      name="name"
                      value={username}
                      minLength={3}
                      maxLength={16}
                      onChange={(e) => usernameValidation(e)}
                      className="form-input"
                    />
                    {usernameErrors.length > 0 && (
                      <div style={{ marginTop: 5, width: 300 }}>
                        {usernameErrors.map((error, index) => (
                          <p
                            key={index}
                            className="text-red-500 font-semibold font-subTitle text-[14px]"
                          >
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="employee-form-group mt-4">
                    <label for="password" className="form-label">
                      Password
                    </label>

                    <div className="relative w-full">
                      <input
                        placeholder="Enter Password"
                        type={showUserPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => curpasswordValidation(e)}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showUserPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    {curPasswordError ? (
                      <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                        {curPasswordError}
                      </label>
                    ) : null}
                  </div>

                  <div className="function-btn-container">
                    <button
                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D] mt-4"
                      type="button"
                      onClick={handleUsernameChange}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            {isPasswordClicked && (
              <div className="white-bg-container w-[30rem] h-auto">
                <div className="header-text">Change Password</div>
                <div className="p-4">
                  <div className="employee-form-group">
                    <label for="password" className="form-label">
                      Current Password
                    </label>
                    <div className="relative w-full">
                      <input
                        placeholder="Enter Current Password"
                        type={showCurrPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        minLength={8}
                        maxLength={64}
                        onChange={(e) => curpasswordValidation(e)}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showCurrPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    {curPasswordError ? (
                      <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                        {curPasswordError}
                      </label>
                    ) : null}
                  </div>
                  <div className="employee-form-group mt-4">
                    <label for="newpassword" className="form-label">
                      New Password
                    </label>
                    <div className="relative w-full">
                      <input
                        placeholder="Enter New Password"
                        type={showNewPassword ? "text" : "password"}
                        id="newpassword"
                        name="newpassword"
                        value={newpassword}
                        minLength={8}
                        maxLength={64}
                        onChange={(e) => passwordValidation(e)}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    {passwordErrors.length > 0 && (
                      <div style={{ marginTop: 5, width: 300 }}>
                        {passwordErrors.map((error, index) => (
                          <p
                            key={index}
                            className="text-red-500 font-semibold font-subTitle text-[14px]"
                          >
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="employee-form-group mt-4">
                    <label for="renewpassword" className="form-label">
                      Reenter Password
                    </label>
                    <div className="relative w-full">
                      <input
                        placeholder="Enter Reenter Password"
                        type={showConfirmPassword ? "text" : "password"}
                        id="renewpassword"
                        name="renewpassword"
                        minLength={8}
                        maxLength={64}
                        value={renewpassword}
                        onChange={(e) => repasswordValidation(e)}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    {repasswordErrors.length > 0 && (
                      <div style={{ marginTop: 5, width: 300 }}>
                        {repasswordErrors.map((error, index) => (
                          <p
                            key={index}
                            className="text-red-500 font-semibold font-subTitle text-[14px]"
                          >
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="function-btn-container">
                    <button
                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D] mt-4"
                      type="button"
                      onClick={handlePasswordChange}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Security Questions */}
            {isQuestionsClicked && (
              <div className="white-bg-container w-[30rem] h-auto">
                <div className="header-text">Edit Security Questions</div>
                <div className="p-4">
                  <div>
                    <label className="form-label">Security Question #1</label>
                    <select
                      onChange={(e) =>
                        handleSecurityChange(0, "question", e.target.value)
                      }
                      className="form-input mb-2"
                      value={securityquestions[0].question}
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {securityQuestionsList
                        .filter(
                          (element) => element !== securityquestions[1].question
                        )
                        .map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                    </select>

                    <div className="relative w-full">
                      <input
                        placeholder="Enter answer"
                        value={securityquestions[0].answer}
                        type={showAnswer1 ? "text" : "password"}
                        onChange={(e) =>
                          handleSecurityChange(
                            0,
                            "answer",
                            e.target.value.toLowerCase()
                          )
                        }
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnswer1((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showAnswer1 ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="form-label">Security Question #2</label>
                    <select
                      onChange={(e) =>
                        handleSecurityChange(1, "question", e.target.value)
                      }
                      className="form-input mb-2"
                      value={securityquestions[1].question}
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {securityQuestionsList
                        .filter(
                          (element) => element !== securityquestions[0].question
                        )
                        .map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                    </select>

                    <div className="relative w-full">
                      <input
                        placeholder="Enter answer"
                        value={securityquestions[1].answer}
                        type={showAnswer2 ? "text" : "password"}
                        onChange={(e) =>
                          handleSecurityChange(
                            1,
                            "answer",
                            e.target.value.toLowerCase()
                          )
                        }
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAnswer2((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showAnswer2 ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <div className="employee-form-group mt-4">
                    <label for="password" className="form-label">
                      Password
                    </label>
                    <div className="relative w-full">
                      <input
                        placeholder="Enter Password"
                        id="password"
                        name="password"
                        value={password}
                        type={showSecurityPass ? "text" : "password"}
                        onChange={(e) => curpasswordValidation(e)}
                        className="form-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecurityPass((prev) => !prev)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                      >
                        {showSecurityPass ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                    {curPasswordError ? (
                      <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                        {curPasswordError}
                      </label>
                    ) : null}
                  </div>
                  <div className="function-btn-container">
                    <button
                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D] mt-4"
                      type="button"
                      onClick={handleQuestionsChange}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isCameraOpen && (
          <OpenCamera onDone={handleDone} onClose={handleClose} />
        )}
      </main>
    </>
  );
}

export default AccountSettings;
