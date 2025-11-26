import React, { Component } from 'react';
import Header from 'components/page/Header';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class HeaderContainer extends Component {

  goBack = () => {
      const { history } = this.props;
      let pathname = history.location.pathname;
      if(pathname == '/join/verifyResult') {
          history.replace('/');
          history.push('/join/agree');
      } else if(pathname == '/sns/join/verifyResult') {
          history.replace('/');
          history.push('/sns/join/agree');
      } else if(pathname == '/conversion/verifyResult') {
          history.replace('/');
          history.push('/conversion/agree');
      } else if(pathname == '/verification/result') {
          history.replace('/');
          history.push('/verification/main');
      } else if(pathname.indexOf("/cs/notice/") > -1) {
          history.replace('/');
          history.push('/cs/notice');
      } else if(pathname.indexOf("/cs/qna/") > -1) {
          history.replace('/');
          history.push('/cs/qna');
      } else if(pathname.indexOf("/cs/notice") > -1) {
          history.replace('/');
          history.push('/');
      } else if(pathname.indexOf("/cs/qna") > -1) {
          history.replace('/');
          history.push('/');
      } else {
          history.goBack();
      }
  }

  render() {
    const { goBack } = this;
    const { title, logged, rightMenu, disableSticky } = this.props;

    return (
      <Header
        title={title}
        logged={logged}
        onClick={goBack}
        rightMenu={rightMenu}
        disableSticky={disableSticky}
      />
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
)(withRouter(HeaderContainer));
