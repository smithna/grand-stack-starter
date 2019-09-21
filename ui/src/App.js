import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

import "./App.css";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ScatterPlot as DashboardIcon,
  EmojiPeople as PeopleIcon,
  AddCircleOutline as AddIcon
} from "@material-ui/icons";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import CommonTopicGraphs from "./CommonTopicGraphs";
import UserList from "./UserList";
import AddTopics from "./AddTopics";
import { group, rollups } from "d3-array";
import classNames from "classnames";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    backgroundColor: "#383838"
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 9
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflow: "auto"
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedView: "Home",
      open: true
    };
  }

  setSelectedView(viewName) {
    this.setState({
      selectedView: viewName
    });
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <Query
        query={gql`
          {
            Person {
              name
              interests {
                name
              }
            }
          }
        `}
        pollInterval={30000}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          function unpackPerson(person) {
            var person_relationships = [];
            var person_name = person.name;
            for (var i in person.interests) {
              var topic_name = person.interests[i].name;
              person_relationships.push({
                person: person_name,
                topic: topic_name
              });
            }
            return person_relationships;
          }

          var people_relationships = data.Person.map(unpackPerson).flat();
          var topic_relationships = people_relationships;

          var group_person = group(people_relationships, d => d.person);
          var people = Array.from(group_person.keys()).map(d => ({
            name: d,
            nodeLabel: "Person"
          }));

          var group_topics = group(people_relationships, d => d.topic);
          var topics = Array.from(group_topics.keys()).map(d => ({
            name: d,
            nodeLabel: "Topic"
          }));

          var node_data = [...people, ...topics];

          var link_data = people_relationships.map(d => ({
            source: d.person,
            target: d.topic
          }));
          var bipartite_data = { nodes: node_data, links: link_data };

          function arrayJoin(
            lookupTable,
            mainTable,
            lookupKey,
            mainKey,
            lookupColumn,
            newColumnName
          ) {
            var output = [];
            var lg = group(lookupTable, d => d[lookupKey]);
            for (var row in mainTable) {
              var matchedRows = lg.get(mainTable[row][mainKey]);
              for (var matchedRow in matchedRows) {
                var newRow = Object.assign({}, mainTable[row]);
                newRow[newColumnName] = matchedRows[matchedRow][lookupColumn];
                output.push(newRow);
              }
            }
            return output;
          }

          var person_to_person = arrayJoin(
            people_relationships,
            topic_relationships,
            "topic",
            "topic",
            "person",
            "person2"
          );

          var topic_to_topic = arrayJoin(
            topic_relationships,
            people_relationships,
            "person",
            "person",
            "topic",
            "topic2"
          );

          var pg = rollups(
            person_to_person,
            v => v.map(w => w.topic),
            d => d.person,
            d => d.person2
          );

          var tg = rollups(
            topic_to_topic,
            v => v.map(w => w.topic),
            d => d.topic,
            d => d.topic2
          );

          function assembleProjectionLinks(groupedArray) {
            var linkArray = [];
            var p1 = groupedArray[0];
            for (var i in groupedArray[1]) {
              var p2 = groupedArray[1][i][0];
              var commonalities = groupedArray[1][i][1];
              if (p1 < p2) {
                linkArray.push({
                  source: p1,
                  target: p2,
                  commonalities: commonalities.join(", "),
                  commonalityCount: commonalities.length
                });
              }
            }

            return linkArray;
          }
          var p2p_links = pg.map(assembleProjectionLinks).flat();
          var p2p_data = { nodes: people, links: p2p_links };
          var t2t_links = tg.map(assembleProjectionLinks).flat();
          var t2t_data = { nodes: topics, links: t2t_links };

          return (
            <React.Fragment>
              <CssBaseline />
              <div className={classes.root}>
                <AppBar
                  position="absolute"
                  className={classNames(
                    classes.appBar,
                    this.state.open && classes.appBarShift
                  )}
                >
                  <Toolbar
                    disableGutters={!this.state.open}
                    className={classes.toolbar}
                  >
                    <IconButton
                      color="inherit"
                      aria-label="Open drawer"
                      onClick={this.handleDrawerOpen}
                      className={classNames(
                        classes.menuButton,
                        this.state.open && classes.menuButtonHidden
                      )}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography
                      component="h1"
                      variant="h3"
                      color="inherit"
                      noWrap
                      className={classes.title}
                    >
                      Meetup Mixer
                    </Typography>
                  </Toolbar>
                </AppBar>
                <Drawer
                  variant="permanent"
                  classes={{
                    paper: classNames(
                      classes.drawerPaper,
                      !this.state.open && classes.drawerPaperClose
                    )
                  }}
                  open={this.state.open}
                >
                  <div className={classes.toolbarIcon}>
                    <IconButton onClick={this.handleDrawerClose}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </div>
                  <Divider />
                  <List>
                    <div>
                      <ListItem
                        button
                        onClick={() => this.setSelectedView("Home")}
                      >
                        <ListItemIcon>
                          <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="View Community" />
                      </ListItem>
                      <ListItem
                        button
                        onClick={() => this.setSelectedView("NewInterest")}
                      >
                        <ListItemIcon>
                          <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add Interests" />
                      </ListItem>
                      <ListItem
                        button
                        onClick={() => this.setSelectedView("Users")}
                      >
                        <ListItemIcon>
                          <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Find Friends" />
                      </ListItem>
                    </div>
                  </List>
                </Drawer>
                <main className={classes.content}>
                  <div className={classes.appBarSpacer} />

                  {/* FIXME: Use proper routing here instead  */}
                  <Typography
                    component="div"
                    className={classes.chartContainer}
                  >
                    {this.state.selectedView === "Home" ? (
                      <CommonTopicGraphs
                        p2p_data={p2p_data}
                        t2t_data={t2t_data}
                        bipartite_data={bipartite_data}
                      />
                    ) : null}
                    {this.state.selectedView === "Users" ? (
                      <UserList data={p2p_data} />
                    ) : null}
                    {this.state.selectedView === "NewInterest" ? (
                      <AddTopics />
                    ) : null}
                  </Typography>
                </main>
              </div>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default withStyles(styles)(App);
