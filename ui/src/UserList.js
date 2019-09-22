import React from "react";
import "./UserList.css";
import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import CopyToClipboard from "./CopyToClipboard.js";

const styles = theme => ({
  spacing: 8,

  Select: base => ({ ...base, color: "green" }),

  root: {
    maxWidth: 700,
    marginTop: theme.spacing(3),
    overflowX: "auto",
    margin: "auto",
    padding: "15px"
  },
  table: {
    minWidth: 670
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300
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
  },
  nameTag: {
    backgroundColor: "red",
    borderColor: "red",
    textAlign: "center",
    borderRadius: 16,
    color: "white",
    paddingBottom: 24,
    paddingTop: 12,
    paddingLeft: 1,
    paddingRight: 1,
    maxWidth: 302,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 32,
    "& h3": {
      margin: 0,
      fontSize: 24
    },
    "& label": {
      paddingBottom: 10,
      color: "white"
    }
  },

  nameTagBody: {
    backgroundColor: "white",
    marginLeft: "auto",
    marginRight: "auto",
    padding: 36
  },

  nameTagLabel: {
    color: "white"
  }
});

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameFilter: this.props.currentUser
    };
  }

  handleChange = event => {
    this.setState({ usernameFilter: event.target.value });
  };

  render() {
    let links = this.props.data.links;
    let reversed_links = links.map(n => {
      let reversed = Object.assign({}, n);
      reversed.source = n.target;
      reversed.target = n.source;
      return reversed;
    });

    let bidirectional_data = links.concat(reversed_links);
    let people = this.props.data.nodes.map(n => n.name).sort();

    function formatTopics(topicList) {
      let tokens = topicList.split(", ");
      if (tokens.length === 1) return topicList;
      else {
        let finalToken = tokens.slice(-1);
        return tokens.slice(0, -1).join(", ") + ", or " + finalToken;
      }
    }

    const { classes } = this.props;
    let cypherString = `MATCH (p1:Person)-[:INTERESTED_IN]->(t:Topic)<-[:INTERESTED_IN]-(p2:Person)
WHERE p1.name = "${this.state.usernameFilter}"
RETURN p2.name AS Person,
count(t) AS \`Common Topic Count\`,
collect(t.name) AS \`Common Topics\`
ORDER BY count(t) DESC;`;
    return (
      <Paper className={classes.root}>
        <div className={classes.nameTag}>
          <h3>HELLO</h3>
          <InputLabel htmlFor="person-selct" classes={{ root: "nameTagLabel" }}>
            My name is
          </InputLabel>
          <div className={classes.nameTagBody}>
            <Select
              value={this.state.usernameFilter}
              onChange={this.handleChange}
              style={{ fontFamily: "Permanent Marker", fontSize: 24 }}
              inputProps={{
                name: "source",
                id: "person-select"
              }}
            >
              {people.map(n => {
                return <MenuItem value={n}>{n}</MenuItem>;
              })}
            </Select>
          </div>
        </div>
        <p>
          Welcome to the Meetup, {this.state.usernameFilter.split(" ")[0]}.
          Let's get networking!
        </p>
        <ul>
          {bidirectional_data
            .filter(n => n.source === this.state.usernameFilter)
            .sort((a, b) =>
              a.commonalityCount < b.commonalityCount
                ? 1
                : a.commonalityCount === b.commonalityCount
                ? a.target > b.target
                  ? 1
                  : -1
                : -1
            )
            .map(n => {
              return (
                <li key={n.target}>
                  Start a conversation with {n.target} about{" "}
                  {formatTopics(n.commonalities)}.
                </li>
              );
            })}
        </ul>

        <div className={classes.tutorial}>
          <Typography
            className={classes.title}
            color="textSecondary"
            component="p"
            gutterBottom
          >
            To return the results above in Neo4j Browser, run this Cypher query:
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
      </Paper>
    );
  }
}

export default withStyles(styles)(UserList);
