import React, { useCallback, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadImageToCloudinary } from "../../hooks/utils/uploadToCloudinary";

async function getCroppedImg(image, crop, rotation = 0) {
  const radians = (rotation * Math.PI) / 180;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropWidth = (crop?.width || image.width) * scaleX;
  const cropHeight = (crop?.height || image.height) * scaleY;

  // Compute rotated bounding box size
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const rotatedWidth = cropWidth * cos + cropHeight * sin;
  const rotatedHeight = cropWidth * sin + cropHeight * cos;

  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(radians);

  ctx.drawImage(
    image,
    (crop?.x || 0) * scaleX,
    (crop?.y || 0) * scaleY,
    cropWidth,
    cropHeight,
    -cropWidth / 2,
    -cropHeight / 2,
    cropWidth,
    cropHeight
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
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e) => {
    setImgRef(e.currentTarget);
  }, []);

  const handleApply = async () => {
    if (!imgRef || !sendMessage) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgRef, completedCrop, rotation);
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
    setRotation(0);
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Image</h2>

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
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </ReactCrop>

          {completedCrop && (
            <p className="text-sm text-gray-500">
              Selection: {Math.round(completedCrop.width)} ×{" "}
              {Math.round(completedCrop.height)}px
            </p>
          )}

          <div className="flex justify-center gap-4 items-center">
            <button
              onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isProcessing}
            >
              🔄 Rotate Left
            </button>
            <span className="text-sm text-gray-600">{rotation}°</span>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              disabled={isProcessing}
            >
              🔁 Rotate Right
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
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
