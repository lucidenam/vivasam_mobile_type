import React, { Component } from 'react';

class AsyncComponent extends Component {

    state = {
      component: null,
    }

    componentDidMount = () => {
        this.props.loader().then((component) => {
            this.setState({ component: component.default });
        });
    }

    _generateProps = () => {
        const props = { ...this.props };
        delete props.loader;
        return props;
    }

    render() {
        const props = this._generateProps();
        if (this.state.component) {
            return <this.state.component {...props} />;
        }
        return null;
    }
}
export default AsyncComponent;
