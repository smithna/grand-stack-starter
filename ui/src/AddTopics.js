import React, { Component } from "react";
import TopicChips from "./TopicChips";
import MeetupAuth from "./MeetupAuth";

class AddTopic extends Component {
  constructor(props) {
    super(props);
    this.handleCurrentUserChange = this.handleCurrentUserChange.bind(this);
    this.passCurrentUser = this.passCurrentUser.bind(this);
    this.state = { currentUser: "" };
  }

  passCurrentUser(userName) {
    this.props.onMeetupLogin(userName);
  }

  handleCurrentUserChange(userName) {
    this.passCurrentUser(userName);
  }

  render() {
    return (
      <div>
        <MeetupAuth onCurrentUserChange={this.handleCurrentUserChange} />
        {this.props.currentUser ? (
          <TopicChips currentUser={this.props.currentUser} />
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default AddTopic;
