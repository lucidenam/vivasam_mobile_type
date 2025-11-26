import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as popupActions from 'store/modules/popup';

class IframeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount = () => {

    }

    componentWillUpdate = () => {

    }

    render () {
        const {src} = this.props;
        return (
            <iframe title="myiframe" src={src} width="100%" height="100%"></iframe>
        )
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(IframeComponent));
