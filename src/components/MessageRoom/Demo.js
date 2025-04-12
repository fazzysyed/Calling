import { Launcher } from "react-chat-window";
import React, { Component } from "react";
import firepadRef, { userName } from "../../config/firebase";

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      messageList: [],
    };
  }

  componentDidMount() {
    // Real-time listener for messages
    firepadRef.child("messages").on("child_added", (snapshot) => {
      const message = snapshot.val();
      this.setState((prevState) => ({
        messageList: [...prevState.messageList, message],
      }));
    });
  }

  _onMessageWasSent(message) {
    // Save the message to Firebase
    firepadRef.child("messages").push(message);
  }

  _sendMessage(text) {
    if (text.length > 0) {
      const message = {
        author: "them",
        type: "text",
        data: { text },
      };
      firepadRef.child("messages").push(message);
    }
  }

  render() {
    return (
      <div>
        <Launcher
          agentProfile={{
            teamName: "react-chat-window",
            imageUrl:
              "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
          }}
          onMessageWasSent={this._onMessageWasSent.bind(this)}
          messageList={this.state.messageList}
          showEmoji
        />
      </div>
    );
  }
}

export default Demo;
