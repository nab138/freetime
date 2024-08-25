"use client";

import ClientButton from "@/components/ClientButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecordWebcam } from "react-record-webcam";

function confirmExit() {
  return "You have attempted to leave this page. Are you sure?";
}

export default function Camera({ filename }: { filename: string }) {
  const {
    createRecording,
    openCamera,
    startRecording,
    stopRecording,
    activeRecordings,
    muteRecording,
    download,
    applyRecordingOptions,
  } = useRecordWebcam({
    options: {
      fileName: filename + " - FreeTime video",
      fileType: "mp4",
    },
  });

  const recordingRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const rec = await createRecording();
      if (!rec) return;
      const recording = await muteRecording(rec.id);
      if (!recording) return;
      await applyRecordingOptions(recording.id);
      recording.isMuted = true;
      await openCamera(recording.id);
      recordingRef.current = recording;
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      window.onbeforeunload = confirmExit;
    } else {
      window.onbeforeunload = null;
    }
  }, [isRecording]);

  const recordVideo = useCallback(async () => {
    if (recordingRef.current == null) {
      return alert("Failed to create recording");
    }
    if (!isRecording) {
      await startRecording(recordingRef.current.id);
      setIsRecording(true);
    } else {
      await stopRecording(recordingRef.current.id);
      await download(recordingRef.current.id);
      setIsRecording(false);
    }
  }, [recordingRef.current, isRecording]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px",
      }}
    >
      {activeRecordings.map((recording) => (
        <div key={recording.id}>
          <video ref={recording.webcamRef} autoPlay />
        </div>
      ))}
      <ClientButton onClick={recordVideo}>
        {isRecording ? "Stop" : "Record"}
      </ClientButton>
    </div>
  );
}
