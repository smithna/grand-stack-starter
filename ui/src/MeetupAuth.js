import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import OneGraphApolloClient from "onegraph-apollo-client";
import OneGraphAuth from "onegraph-auth";
import React, { Component, useMemo } from "react";
import Button from "@material-ui/core/Button";

const APP_ID = "00c7ecd4-37a2-4797-b052-0a21d66e16ad";

const GET_MEETUP_PROFILE = gql`
  query meetupProfileQuery {
    meetup {
      makeRestCall {
        get(path: "/members/self", allowUnauthenticated: false) {
          jsonBody
        }
      }
    }
  }
`;

const Greeting = ({ userName, memoFunction }) => {
  const userNameMemo = useMemo(() => memoFunction(userName), [userName]);
  console.log("userName: " + userName);
  console.log("userNameMemo: " + userNameMemo);
  return (
    <div>
      <p>Hi {userName}. Enter your interests to join the community graph.</p>
    </div>
  );
};

class MeetupAuth extends Component {
  state = {
    isLoggedIn: false
  };

  constructor(props) {
    super(props);
    this._oneGraphAuth = new OneGraphAuth({
      appId: APP_ID
    });
    this._oneGraphClient = new OneGraphApolloClient({
      oneGraphAuth: this._oneGraphAuth
    });
    this.handleCurrentUserChange = this.handleCurrentUserChange.bind(this);
  }

  handleCurrentUserChange(u) {
    console.log("called memo function");
    console.log(u);
    this.props.onCurrentUserChange(u);
    return u;
  }

  _authWithMeetup = async () => {
    await this._oneGraphAuth.login("meetup");
    const isLoggedIn = await this._oneGraphAuth.isLoggedIn("meetup");
    this.setState({ isLoggedIn: isLoggedIn });
  };

  componentDidMount() {
    this._oneGraphAuth
      .isLoggedIn("meetup")
      .then(isLoggedIn => this.setState({ isLoggedIn }));
  }

  render() {
    const { tags, suggestions } = this.state;
    return (
      <div className="AddTopics">
        <p className="App-intro">
          {this.state.isLoggedIn ? (
            <React.Fragment>
              <ApolloProvider client={this._oneGraphClient}>
                <Query query={GET_MEETUP_PROFILE}>
                  {({ loading, error, data }) => {
                    if (loading) return <div>Loading...</div>;
                    if (error)
                      return (
                        <div>Uh oh, something went wrong: {error.message}</div>
                      );
                    if (!data.meetup.makeRestCall.get.jsonBody) {
                      return <div>Could not find your Meetup Profile.</div>;
                    }
                    let currentUser =
                      data.meetup.makeRestCall.get.jsonBody.name;
                    return (
                      <Greeting
                        userName={currentUser}
                        memoFunction={this.handleCurrentUserChange}
                      />
                    );
                  }}
                </Query>
              </ApolloProvider>
            </React.Fragment>
          ) : (
            <Button variant="contained" onClick={this._authWithMeetup}>
              Login with Meetup
            </Button>
          )}
        </p>
      </div>
    );
  }
}

export default MeetupAuth;
