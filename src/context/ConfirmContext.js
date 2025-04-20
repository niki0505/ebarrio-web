import React, { createContext, useState, useContext } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import IDDialog from "../components/IDDialog";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    message: "",
    isOpen: false,
    resolve: () => {},
    reject: () => {},
    dialogType: "confirm", // "confirm" or "id"
  });

  // Function to trigger the dialog based on the dialog type
  const confirm = (message, dialogType = "confirm") =>
    new Promise((resolve, reject) => {
      setConfirmState({
        message,
        isOpen: true,
        resolve,
        reject,
        dialogType, // Store the dialog type (confirm or id)
      });
    });

  const handleConfirm = () => {
    confirmState.resolve(true);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCancel = () => {
    confirmState.resolve(false);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleConfirm2 = (action) => {
    confirmState.resolve(action);
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCancel2 = () => {
    confirmState.resolve("cancel");
    setConfirmState({ ...confirmState, isOpen: false });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState.isOpen && confirmState.dialogType === "confirm" && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {confirmState.isOpen && confirmState.dialogType === "id" && (
        <IDDialog
          message={confirmState.message}
          onConfirm={handleConfirm2}
          onCancel={handleCancel2}
        />
      )}
    </ConfirmContext.Provider>
  );
};
