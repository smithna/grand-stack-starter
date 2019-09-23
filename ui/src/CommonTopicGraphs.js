import React, { Component } from "react";
import "./App.css";
import BipartiteGraph from "./BipartiteGraph";
import ForceGraph from "./ForceGraph";

class CommonTopicGraphs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const bipartite_nodes = this.props.bipartite_data.nodes;
    const personNodes = [
      ...new Set(bipartite_nodes.filter(d => d.nodeLabel === "Person"))
    ];
    const topicNodes = [
      ...new Set(bipartite_nodes.filter(d => d.nodeLable !== "Person"))
    ];
    const longestNodeLength =
      topicNodes.length > personNodes.length
        ? topicNodes.length
        : personNodes.length;
    const displayHeight = longestNodeLength < 8 ? 160 : longestNodeLength * 22;

    return (
      <div id="wrapper">
        <div id="personToPerson">
          <p>People with common interests</p>
          <BipartiteGraph
            data={this.props.p2p_data}
            size={[360, displayHeight]}
            layout={"force"}
          />
        </div>
        <div id="personToTopic">
          <BipartiteGraph
            data={this.props.bipartite_data}
            size={[360, displayHeight]}
            layout={"bipartite"}
          />
        </div>
        <div id="topicToTopic">
          <p>Topics with common people</p>
          <BipartiteGraph
            data={this.props.t2t_data}
            size={[360, displayHeight]}
            layout={"force"}
          />
        </div>
      </div>
    );
  }
}

export default CommonTopicGraphs;
