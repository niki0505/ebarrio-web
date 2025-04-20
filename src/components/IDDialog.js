import { MdOutlineQuestionMark } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const IDDialog = ({ message, onConfirm, onCancel }) => {
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
          <div class="bg-[rgba(4,56,78,0.3)] p-3 rounded-full">
            <MdOutlineQuestionMark className="text-white text-4xl" />
          </div>
        </div>

        <p className="dialog-message text-navy-blue">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => onConfirm("current")}
            className="actions-btn bg-btn-color-gray hover:bg-gray-400"
          >
            Current
          </button>
          <button
            onClick={() => onConfirm("generate")}
            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDDialog;
