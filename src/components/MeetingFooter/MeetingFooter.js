import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVideo,
  faDesktop,
  faVideoSlash,
  faMicrophoneSlash,
  faPhoneSlash,
  faComment,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";
import "./MeetingFooter.css";

const MeetingFooter = (props) => {
  const [streamState, setStreamState] = useState({
    mic: true,
    video: false,
    screen: false,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  const micClick = () => {
    setStreamState((currentState) => ({
      ...currentState,
      mic: !currentState.mic,
    }));
  };

  const endCallClick = () => {
    try {
      let tracks = this.setStreamState?.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      console.log("Call ended");
    } catch (e) {}

    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "callEnded" })
      );
    }

    window.location.href = "/";
    window.close();
  };

  const onVideoClick = () => {
    setStreamState((currentState) => ({
      ...currentState,
      video: !currentState.video,
    }));
  };

  const onScreenClick = () => {
    props.onScreenClick(setScreenState);
  };

  const setScreenState = (isEnabled) => {
    setStreamState((currentState) => ({
      ...currentState,
      screen: isEnabled,
    }));
  };

  const toggleChatWindow = () => {
    props.openChat();
  };

  const handleCameraSwitch = (facingMode) => {
    props.switchMobile();
    // Implement actual switch logic as needed
  };

  useEffect(() => {
    props.onMicClick(streamState.mic);
  }, [streamState.mic]);

  useEffect(() => {
    props.onVideoClick(streamState.video);
  }, [streamState.video]);

  useEffect(() => {
    // Basic mobile detection
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

    console.log(isMobile);
    setIsMobile(isMobileDevice);

    // Get list of cameras for desktop
    if (!isMobileDevice) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        if (videoDevices.length) setSelectedCamera(videoDevices[0].deviceId);
      });
    }
  }, []);

  const handleCameraChange = (e) => {
    const selected = e.target.value;
    setSelectedCamera(selected);
    console.log("Camera changed to:", selected);

    props.onCameraChange(selected);

    // Switch camera logic here if needed
  };

  return (
    <div className="meeting-footer">
      {/* Mic button */}
      <div
        className={`meeting-icons ${!streamState.mic ? "active" : ""}`}
        onClick={micClick}
      >
        <FontAwesomeIcon
          icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
          title="Mute"
        />
      </div>

      {/* Video button */}
      <div
        className={`meeting-icons ${!streamState.video ? "active" : ""}`}
        onClick={onVideoClick}
      >
        <FontAwesomeIcon icon={!streamState.video ? faVideoSlash : faVideo} />
      </div>

      {/* Camera switching (mobile/tablet vs desktop) */}

      {streamState.video ? (
        <>
          {isMobile ? (
            <>
              <div
                className="meeting-icons"
                onClick={() => handleCameraSwitch("user")}
              >
                <FontAwesomeIcon icon={faCamera} title="Front Camera" />
              </div>
            </>
          ) : (
            <select
              className="camera-select"
              value={selectedCamera}
              onChange={handleCameraChange}
            >
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || "Camera"}
                </option>
              ))}
            </select>
          )}
        </>
      ) : null}

      {/* Chat */}
      <div className="meeting-icons" onClick={toggleChatWindow}>
        <FontAwesomeIcon icon={faComment} />
      </div>

      {/* End Call */}
      <div className="meeting-icons" onClick={endCallClick}>
        <FontAwesomeIcon icon={faPhoneSlash} />
      </div>

      <ReactTooltip />
    </div>
  );
};

export default MeetingFooter;
