// Ruta: src/components/common/ConfirmModal.jsx
import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar",
    isConfirmDisabled = false, // Nueva prop
    isCancelDisabled = false   // Nueva prop
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay-confirm">
            <div className="modal-content-confirm">
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions-confirm">
                    <button 
                        onClick={onConfirm} 
                        className="modal-button-confirm confirm"
                        disabled={isConfirmDisabled} // Aplicar disabled
                    >
                        {confirmText}
                    </button>
                    <button 
                        onClick={onCancel} 
                        className="modal-button-confirm cancel"
                        disabled={isCancelDisabled} // Aplicar disabled
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;