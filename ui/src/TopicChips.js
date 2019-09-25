import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import TopicsInput from "./ReactAutoSuggest.js";
import CopyToClipboard from "./CopyToClipboard.js";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { FileCopy as CopyIcon } from "@material-ui/icons";

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

const useStyles = makeStyles(theme => ({
  spacing: 8,

  Select: base => ({ ...base, color: "green" }),

  root: {
    maxWidth: 700,
    marginTop: theme.spacing(3),
    overflowX: "auto",
    margin: "auto",
    padding: "15px"
  },

  myInterest: {
    color: "#ff0"
  },

  code: {
    textAlign: "left",
    fontSize: 14,
    backgroundColor: "#efefef",
    paddingLeft: theme.spacing(2.5),
    padding: theme.spacing(1.5),
    overflow: "hidden",
    whiteSpace: "pre-line",
    "& svg": {
      color: "#999",
      alignItems: "right",
      float: "right"
    }
  },

  tutorial: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1)
  },

  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
}));

const CodeSample = ({ currentUser, myTopics }) => {
  const classes = useStyles();
  if (myTopics === "default") {
    return <div></div>;
  } else {
    const cypherString = `//If your user isn't in the database yet, create it
    MERGE (p:Person {name:"${currentUser}"})
    //Delete your old INTERESTED_IN relationships
    WITH p
    OPTIONAL MATCH (p)-[r:INTERESTED_IN]-()
    DELETE r
    //For each topic in the list, creat the topic if it doesn't already exist.
    WITH p
    UNWIND ["${myTopics.join('", "')}"] AS interest
    MERGE (t:Topic {name:interest})
    //Create INTERESTED_IN relationships from you to all of yoru topics
    WITH p, t
    MERGE (p)-[:INTERESTED_IN]-(t)
    RETURN p`;
    return (
      <div className={classes.tutorial}>
        <Typography
          className={classes.title}
          color="textSecondary"
          component="p"
          gutterBottom
        >
          Your topics have been updated. To perform the same update in Neo4j
          browser, you could have run this Cypher query:
        </Typography>
        <div className={classes.code}>
          <Typography component="p" variant="body2">
            {cypherString}
          </Typography>
          <CopyToClipboard>
            {({ copy }) => <CopyIcon onClick={() => copy(cypherString)} />}
          </CopyToClipboard>
        </div>
      </div>
    );
  }
};

class TopicChips extends Component {
  state = {
    myTopics: "default"
  };
  constructor(props) {
    super(props);
    this.handleTopicChange = this.handleTopicChange.bind(this);
  }

  handleTopicChange(topics) {
    this.setState({ myTopics: topics });
  }

  render() {
    return (
      <Query query={topic_query} variables={{ name: this.props.currentUser }}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;
          let currentTopics =
            this.state.myTopics === "default"
              ? data.Person[0].interests.map(i => i.name)
              : this.state.myTopics;
          return (
            <React.Fragment>
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "wrap",
                  height: 300
                }}
              >
                {data.Topic.sort((a, b) => (a.name < b.name ? -1 : 1)).map(
                  d => (
                    <li
                      style={{
                        color: currentTopics.includes(d.name)
                          ? "#43bf9a"
                          : "#000"
                      }}
                    >
                      {d.name}
                    </li>
                  )
                )}
              </ul>
              <TopicsInput
                label="My topics"
                placeholder="Add your interests"
                blurBehavior="add"
                topics={data.Topic.map(d => ({ name: d.name }))}
                personTopics={data.Person[0].interests.map(d => d.name)}
                currentUser={this.props.currentUser}
                updateTopics={this.handleTopicChange}
                fullWidth
              />
              <CodeSample
                currentUser={this.props.currentUser}
                myTopics={this.state.myTopics}
              />
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default TopicChips;
