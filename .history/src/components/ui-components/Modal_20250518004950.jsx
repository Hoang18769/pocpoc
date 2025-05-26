// components/NewPostModal.tsx
import React from "react";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 relative shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ➜
          </button>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 text-gray-500 cursor-pointer">
          <p className="mb-2">Choose file or drop photos here</p>
          <div className="text-4xl">🖼️ ▶️</div>
          <div className="text-2xl mt-2">+</div>
        </div>
      </div>
    </div>
  );
};

export default NewPostModal;
