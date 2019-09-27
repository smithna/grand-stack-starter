import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import TopicsInput from "./ReactAutoSuggest.js";
import CopyToClipboard from "./CopyToClipboard.js";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import Button from "@material-ui/core/Button";

const GET_TOPICS = gql`
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

const REPLACE_INTERESTS = gql`
  mutation replaceInterests($PersonInput: String!, $TopicsInput: [String]) {
    ReplaceInterests(personName: $PersonInput, topicNames: $TopicsInput) {
      name
      interests {
        name
      }
    }
  }
`;

const UpdateButton = ({ values, currentUser, setTopicsUpdated }) => {
  const [replaceInterests] = useMutation(REPLACE_INTERESTS);

  const handleClick = () => {
    console.log("button clicked");
    console.log(currentUser);
    console.log(values);
    replaceInterests({
      variables: {
        PersonInput: currentUser,
        TopicsInput: values
      },
      refetchQueries: ["GET_TOPICS"]
    });
    setTopicsUpdated("updated");
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Update your interests
    </Button>
  );
};

const TopicList = ({ data, myTopics }) => {
  const oldTopics = data.Topic.map(d => d.name);
  const allTopics = [...new Set([...oldTopics, ...myTopics])];
  return (
    <ul
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        height: 300
      }}
    >
      {allTopics.sort().map(d => (
        <li
          style={{
            color: myTopics.includes(d) ? "#43bf9a" : "#000"
          }}
        >
          {d}
        </li>
      ))}
    </ul>
  );
};

const CodeSample = ({ currentUser, myTopics, topicsUpdated }) => {
  const classes = useStyles();
  if (topicsUpdated === "not updated") {
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

const TopicChips = props => {
  const [currentTopics, setCurrentTopics] = useState([]);
  const [topicsUpdated, setTopicsUpdated] = useState("not updated");
  const { loading, error, data } = useQuery(GET_TOPICS, {
    variables: { name: props.currentUser }
  });
  //let currentTopics = "";

  const handleTopicChange = topics => {
    setCurrentTopics(topics);
    setTopicsUpdated("not updated");
  };

  if (error) {
    return <p>`Error! ${error}`</p>;
  }
  if (loading) {
    return <p>Loading ...</p>;
  }
  return (
    <React.Fragment>
      <TopicList
        data={data}
        myTopics={
          topicsUpdated === "not updated"
            ? data.Person[0].interests.map(i => i.name)
            : currentTopics
        }
      />
      <TopicsInput
        label="My topics"
        placeholder="Add your interests"
        blurBehavior="add"
        topics={data.Topic.map(d => ({ name: d.name }))}
        persontopics={data.Person[0].interests.map(d => d.name)}
        updatetopics={handleTopicChange}
        fullWidth
      />
      <UpdateButton
        values={currentTopics}
        currentUser={props.currentUser}
        setTopicsUpdated={setTopicsUpdated}
      />
      <CodeSample
        currentUser={props.currentUser}
        myTopics={currentTopics}
        topicsUpdated={topicsUpdated}
      />
    </React.Fragment>
  );
};

export default TopicChips;
