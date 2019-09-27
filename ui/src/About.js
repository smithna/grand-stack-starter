import React, { Component } from "react";

class About extends Component {
  render() {
    return (
      <div>
        <h1>ABOUT</h1>
        <h3>WHY</h3>
        <p>This project was built by 4 data and math enthusiasts for the Neo4j 2019 Global Graph Hack. 
        More information about the contest can be found at&nbsp;
          <a href="https://neo4j.com/blog/hackers-start-your-engines-global-graphhack-2019-kicks-off/">this link</a>
          , and other project submissions can be found <a href="https://globalgraphhack.devpost.com/submissions">here</a>.</p>
        <h3>CODE</h3>
        <p>One of our main goals was to help others learn Neo4j as well as the other components of GRANDstack, so please feel free to create a similar project or expand on this one to make it even better! </p>
        <p>You will find the github code for forking at this link: <a href="https://github.com/smithna/meetup-mixer">https://github.com/smithna/meetup-mixer</a> </p>
        <h3>REFERENCE</h3>
        <p>If you are interested in recreating this project or one similar to it, here are a few links that you may find helpful:</p>
        <p>Neo4j Sandbox: <a href="https://neo4j.com/sandbox-v2/">https://neo4j.com/sandbox-v2/</a></p>
        <p>GRANDstack Docs: <a href="https://grandstack.io/docs/getting-started-neo4j-graphql.html">https://grandstack.io/docs/getting-started-neo4j-graphql.html</a></p>
        <p>OneGraph (to easily integrate with social and business sites): <a href="https://www.onegraph.com/">https://www.onegraph.com/</a></p>
        <p>More information can be found in the README provided in the github project.</p>
        <p>THANK YOU for stopping by! Happy learning!</p>
      </div>
    );
  }
}

export default About;
