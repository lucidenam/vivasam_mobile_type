import React, { Component,Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

class RightIcon extends Component {
    state = {
        tooltipActive: false
    }

    openLayer = (e) => {
        var targetNode = ReactDOM.findDOMNode(e.target);
        if("allMenu_back_help icon_help" === targetNode.className) {
            targetNode.className = "allMenu_back_help icon_help active";
        } else {
            targetNode.className = "allMenu_back_help icon_help";
        }

        if(this.state.tooltipActive) {
            this.setState({
                tooltipActive : false
            })
        } else {
            this.setState({
                tooltipActive : true
            })
        }
    }

    render() {
        const { tooltipText } = this.props;
        const { tooltipActive } = this.state;
        return (
            <Fragment>
                <div className="rightMenu">
                    <button className="allMenu_back_help icon_help" onClick={this.openLayer}></button>
                </div>
                {tooltipActive &&
                    <div className="layer_help">
                        <div className="layer_help_box">
                            <p className="layer_help_ment">
                            {tooltipText}
                            </p>
                        </div>
                    </div>
                }
            </Fragment>
        );
    }
}

export default RightIcon;
