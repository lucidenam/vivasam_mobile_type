import React, {Component} from 'react';
import PageTemplate from 'components/page/PageTemplate';
import RightButton from 'components/common/RightButton';
import {
  RollingBanner,
  LoginForm,
  SleepGuide,
  AuthRequire,
  AuthExpired,
  AuthRenew,
  AuthRequireAdd,
  AuthRequireConfirm,
  AuthRequireComplete,
  AuthRequireEmail,
  MemberInfoUpdateGuide,
  ChangePasswordInfo
} from 'containers/login';
import {NotFoundPage} from 'pages';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {initializeGtag} from "../../store/modules/gtag";

class LoginPage extends Component{

  componentDidMount() {
    initializeGtag();
    function gtag(){
      window.dataLayer.push(arguments);
    }
    gtag('config', 'G-MZNXNH8PXM', {
      'page_path': '/login',
      'page_title': '로그인｜비바샘'
    });
  }

  render() {
    const {ssoLoginMode, history, loginInfo} = this.props;
    if (!ssoLoginMode && this.props.match.params.name != undefined) {
      alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
      history.push("/");
    }
    let container;
    let rightMenu;
    let title;
    switch (this.props.match.params.name) {
      case undefined:
        container = (
            <section className="login">
              <h2 className="blind">로그인</h2>
              <LoginForm/>
              <RollingBanner/>
            </section>
        );
        title = "로그인";
        break;
      case 'sleep':
        container = <SleepGuide/>;
        title = "휴면회원 안내";
        rightMenu = <RightButton title="로그인" link="/login"/>;
        break;
      case 'expired':
        container = <AuthExpired/>;
        title = "인증만료안내";
        break;
      case 'renew':
        container = <AuthRenew/>;
        title = "인증갱신안내";
        break;
      case 'require':
        container = <AuthRequire/>;
        title = loginInfo.mTypeCd == '2' ? "비바샘 재학 인증" : "비바샘 교사 인증";
        break;
      case 'requireAdd':
        container = <AuthRequireAdd/>;
        title = "비바샘 교사 인증";
        break;
      case 'requireEmail':
        container = <AuthRequireEmail/>;
        title = "비바샘 교사 인증";
        break;
      case 'requireConfirm':
        container = <AuthRequireConfirm/>;
        title = loginInfo.mTypeCd == '2' ? "비바샘 재학 인증" : "비바샘 교사 인증";
        break;
      case 'requireComplete':
        container = <AuthRequireComplete/>;
        title = loginInfo.mTypeCd == '2' ? "비바샘 재학 인증" : "비바샘 교사 인증";
        break;
      case 'update_old':
        container = <MemberInfoUpdateGuide/>;
        title = "회원정보 업데이트 안내";
        break;
      case 'update': // 20190611 임시로 만든 것
        container = <ChangePasswordInfo/>;
        title = "비밀번호 변경 안내";
        break;
      default:
        container = <NotFoundPage/>;
    }

    return (
        <PageTemplate title={title} rightMenu={rightMenu} isPushHidden={true}>
          {container}
        </PageTemplate>
    )
  }
}

export default connect(
    (state) => ({
      loginInfo: state.base.get('loginInfo').toJS(),
      ssoLoginMode: state.base.get('ssoLoginMode')
    }),
    (dispatch) => ({})
)(withRouter(LoginPage));
