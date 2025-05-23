import { IoIosWarning } from "react-icons/io";
import { IoPrint } from "react-icons/io5";

import { IoClose } from "react-icons/io5";
import { MdOutlineQuestionMark } from "react-icons/md";
import "../Stylesheets/Dialog.css";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
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
          <div class="bg-[rgba(4,56,78,0.3)] p-3 rounded-full">
            <MdOutlineQuestionMark className="text-white text-4xl" />
          </div>

          <h1 className="dialog-question">{message}</h1>
          <h1 class="dialog-message">
            Press Confirm to continue, or Cancel to stay on the current page
          </h1>

          <div className="flex gap-x-4">
            <button
              onClick={onCancel}
              className="actions-btn bg-btn-color-gray hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
