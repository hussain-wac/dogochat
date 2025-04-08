import React, { useCallback, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadImageToCloudinary } from "../../hooks/utils/uploadToCloudinary";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

async function getCroppedImg(image, crop, rotation = 0) {
  const radians = (rotation * Math.PI) / 180;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropWidth = (crop?.width || image.width) * scaleX;
  const cropHeight = (crop?.height || image.height) * scaleY;

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

function ImageEditorModal({ open, image, onClose, onComplete }) {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e) => {
    setImgRef(e.currentTarget);
  }, []);

  const handleApply = async () => {
    if (!imgRef || !onComplete) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgRef, completedCrop, rotation);
      onComplete(croppedFile);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
            className="max-h-[60vh] overflow-auto"
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
            <p className="text-sm text-muted-foreground text-center">
              Selection: {Math.round(completedCrop.width)} ×{" "}
              {Math.round(completedCrop.height)}px
            </p>
          )}

          <div className="flex justify-center gap-4 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
              disabled={isProcessing}
            >
              🔄 Rotate Left
            </Button>
            <span className="text-sm text-muted-foreground">{rotation}°</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              disabled={isProcessing}
            >
              🔁 Rotate Right
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleReset} disabled={isProcessing}>
              Reset
            </Button>
            <Button variant="destructive" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageEditorModal;
