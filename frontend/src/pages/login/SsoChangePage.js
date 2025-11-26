import React, {Component} from 'react';
import SsoPageTemplate from 'components/page/SsoPageTemplate';
import SsoChangeMain from 'containers/login/SsoChangeMain';
import SsoChangeAgree from 'containers/login/SsoChangeAgree';
import SsoChangeCheck from 'containers/login/SsoChangeCheck';
import SsoChangeInfo from 'containers/login/SsoChangeInfo';
import SsoChangeSchool from 'containers/login/SsoChangeSchool';
import SsoChangeTeacher from 'containers/login/SsoChangeTeacher';
import NotFoundPage from 'pages/NotFoundPage';
import { withRouter } from 'react-router-dom';
import {connect} from "react-redux";
import SsoJoinVerification from 'containers/login/SsoJoinVerification';
import SsoJoinVerificationResult from "containers/login/SsoJoinVerificationResult";
import {FooterCopyright} from "../../components/page";

class SsoChangePage extends Component{
  render () {
      const { ssoLoginMode, history } = this.props;
      if (!ssoLoginMode) {
          alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
          history.push("/");
      }
    let isHeaderHidden = false;
    let isHidden = true;
    let titleText = '통합회원 전환하기';
    let clazz = 'float_box hasFooter';
    let container;
    switch (this.props.match.params.name) {
    case 'main':
        clazz = 'integrated_wrap';
        isHeaderHidden = true;
        container = <SsoChangeMain/>;
        break;
    case 'agree':
        container = <SsoChangeAgree/>;
        break;
    case 'verify':
        container = <SsoJoinVerification/>;
        clazz='';
        break;
    case 'verifyResult':
        container = <SsoJoinVerificationResult/>;
        break;
    case 'check':
        container = <SsoChangeCheck/>;
        break;
    case 'info' :
        titleText = '비바샘 통합 회원가입';
        container = <SsoChangeInfo/>
        break;
    case 'school' :
        container = <SsoChangeSchool/>
        break;
    case 'teacher' :
        container = <SsoChangeTeacher/>
        break;
    default :
        container = <NotFoundPage/>;
    }

    return (
        <SsoPageTemplate title={titleText} clazz={clazz} isHeaderHidden={isHeaderHidden}>
          <div className="hasFooterWrap">
            {container}
            <FooterCopyright handleLogin={this.handleLogin}/>
          </div>
        </SsoPageTemplate>

        // <PageTemplate title={titleText} isHidden={isHidden} clazz={clazz}>
        //     {container}
        // </PageTemplate>
    )
  }
}

export default connect(
    (state) => ({
        ssoLoginMode : state.base.get('ssoLoginMode')
    }),
    (dispatch) => ({
    })
)(withRouter(SsoChangePage));
