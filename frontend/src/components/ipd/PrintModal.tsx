import React from 'react';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Renders content inside a centered popup/overlay on screen.
 * When printing, the overlay chrome is neutralized so only the
 * .print-template content inside prints.
 */
const PrintModal: React.FC<Props> = ({ onClose, children }) => {
  return (
    <div className="print-modal">
      <div className="print-modal-backdrop" onClick={onClose} />
      <div className="print-modal-window">
        <div className="no-print flex justify-end mb-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ✕ Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PrintModal;