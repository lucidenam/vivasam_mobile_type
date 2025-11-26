import React, { Component } from 'react';

class InfoText extends Component {
    render() {
        const {message, className} = this.props;
        return (
            <p className={className}>
              {message}
            </p>
        );
    }
}

export default InfoText;
