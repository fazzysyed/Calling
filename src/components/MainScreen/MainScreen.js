import React, { useRef, useEffect, useState } from "react";
import MeetingFooter from "../MeetingFooter/MeetingFooter";
import Participants from "../Participants/Participants";
import "./MainScreen.css";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  setMainStream,
  updateUser,
  updateFaceMode,
} from "../../store/actioncreator";
import ChatWindow from "../ChatWindow/ChatWindow";

const MainScreen = (props) => {
  const participantRef = useRef(props.participants);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const faceMode = useSelector((state) => state.faceMode);
  const dispatch = useDispatch();

  const onMicClick = (micEnabled) => {
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };
  const onVideoClick = (videoEnabled) => {
    if (props.stream) {
      props.stream.getVideoTracks()[0].enabled = videoEnabled;
      props.updateUser({ video: videoEnabled });
    }
  };

  useEffect(() => {
    console.log(props.participants);
    participantRef.current = props.participants;
  }, [props.participants]);

  const updateStream = (stream) => {
    for (let key in participantRef.current) {
      const sender = participantRef.current[key];
      if (sender.currentUser) continue;
      const peerConnection = sender.peerConnection
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      peerConnection.replaceTrack(stream.getVideoTracks()[0]);
    }
    props.setMainStream(stream);
  };

  const handleDeviceChange = async (camera) => {
    const newDeviceId = camera;

    if (props.stream) {
      props.stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: newDeviceId ? { deviceId: newDeviceId } : true,
        audio: newDeviceId ? { deviceId: newDeviceId } : true,
      });

      updateStream(newStream);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };
  const onScreenShareEnd = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localStream.getVideoTracks()[0].enabled = Object.values(
      props.currentUser
    )[0].video;

    updateStream(localStream);

    props.updateUser({ screen: false });
  };

  const onScreenClick = async () => {
    let mediaStream;
    if (navigator.getDisplayMedia) {
      mediaStream = await navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    } else {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" },
      });
    }

    mediaStream.getVideoTracks()[0].onended = onScreenShareEnd;

    updateStream(mediaStream);

    props.updateUser({ screen: true });
  };
  return (
    <div className="wrapper">
      <div className="main-screen">
        <Participants />
      </div>

      {isChatOpen && (
        <ChatWindow
          onClose={() => {
            setIsChatOpen(false);
          }}
        />
      )}

      <div className="footer">
        <MeetingFooter
          switchMobile={async () => {
            if (props.stream) {
              props.stream.getTracks().forEach((track) => track.stop());
            }

            try {
              const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: {
                    ideal: faceMode === "user" ? "environment" : "user",
                  },
                },
                audio: true,
              });

              console.log(faceMode, "faceModefaceMode");
              updateStream(newStream);
              dispatch(
                updateFaceMode(faceMode === "user" ? "environment" : "user")
              );
            } catch (error) {
              console.error("Error switching camera:", error);
            }
          }}
          onCameraChange={(camera) => {
            handleDeviceChange(camera);
            console.log(camera);
          }}
          openChat={() => {
            setIsChatOpen(true);
          }}
          onScreenClick={onScreenClick}
          onMicClick={onMicClick}
          onVideoClick={onVideoClick}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    updateUser: (user) => dispatch(updateUser(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
