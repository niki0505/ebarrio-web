//STYLES
import "../Stylesheets/Dialog.css";

//ICONS
import { IoClose, IoArchiveSharp } from "react-icons/io5";

const ConfirmRedDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-container">
      <div className="modal-content h-[18rem] w-[30rem]">
        <div className="dialog-title-bar">
          <div className="flex flex-col w-full">
            <div className="dialog-title-bar-items">
              <h1 className="dialog-title-bar-title">Confirm</h1>
              <IoClose
                onClick={onCancel}
                class="dialog-title-bar-icon"
              ></IoClose>
            </div>
            <hr className="dialog-line" />
          </div>
        </div>

        <div className="modal-form-container flex flex-col items-center justify-center">
          <div class="bg-red-100 p-3 rounded-full">
            <IoArchiveSharp className="text-red-500 text-4xl" />
          </div>

          <p className="dialog-question">{message}</p>
          <p class="dialog-message">
            Press Confirm to continue, or Cancel to stay on the current page
          </p>

          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="actions-btn bg-btn-color-gray hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="actions-btn bg-btn-color-red hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRedDialog;
