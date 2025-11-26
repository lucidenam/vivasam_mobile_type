import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class RightButton extends Component {
    render() {
        const { title, link } = this.props;
        return (
            <div className="rightMenu">
                <Link to={link} className="allMenu_right">{title}</Link>
            </div>
        );
    }
}

export default RightButton;
