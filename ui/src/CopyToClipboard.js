import React, { Component } from "react";
import copy from "clipboard-copy";
import Tooltip, { TooltipProps } from "@material-ui/core/Tooltip";

interface ChildProps {
  copy: (content: any) => void;
}

interface Props {
  TooltipProps?: Partial<TooltipProps>;
  children: (props: ChildProps) => React.ReactElement<any>;
}

interface OwnState {
  showTooltip: boolean;
}

/**
 * Render prop component that wraps element in a Tooltip that shows "Copied to clipboard!" when the
 * copy function is invoked
 */
class CopyToClipboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    };
  }

  render() {
    return (
      <Tooltip
        open={this.state.showTooltip}
        title={"Copied to clipboard!"}
        leaveDelay={1500}
        onClose={this.handleOnTooltipClose}
        {...(this.props.TooltipProps || {})}
      >
        {this.props.children({ copy: this.onCopy })}
      </Tooltip>
    );
  }

  onCopy = (content: any) => {
    copy(content);
    this.setState({ showTooltip: true });
  };

  handleOnTooltipClose = () => {
    this.setState({ showTooltip: false });
  };
}

export default CopyToClipboard;
