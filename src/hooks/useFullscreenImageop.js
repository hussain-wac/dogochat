import { useState } from "react";

export function useFullscreenImage(image) {
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!image?.url) return;

    fetch(image.url)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `image-${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Download failed:", err);
        alert("Failed to download image. Try again.");
      });
  };

  const handleShare = () => {
    if (!image?.url) return;

    const subject = encodeURIComponent("Check out this image from our chat");
    const body = encodeURIComponent(
      `I wanted to share this image with you: ${image.url}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return {
    rotation,
    handleRotate,
    handleDownload,
    handleShare,
  };
}
