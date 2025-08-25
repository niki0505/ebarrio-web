import { MdCheckCircle } from "react-icons/md";

const SuccessDialog = ({ message, onClose }) => {
  return (
    <div className="modal-container">
      <div className="modal-form-confirm-container">
        <div class="bg-[rgba(4,56,78,0.3)] p-3 rounded-full">
          <MdCheckCircle className="text-white text-4xl" />
        </div>

        <p className="dialog-question">Success</p>

        <h1 className="dialog-message">{message}</h1>

        <div className="flex gap-x-4">
          <button
            onClick={onClose}
            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;
