import React from "react";
import { XIcon, PencilIcon } from "lucide-react";

const ImagePreview = ({ selectedImages, removeImage, setEditingIndex }) => {
  return (
    selectedImages.length > 0 && (
      <div className="flex gap-2 mb-2 flex-wrap">
        {selectedImages.map((img, i) => (
          <div
            key={i}
            className="relative w-24 h-24 rounded overflow-hidden border"
          >
            <img
              src={img.preview}
              alt="preview"
              className="w-full object-cover"
            />
            <button
              className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full"
              onClick={() => removeImage(i)}
            >
              <XIcon className="w-4 h-4 text-white" />
            </button>
            <button
              className="absolute bottom-1 right-1 bg-black bg-opacity-50 p-1 rounded-full"
              onClick={() => setEditingIndex(i)}
            >
              <PencilIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    )
  );
};

export default ImagePreview;