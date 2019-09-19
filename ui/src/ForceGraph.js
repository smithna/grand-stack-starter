import React, { Component } from "react";
import "./App.css";
import {
  forceSimulation,
  forceLink,
  forceCollide,
  forceX,
  forceY,
  forceManyBody
} from "d3-force";
import { select, selectAll, event } from "d3-selection";
import { drag } from "d3-drag";

class ForceGraph extends Component {
  constructor(props) {
    super(props);
    this.createForceGraph = this.createForceGraph.bind(this);
  }

  componentDidMount() {
    this.createForceGraph();
  }

  componentWillUnmount() {}

  componentDidUpdate() {
    this.createForceGraph();
  }

  createForceGraph() {
    const node = this.node;
    let linkData = this.props.data.links;
    const links = linkData.map(d => Object.create(d));
    const nodes = this.props.data.nodes.map(d => Object.create(d));
    const displaySize = this.props.size;
    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id(d => d.name)
          .distance(d => 30 - d.commonalityCount * 3)
      )
      .force("charge", forceManyBody().strength(-200))
      .force("collide", forceCollide(32).iterations(16))
      .force("X", forceX(displaySize[0] / 2).strength(0.45))
      .force("Y", forceY(displaySize[1] / 2).strength(0.15));

    function createLinkedByIndex(links) {
      let linkedByIndex = {};
      links.forEach(d => {
        linkedByIndex[[d.source, d.target]] = 1;
      });
      return linkedByIndex;
    }

    let linkedByIndex = createLinkedByIndex(linkData);

    function isConnected(a, b, links) {
      return (
        links[`${a.name},${b.name}`] ||
        links[`${b.name},${a.name}`] ||
        a.name === b.name
      );
    }

    select(node).attr("class", "force");

    const link = select(node)
      .select("g.force-links")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll(".force line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => d.commonalityCount);

    const circle = select(node)
      .select("g.force-nodes")
      .selectAll(".force g")
      .data(nodes)
      .join(circleEntered, circleUpdated, circleExit)
      .on("mouseover", highlightLinkedCircles)
      .on("mouseout", unhighlightLinkedCircles)
      .call(dragging(simulation));

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      circle.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    });

    function circleEntered(enter) {
      let circleGs = enter.append("g").attr("class", "circle");

      circleGs
        .append("circle")
        .attr("r", 25)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("fill", d => (d.nodeLabel === "Person" ? "orange" : "lightblue"));

      var text = circleGs
        .append("text")
        .attr("y", d => (d.name.match(/\s/g) || []).length * -7.5 - 10);

      text
        .selectAll("tespan.text")
        .data(d => d.name.split(" "))
        .enter()
        .append("tspan")
        .attr("class", "text")
        .text(d => d)
        .attr("dy", 16)
        .attr("x", 0)
        .attr("dx", 0)
        .attr("text-anchor", "middle");

      return circleGs;
    }

    function circleUpdated(update) {
      update
        .on("mouseover", highlightLinkedCircles)
        .on("mouseout", unhighlightLinkedCircles);
      return update;
    }

    function circleExit(exit) {
      exit
        .on("mouseover", highlightLinkedCircles)
        .on("mouseout", unhighlightLinkedCircles);
      return exit;
    }

    function highlightLinkedCircles(d) {
      linkedByIndex = createLinkedByIndex(linkData);
      selectAll(".force circle")
        .filter(n => isConnected(d, n, linkedByIndex))
        .transition()
        .duration("500")
        .attr("stroke", "#000")
        .attr("stroke-width", 2.5)
        .attr("r", 27);
    }

    function unhighlightLinkedCircles(d) {
      selectAll(".force circle")
        .transition()
        .duration("500")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("r", 25);
    }

    function dragging(simulation) {
      function dragstarted(d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }

  render() {
    return (
      <svg
        ref={node => (this.node = node)}
        width={this.props.size[0]}
        height={this.props.size[1]}
      >
        <g className="force-links"></g>
        <g className="force-nodes"></g>
      </svg>
    );
  }
}

export default ForceGraph;
