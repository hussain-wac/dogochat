import React from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import "./customAudioPlayer.css"; // for custom styles

const AudioMessage = ({ audioUrl, isSender }) => {
  return (
    <div className="flex items-center w-full px-2 py-2">
      <AudioPlayer
        src={audioUrl}
        showJumpControls={false}
        showDownloadProgress={false}
        customAdditionalControls={[]} // hides forward/backward
        customVolumeControls={[]}     // hides volume
        layout="horizontal-reverse"
        className={`audio-player-whatsapp ${isSender ? "sent" : "received"}`}
      />
    </div>
  );
};

export default AudioMessage;
