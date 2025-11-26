import React, { Component } from 'react';
import Footer from 'components/page/Footer';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as baseActions from 'store/modules/base';

class FooterContainer extends Component {
  render() {
    const { logged, isHidden, loginInfo } = this.props;

    return (
      <Footer logged={logged} isHidden={isHidden} loginInfo={loginInfo}/>
    );
  }
}

export default connect(
  (state) => ({
    logged: state.base.get('logged'),
    loginInfo: state.base.get('loginInfo').toJS(),
  }),
  (dispatch) => ({
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(FooterContainer);
