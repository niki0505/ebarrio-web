import { IoClose } from "react-icons/io5";
import { IoArchiveSharp } from "react-icons/io5";
import "../Stylesheets/Dialog.css";

const ConfirmRedDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-container font-title">
      <div className="modal-content">
        <div className="dialog-title-bar">
          <div className="flex flex-col">
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

        <div className="flex justify-center mt-10">
          <div class="bg-red-100 p-3 rounded-full">
            <IoArchiveSharp className="text-red-500 text-4xl" />
          </div>
        </div>

        <p className="dialog-message text-red-600">{message}</p>
        <p class="text-[#ACACAC] text-sm mb-4 font-subTitle font-semibold">
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
  );
};

export default ConfirmRedDialog;
