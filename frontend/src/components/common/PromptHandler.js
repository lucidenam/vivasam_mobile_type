import React, { Component,Prompt } from 'react';

class PrompWrapper extends Component {
    render() {
        const { message } = this.props;
        return (
            <Prompt
                message = {message}
            />
        );
    }
}

export default PrompWrapper;
