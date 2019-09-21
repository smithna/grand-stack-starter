import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import ReactAutosuggest from "./ReactAutoSuggest.js";
import { ApolloProvider } from "react-apollo";

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
  {
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
      <Query query={topic_query}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;
          console.log(data);
          return (
            <ReactAutosuggest
              label="My topics"
              placeholder="Add your interests"
              blurBehavior="add"
              topics={data.Topic.map(d => ({ name: d.name }))}
              fullWidth
            />
          );
        }}
      </Query>
    );
  }
}

export default TopicChips;
