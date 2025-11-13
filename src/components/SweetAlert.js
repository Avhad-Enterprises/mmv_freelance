import { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

/**
 * SweetAlert Component
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the dialog
 * @param {string} props.title - Dialog title
 * @param {string} [props.text] - Dialog message
 * @param {string} [props.icon] - Icon type: "success", "error", "warning", "info", "question"
 * @param {Object} [props.confirmButton] - Confirm button config
 * @param {string} [props.confirmButton.text] - Confirm button text
 * @param {string} [props.confirmButton.backgroundColor] - Confirm button background color
 * @param {string} [props.confirmButton.textColor] - Confirm button text color
 * @param {Object} [props.cancelButton] - Cancel button config
 * @param {string} [props.cancelButton.text] - Cancel button text
 * @param {string} [props.cancelButton.backgroundColor] - Cancel button background color
 * @param {string} [props.cancelButton.textColor] - Cancel button text color
 * @param {Object} [props.denyButton] - Deny button config
 * @param {string} [props.denyButton.text] - Deny button text
 * @param {string} [props.denyButton.backgroundColor] - Deny button background color
 * @param {string} [props.denyButton.textColor] - Deny button text color
 * @param {Function} [props.onConfirm] - Callback for confirm action
 * @param {Function} [props.onCancel] - Callback for cancel action
 * @param {Function} [props.onDeny] - Callback for deny action
 * @param {Function} [props.onClose] - Callback when dialog closes
 */
const SweetAlert = ({
    show,
    title,
    text,
    icon,
    confirmButton = { text: "Confirm", backgroundColor: "#3085d6", textColor: "#fff" },
    cancelButton,
    denyButton,
    onConfirm,
    onCancel,
    onDeny,
    onClose,
}) => {
    useEffect(() => {
        if (show) {
            MySwal.fire({
                title,
                text,
                icon,
                showConfirmButton: !!confirmButton,
                confirmButtonText: confirmButton?.text || "Confirm",
                showCancelButton: !!cancelButton,
                cancelButtonText: cancelButton?.text || "Cancel",
                showDenyButton: !!denyButton,
                denyButtonText: denyButton?.text || "Deny",
                customClass: {
                    confirmButton: "swal-custom-confirm",
                    cancelButton: cancelButton ? "swal-custom-cancel" : undefined,
                    denyButton: denyButton ? "swal-custom-deny" : undefined,
                },
                buttonsStyling: false,
            }).then((result) => {
                if (result.isConfirmed && onConfirm) {
                    onConfirm();
                } else if (result.isDismissed && onCancel) {
                    onCancel();
                } else if (result.isDenied && onDeny) {
                    onDeny();
                }
                if (onClose) {
                    onClose();
                }
            });

            const style = document.createElement("style");
            style.innerHTML = `
        .swal-custom-confirm {
          background-color: ${confirmButton.backgroundColor || "#3085d6"} !important;
          color: ${confirmButton.textColor || "#fff"} !important;
          padding: 10px 20px !important;
          border-radius: 4px !important;
          border: none !important;
          margin: 0 5px !important;
        }
        .swal-custom-cancel {
          background-color: ${cancelButton?.backgroundColor || "#d33"} !important;
          color: ${cancelButton?.textColor || "#fff"} !important;
          padding: 10px 20px !important;
          border-radius: 4px !important;
          border: none !important;
          margin: 0 5px !important;
        }
        .swal-custom-deny {
          background-color: ${denyButton?.backgroundColor || "#6c757d"} !important;
          color: ${denyButton?.textColor || "#fff"} !important;
          padding: 10px 20px !important;
          border-radius: 4px !important;
          border: none !important;
          margin: 0 5px !important;
        }
      `;
            document.head.appendChild(style);

            return () => {
                document.head.removeChild(style);
            };
        }
    }, [show, title, text, icon, confirmButton, cancelButton, denyButton, onConfirm, onCancel, onDeny, onClose]);

    return null;
};

/**
 * Hook for programmatic SweetAlert usage
 * @returns {Object} - Contains showAlert function
 */
const useSweetAlert = () => {
    /**
     * Show a SweetAlert dialog
     * @param {Object} config
     * @param {string} config.title
     * @param {string} [config.text]
     * @param {string} [config.icon]
     * @param {Object} [config.confirmButton]
     * @param {Object} [config.cancelButton]
     * @param {Object} [config.denyButton]
     * @param {Function} [config.onConfirm]
     * @param {Function} [config.onCancel]
     * @param {Function} [config.onDeny]
     */
    const showAlert = ({
        title,
        text,
        icon,
        confirmButton = { text: "Confirm", backgroundColor: "#3085d6", textColor: "#fff" },
        cancelButton,
        denyButton,
        onConfirm,
        onCancel,
        onDeny,
    }) => {
        const style = document.createElement("style");
        style.innerHTML = `
      .swal-custom-confirm {
        background-color: ${confirmButton.backgroundColor || "#3085d6"} !important;
        color: ${confirmButton.textColor || "#fff"} !important;
        padding: 10px 20px !important;
        border-radius: 4px !important;
        border: none !important;
        margin: 0 5px !important;
      }
      .swal-custom-cancel {
        background-color: ${cancelButton?.backgroundColor || "#d33"} !important;
        color: ${cancelButton?.textColor || "#fff"} !important;
        padding: 10px 20px !important;
        border-radius: 4px !important;
        border: none !important;
        margin: 0 5px !important;
      }
      .swal-custom-deny {
        background-color: ${denyButton?.backgroundColor || "#6c757d"} !important;
        color: ${denyButton?.textColor || "#fff"} !important;
        padding: 10px 20px !important;
        border-radius: 4px !important;
        border: none !important;
        margin: 0 5px !important;
      }
    `;
        document.head.appendChild(style);
        MySwal.fire({
            title,
            text,
            icon,
            showConfirmButton: !!confirmButton,
            confirmButtonText: confirmButton?.text || "Confirm",
            showCancelButton: !!cancelButton,
            cancelButtonText: cancelButton?.text || "Cancel",
            showDenyButton: !!denyButton,
            denyButtonText: denyButton?.text || "Deny",
            customClass: {
                confirmButton: "swal-custom-confirm",
                cancelButton: cancelButton ? "swal-custom-cancel" : undefined,
                denyButton: denyButton ? "swal-custom-deny" : undefined,
            },
            buttonsStyling: false,
        }).then((result) => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
            if (result.isConfirmed && onConfirm) {
                onConfirm();
            } else if (result.isDismissed && onCancel) {
                onCancel();
            } else if (result.isDenied && onDeny) {
                onDeny();
            }
        });
    };

    return { showAlert };
};

export { SweetAlert, useSweetAlert };