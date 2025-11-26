import React, {Component} from 'react';
import SsoPageTemplate from 'components/page/SsoPageTemplate';
import JoinSelect from 'containers/login/JoinSelect';
import JoinAgree from 'containers/login/JoinAgree';
import JoinVerification from 'containers/login/JoinVerification';
import JoinVerificationResult from 'containers/login/JoinVerificationResult';
import JoinInfo from 'containers/login/JoinInfo';
import JoinSso from 'containers/login/JoinSso';
import JoinSchool from 'containers/login/JoinSchool';
import JoinTeacher from 'containers/login/JoinTeacher';
import JoinComplete from 'containers/login/JoinComplete';
import NotFoundPage from 'pages/NotFoundPage';
import {FooterCopyright} from "../../components/page";

class JoinPage extends Component{
  render () {
    let titleText = '회원가입';
    let clazz = 'float_box hasFooter';
    let container;
    let isHeaderHidden = false;
    switch (this.props.match.params.name) {
    case 'select':
        clazz= 'integrated_wrap';
        container = <JoinSelect/>;
        break;
    case 'agree':
        container = <JoinAgree/>;
        break;
    case 'verify':
        clazz='';
        container = <JoinVerification/>;
        break;
    case 'verifyResult':
        container = <JoinVerificationResult/>;
        break;
    case 'sso':
        container = <JoinSso/>;
        break;
    case 'info':
        container = <JoinInfo/>;
        break;
    case 'school':
        container = <JoinSchool/>;
        break;
    case 'teacher':
        container = <JoinTeacher/>;
        break;
    case 'complete':
        titleText = '가입완료'
        container = <JoinComplete/>;
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
    )
  }
}

export default JoinPage;
