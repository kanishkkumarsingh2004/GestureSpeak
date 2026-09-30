"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type CameraStatus =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unavailable"
  | "stopped"
  | "error";

export function useCamera(selectedDeviceId?: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const getAvailableDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices
        .filter((d) => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
      setDevices(videoInputs);
    } catch (e) {
      console.warn("Failed to enumerate devices:", e);
    }
  };

  const startCamera = useCallback(async (overrideDeviceId?: string) => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setStatus("unavailable");
      setErrorMsg("Camera access is not supported by your browser.");
      return;
    }

    setStatus("requesting");
    setErrorMsg(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    const targetDeviceId = overrideDeviceId || selectedDeviceId;
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: targetDeviceId
        ? { deviceId: { exact: targetDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        setVideoDimensions({
          width: settings.width || 640,
          height: settings.height || 480,
        });
      }

      setStatus("active");
      await getAvailableDevices();
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMsg("Camera access was denied. Please allow camera permissions in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setStatus("unavailable");
        setErrorMsg("No video camera device was found on your system.");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Could not connect to camera.");
      }
    }
  }, [selectedDeviceId]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("stopped");
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    status,
    devices,
    errorMsg,
    videoDimensions,
    startCamera,
    stopCamera,
  };
}
