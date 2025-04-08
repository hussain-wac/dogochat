import React, { useCallback, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadImageToCloudinary } from "../../hooks/utils/uploadToCloudinary";

async function getCroppedImg(image, crop) {
  if (!crop || !crop.width || !crop.height) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    ctx.drawImage(image, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas is empty");
        resolve(new File([blob], "full-image.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 1);
    });
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Canvas is empty");
      resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 1);
  });
}

function ImageEditorModal({ open, image, onClose, sendMessage }) {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e) => {
    setImgRef(e.currentTarget);
  }, []);

  const handleApply = async () => {
    if (!imgRef || !sendMessage) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgRef, completedCrop);
      const url = await uploadImageToCloudinary(croppedFile);
      sendMessage(url, "image");
      onClose();
    } catch (error) {
      console.error("Error cropping and sending image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop(null);
    setCompletedCrop(null);
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Crop Image</h2>

        <div className="flex flex-col gap-4">
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-[60vh] overflow-auto"
            keepSelection={true}
          >
            <img
              src={image.preview}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full"
            />
          </ReactCrop>

          {completedCrop && (
            <p className="text-sm text-gray-500">
              Selection: {Math.round(completedCrop.width)} ×{" "}
              {Math.round(completedCrop.height)}px
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              disabled={isProcessing}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
              {isProcessing ? "Sending..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageEditorModal;
