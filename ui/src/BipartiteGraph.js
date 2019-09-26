import React, { useEffect, useRef } from "react";
import "./App.css";
import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceCenter,
  forceX,
  forceY,
  forceManyBody
} from "d3-force";
import { select, event } from "d3-selection";
import { drag } from "d3-drag";
import { transition } from "d3-transition";

function BipartiteGraph(props) {
  const d3Container = useRef(null);
  useEffect(() => restart());
  useEffect(() => restart(), [props.data, d3Container.current]);

  const linkData = props.data.links;
  const links = linkData.map(d => Object.create(d));
  const nodes = props.data.nodes.map(d => Object.create(d));
  const radius = props.layout === "bipartite" ? 10 : 35;

  function createLinkedByIndex(links) {
    let linkedByIndex = {};

    links.forEach(d => {
      linkedByIndex[[d.source, d.target]] = 1;
      if (props.layout === "bipartite") {
        links.forEach(i => {
          if (i.target === d.target) {
            linkedByIndex[[d.source, i.source]] = 1;
          }
        });
      }
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

  const simulation = forceSimulation(nodes).force(
    "collide",
    forceCollide(radius + 3)
      .iterations(16)
      .strength(0.9)
  );

  if (props.layout === "bipartite") {
    simulation
      .force("link", forceLink(links).id(d => d.name))
      .force("center", forceCenter(props.size[0] / 2, props.size[1] / 2));
  } else {
    simulation
      .force(
        "link",
        forceLink(links)
          .id(d => d.name)
          .distance(d => 350 - d.commonalityCount * 3)
      )
      .force("charge", forceManyBody().strength(-1200))
      .force("X", forceX(props.size[0] / 2).strength(0.45))
      .force("Y", forceY(props.size[1] / 2).strength(0.3));
  }

  function restart() {
    const svg = select(d3Container.current);
    const orientation = props.orientation;
    const displaySize = props.size;

    const link = svg.select("g.bipartite-links").selectAll("line");

    const circle = svg.select("g.bipartite-nodes").selectAll("g.circle");

    link
      .data(links)
      .join("line")
      .attr("stroke", "#999999")
      .attr("stroke-opacity", 0.6);

    circle
      .data(nodes)
      .join("g")
      .attr("class", "circle");

    circle.selectAll("*").remove();

    circle
      .append("circle")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("r", radius)
      .attr("x", 0)
      .attr("fill", d => (d.nodeLabel === "Person" ? "#de8a5a" : "#70a494"));

    circle
      .on("mouseover", highlightLinkedCircles)
      .on("mouseout", unhighlightLinkedCircles);

    if (props.layout === "bipartite") {
      circle.each(
        d =>
          (d.fx =
            d.nodeLabel === "Person"
              ? displaySize[1] / 3
              : (displaySize[1] * 2) / 3)
      );

      circle
        .append("text")
        .text(d => d.name)
        .attr("x", d => (d.nodeLabel === "Person" ? -13 : 13))
        .attr("y", 3)
        .attr("writing-mode", d => (orientation === "horizontal" ? "tb" : "lr"))
        .attr("text-anchor", d => (d.nodeLabel === "Person" ? "end" : "start"))
        .attr("fill", "#282828");
    } else {
      circle.call(dragging(simulation));

      var text = circle
        .append("text")
        .attr("y", d => (d.name.match(/\s/g) || []).length * -7.5 - 12)
        .attr("fill", "#333");

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
    }

    simulation.on("tick", () => {
      link
        .attr("x1", d =>
          Math.max(
            radius + 2.5,
            Math.min(props.size[0] - radius - 2.5, d.source.x)
          )
        )
        .attr("y1", d =>
          Math.max(
            radius + 2.5,
            Math.min(props.size[1] - radius - 2.5, d.source.y)
          )
        )
        .attr("x2", d =>
          Math.max(
            radius + 2.5,
            Math.min(props.size[0] - radius - 2.5, d.target.x)
          )
        )
        .attr("y2", d =>
          Math.max(
            radius + 2.5,
            Math.min(props.size[1] - radius - 2.5, d.target.y)
          )
        );

      if (props.layout === "bipartite") {
        circle.each(
          d =>
            (d.fx =
              d.nodeLabel === "Person"
                ? displaySize[0] / 3
                : (displaySize[0] * 2) / 3)
        );
      }
      //circle.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
      circle.attr(
        "transform",
        d =>
          "translate(" +
          Math.max(radius + 2.5, Math.min(props.size[0] - radius - 2.5, d.x)) +
          "," +
          Math.max(radius + 2.5, Math.min(props.size[1] - radius - 2.5, d.y)) +
          ")"
      );
    });

    simulation
      .nodes(nodes)
      .force("link", forceLink(links).id(d => d.name))
      .alpha(1)
      .restart();
  }

  function highlightLinkedCircles(d) {
    linkedByIndex = createLinkedByIndex(linkData);
    select(d3Container.current)
      .selectAll("circle")
      .filter(n => isConnected(d, n, linkedByIndex))
      .transition()
      .duration("500")
      .attr("stroke", "#333")
      .attr("stroke-width", 2.5);
  }

  function unhighlightLinkedCircles(d) {
    select(d3Container.current)
      .selectAll("circle")
      .transition()
      .duration("500")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);
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

  return (
    <svg ref={d3Container} width={props.size[0]} height={props.size[1]}>
      <g className="bipartite-links"></g>
      <g className="bipartite-nodes"></g>
    </svg>
  );
}

export default BipartiteGraph;
