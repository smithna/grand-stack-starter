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
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";

const styles = theme => ({
  root: {
    maxWidth: 700,
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
    margin: "auto"
  },
  table: {
    minWidth: 700
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 300
  },

  code: {
    align: "left"
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
      order: "asc",
      orderBy: "name",
      usernameFilter: "Choose a person"
    };
  }

  handleChange = event => {
    this.setState({ usernameFilter: event.target.value });
  };

  handleSortRequest = property => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
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

    let sources = bidirectional_data.map(n => n.source);
    sources = [...new Set(sources)].sort();
    const { order, orderBy } = this.state;
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography variant="h2" gutterBottom>
          User List
        </Typography>
        <InputLabel htmlFor="person-selct">Person</InputLabel>
        <Select
          value={this.state.usernameFilter}
          onChange={this.handleChange}
          inputProps={{
            name: "source",
            id: "person-select"
          }}
        >
          {sources.map(n => {
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

        <div>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            You could run this Cypher query in Neo4j Browser to return these
            results.
          </Typography>
          <Typography className={classes.code} variant="body2" component="p">
            {
              "MATCH (p1:Person)-[:INTERESTED_IN]->(t:Topic)<-[:INTERESTED_IN]-(p2:Person)"
            }
            <br />
            WHERE p1.name = "{this.state.usernameFilter}"<br />
            RETURN p2.name AS Person, count(t) AS `Common Topic Count`,
            collect(t.name) AS `Common Topics`;
          </Typography>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(UserList);
