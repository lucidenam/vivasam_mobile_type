import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';

class FooterPopupContainer extends Component {
  render() {
    return (
      <Fragment></Fragment>
    );
  }
}

export default connect(
  (state) => ({
    logged: state.base.get('logged')
  }),
  (dispatch) => ({
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(FooterPopupContainer);
