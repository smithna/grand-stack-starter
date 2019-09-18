import React, { Component } from "react";
import "./App.css";
import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceCenter
} from "d3-force";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";

class BipartiteGraph extends Component {
  constructor(props) {
    super(props);
    this.createBipartiteGraph = this.createBipartiteGraph.bind(this);
  }

  componentDidMount() {
    this.createBipartiteGraph();
  }

  componentDidUpdate() {
    this.createBipartiteGraph();
  }

  createBipartiteGraph() {
    const node = this.node;
    const links = this.props.data.links.map(d => Object.create(d));
    const nodes = this.props.data.nodes.map(d => Object.create(d));
    const orientation = this.props.orientation;
    const displaySize = this.props.size;

    const linkedByIndex = {};

    links.forEach(d => {
      linkedByIndex[[d.source, d.target]] = 1;
      links.forEach(i => {
        if (i.target === d.target) {
          linkedByIndex[[d.source, i.source]] = 1;
        }
      });
    });
    console.log(linkedByIndex);

    function isConnected(a, b) {
      return (
        linkedByIndex[`${a.name},${b.name}`] ||
        linkedByIndex[`${b.name},${a.name}`] ||
        a.name === b.name
      );
    }

    select(node).attr("class", "bipartite");

    const simulation = forceSimulation(nodes)
      .force("link", forceLink(links).id(d => d.name))
      .force("collide", forceCollide(15).iterations(16))
      .force(
        "center",
        forceCenter(this.props.size[0] / 2, this.props.size[1] / 2)
      );

    const link = select(node)
      .select("g.bipartite-links")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll(".bipartite line")
      .data(links)
      .join("line")
      .attr("stroke", "black");

    const circle = select(node)
      .select("g.bipartite-nodes")
      .selectAll(".bipartite g.circle")
      .data(nodes)
      .join(circleEntered, circleUpdated);

    function circleEntered(enter) {
      var circleGs = enter.append("g").attr("class", "circle");

      circleGs
        .append("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("r", 10)
        .attr("x", 0)
        .attr("fill", d => (d.nodeLabel === "Person" ? "orange" : "lightblue"))
        .each(
          d =>
            (d.fx =
              d.nodeLabel === "Person"
                ? displaySize[1] / 3
                : (displaySize[1] * 2) / 3)
        )
        .on("mouseover", function(d) {
          selectAll(".bipartite circle")
            .filter(n => isConnected(d, n))
            .transition()
            .duration("500")
            .attr("stroke", "#000")
            .attr("stroke-width", 2.5)
            .attr("r", 12);
        })
        .on("mouseout", function(d) {
          selectAll(".bipartite circle")
            .transition()
            .duration("500")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("r", 10);
        });

      circleGs.append("title").text(d => d.name);

      circleGs
        .append("text")
        .text(d => d.name)
        .attr("x", d => (d.nodeLabel === "Person" ? -13 : 13))
        .attr("y", 3)
        .attr("writing-mode", d => (orientation === "horizontal" ? "tb" : "lr"))
        .attr("text-anchor", d => (d.nodeLabel === "Person" ? "end" : "start"));

      return circleGs;
    }

    function circleUpdated(update) {
      console.log("called update");
      console.log(update);
      return update;
    }

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      circle
        .each(
          d =>
            (d.fx =
              d.nodeLabel === "Person"
                ? displaySize[0] / 3
                : (displaySize[0] * 2) / 3)
        )
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    });
  }

  render() {
    return (
      <svg
        ref={node => (this.node = node)}
        width={this.props.size[0]}
        height={this.props.size[1]}
      >
        <g className="bipartite-links"></g>
        <g className="bipartite-nodes"></g>
      </svg>
    );
  }
}

export default BipartiteGraph;
