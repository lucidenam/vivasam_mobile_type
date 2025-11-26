import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import PageTemplate from 'components/page/PageTemplate';
import RightButton from 'components/common/RightButton';
import { FindId, FindPwd, FindSleep } from 'containers/login';
import NotFoundPage from 'pages/NotFoundPage';
import {connect} from "react-redux";
import SendTempPassword from "../../containers/login/SendTempPassword";

class FindPage extends Component{
  render () {
    const { ssoLoginMode, history } = this.props;
    if (!ssoLoginMode) {
        alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
        history.push("/");
    }
    let container;
    let rightMenu;
    let title = "";
    switch (this.props.match.params.name) {
      case 'id':
        container = <FindId/>;
        title = "아이디 찾기";
        break;
      case 'pw':
        container = <FindPwd/>;
        title = "비밀번호 찾기";
        break;
      case 'sleep':
        container = <FindSleep/>;
        title = "휴면 아이디 찾기";
        break;
      case 'tempPw':
        container = <SendTempPassword/>;
        title = "임시 비밀번호 발급";
        break;
      default :
        container = <NotFoundPage/>;
        rightMenu = <RightButton title="로그인" link="/login"/>;
    }
    return (
      <PageTemplate title={title} rightMenu={rightMenu}>
        {container}
      </PageTemplate>
    )
  }
}

export default connect(
    (state) => ({
        ssoLoginMode : state.base.get('ssoLoginMode')
    }),
    (dispatch) => ({
    })
)(withRouter(FindPage));