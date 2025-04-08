// useVoiceRecorder.js
import { useEffect, useRef, useState } from "react";

const useVoiceRecorder = (onStopCallback) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Check initial permission state
    navigator.permissions.query({ name: 'microphone' })
      .then((result) => {
        if (result.state === 'denied') {
          setPermissionDenied(true);
        }
        result.onchange = () => {
          setPermissionDenied(result.state === 'denied');
        };
      })
      .catch((err) => console.log("Permission query not supported:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setStream(mediaStream);
      setPermissionDenied(false);

      mediaRecorder.onstart = () => {
        console.log("Recording started");
        setIsRecording(true);
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped");
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        onStopCallback(file);
        setIsRecording(false);
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setIsRecording(false);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        alert("Microphone access denied. Please allow microphone permissions in your browser settings.");
      } else {
        alert("Failed to start recording: " + err.message);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    permissionDenied
  };
};

export default useVoiceRecorder;