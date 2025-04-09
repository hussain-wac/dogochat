import React, { useState, useRef } from "react";
import { PlayIcon, PauseIcon } from "lucide-react";

const AudioMessage = ({ audioUrl, isSender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef(null);
  const eventsAttachedRef = useRef(false);

  const attachAudioEvents = (audio) => {
    if (!audio || eventsAttachedRef.current) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsLoaded(true);
      } else {
        setDuration(0);
      }
    };

    const endPlayback = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", endPlayback);

    eventsAttachedRef.current = true;

    // Cleanup on unmount
    const cleanup = () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", endPlayback);
    };

    audioRef.current.__cleanup = cleanup;
  };

  const setAudioRef = (node) => {
    if (audioRef.current && audioRef.current.__cleanup) {
      audioRef.current.__cleanup();
    }

    if (node) {
      audioRef.current = node;
      attachAudioEvents(node);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Play was prevented:", error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!isFinite(time) || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (e) => {
    if (!isLoaded) return;

    const audio = audioRef.current;
    const newTime = (e.target.value / 100) * (duration || 0);

    if (isFinite(newTime) && !isNaN(newTime)) {
      setCurrentTime(newTime);
      audio.currentTime = newTime;
    }
  };

  const calculateProgress = () => {
    if (!duration || !isFinite(duration) || !isFinite(currentTime)) return 0;
    return (currentTime / duration) * 100;
  };

  const displayDuration = isLoaded ? formatTime(duration) : "--:--";

  return (
    <div className="flex items-center w-full px-2 py-2">
      <audio ref={setAudioRef} src={audioUrl} preload="metadata" />

      <button
        onClick={togglePlayPause}
        className="flex justify-center items-center w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>

      <div className="text-white text-xs ml-2 min-w-12">{formatTime(currentTime)}</div>

      <div className="relative flex-1 h-1 mx-2">
        <div className="absolute w-full h-1 bg-orange-300/30 rounded-full"></div>
        <div
          className="absolute h-1 bg-white rounded-full"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
        <input
          type="range"
          min="0"
          max="100"
          value={calculateProgress()}
          onChange={handleSliderChange}
          disabled={!isLoaded}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer opacity-0"
          style={{ zIndex: 10 }}
        />
      </div>

      <div className="text-white text-xs mr-2 min-w-12 text-right">{displayDuration}</div>
    </div>
  );
};

export default AudioMessage;
