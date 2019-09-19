import React, { Component } from "react";
import "./App.css";
import BipartiteGraph from "./BipartiteGraph";
import ForceGraph from "./ForceGraph";

class CommonTopicGraphs extends Component {
  constructor(props) {
    super(props);
    this.createCommonTopicsGraphs = this.createCommonTopicsGraphs.bind(this);
  }

  componentDidMount() {
    this.createCommonTopicsGraphs();
  }

  componentDidUpdate() {
    this.createCommonTopicsGraphs();
  }

  createCommonTopicsGraphs() {}

  render() {
    return (
      <div id="wrapper">
        <div id="personToPerson">
          <p>People with common interests</p>
          <ForceGraph
            data={this.props.p2p_data}
            size={[360, this.props.bipartite_data.links.length * 20]}
          />
        </div>
        <div id="personToTopic">
          <BipartiteGraph
            data={this.props.bipartite_data}
            size={[360, this.props.bipartite_data.links.length * 20]}
            orientation={"vertical"}
          />
        </div>
        <div id="topicToTopic">
          <p>Topics with common people</p>
          <ForceGraph
            data={this.props.t2t_data}
            size={[360, this.props.bipartite_data.links.length * 20]}
          />
        </div>
      </div>
    );
  }
}

export default CommonTopicGraphs;
