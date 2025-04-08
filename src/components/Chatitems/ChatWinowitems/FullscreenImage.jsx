import React from "react";
import {
  XIcon,
  RotateCwIcon,
  DownloadIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { useFullscreenImage } from "../../../hooks/useFullscreenImageop";

function FullscreenImage({ image, onClose, onDelete, formatMessageTime }) {
  const {
    rotation,
    handleRotate,
    handleDownload,
    handleShare,
  } = useFullscreenImage(image);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img
          src={image.url}
          alt="Blurred background"
          className="w-full h-full object-cover filter blur-lg"
        />
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button onClick={onClose} className="text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="text-white text-xs">
          {formatMessageTime(image.timestamp)}
        </div>
      </div>

      {/* Fullscreen Image */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-auto p-4">
        <img
          src={image.url}
          alt="Full size"
          className="max-h-[80vh] max-w-[90vw] object-contain mx-auto"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="relative z-10 p-4 flex justify-around">
        <button
          onClick={handleRotate}
          className="text-white flex flex-col items-center"
        >
          <RotateCwIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Rotate</span>
        </button>
        <button
          onClick={handleDownload}
          className="text-white flex flex-col items-center"
        >
          <DownloadIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Download</span>
        </button>
        <button
          onClick={handleShare}
          className="text-white flex flex-col items-center"
        >
          <ShareIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Share</span>
        </button>
        {image.isSender && (
          <button
            onClick={onDelete}
            className="text-red-500 flex flex-col items-center"
          >
            <Trash2Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FullscreenImage;
