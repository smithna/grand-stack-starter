import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import TopicsInput from "./ReactAutoSuggest.js";

const meetup_query = gql`
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

const topic_query = gql`
  query PersonInterests($name: String!) {
    Person(name: $name) {
      name
      interests {
        name
      }
    }
    Topic {
      name
    }
  }
`;

class TopicChips extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Query query={topic_query} variables={{ name: this.props.currentUser }}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;
          return (
            <TopicsInput
              label="My topics"
              placeholder="Add your interests"
              blurBehavior="add"
              topics={data.Topic.map(d => ({ name: d.name }))}
              personTopics={["R", "Python"]}
              fullWidth
            />
          );
        }}
      </Query>
    );
  }
}

export default TopicChips;
