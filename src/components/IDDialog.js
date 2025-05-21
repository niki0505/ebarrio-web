import { MdOutlineQuestionMark } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const IDDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-container">
      <div className="modal-content h-[15rem] w-[30rem]">
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

          <p className="dialog-question">{message}</p>

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
    </div>
  );
};

export default IDDialog;
