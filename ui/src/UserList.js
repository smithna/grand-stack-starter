import React from "react";
import "./UserList.css";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography
} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { FileCopy as CopyIcon } from "@material-ui/icons";
import CopyToClipboard from "./CopyToClipboard.js";

const styles = theme => ({
  spacing: 8,

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
    align: "right",
    fontSize: 12,
    backgroundColor: "#efefef",
    paddingLeft: theme.spacing(2.5),
    padding: theme.spacing(1.5)
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
});

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameFilter: this.props.data.nodes.map(n => n.name).sort()[0]
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

    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography component="h2" variant="h5" gutterBottom>
          Start a conversation!
        </Typography>
        <InputLabel htmlFor="person-selct">My name</InputLabel>
        <Select
          value={this.state.usernameFilter}
          onChange={this.handleChange}
          inputProps={{
            name: "source",
            id: "person-select"
          }}
        >
          {people.map(n => {
            return <MenuItem value={n}>{n}</MenuItem>;
          })}
        </Select>

        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow>
              <TableCell key="target">Name</TableCell>
              <TableCell key="commonalityCount" numeric>
                Common Topic Count
              </TableCell>
              <TableCell key="commonalities">Common Topics</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
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
                  <TableRow key={n.target}>
                    <TableCell component="th" scope="row">
                      {n.target}
                    </TableCell>
                    <TableCell numeric>{n.commonalityCount}</TableCell>
                    <TableCell component="th" scope="row">
                      {n.commonalities}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        <div className={classes.tutorial}>
          <Typography
            className={classes.title}
            color="textSecondary"
            component="p"
            gutterBottom
          >
            To return the results above in Neo4j Browser, run this Cypher query:
          </Typography>
          <Typography component="p" className={classes.code}>
            {
              "MATCH (p1:Person)-[:INTERESTED_IN]->(t:Topic)<-[:INTERESTED_IN]-(p2:Person)"
            }
            <br />
            WHERE p1.name = "{this.state.usernameFilter}"<br />
            RETURN p2.name AS Person, <br />
            count(t) AS `Common Topic Count`,
            <br />
            collect(t.name) AS `Common Topics`
            <br />
            ORDER BY count(t) DESC;
          </Typography>
          <CopyToClipboard>
            {({ copy }) => <CopyIcon onClick={() => copy("Cypher Query")} />}
          </CopyToClipboard>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(UserList);
