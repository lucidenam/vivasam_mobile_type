import React, {Component} from 'react';
import PageTemplate from 'components/page/PageTemplate';
import VerificationMain from 'containers/login/VerificationMain';
import VerificationResult from 'containers/login/VerificationResult';
import NotFoundPage from 'pages/NotFoundPage';
import {FooterCopyright} from "../../components/page";

class VerificationPage extends Component{
  render () {
    let isHidden = true;
    let titleText = '본인 인증';
    let clazz = 'hasFooter';
    let container;
    switch (this.props.match.params.name) {
    case 'main':
        container = <VerificationMain/>;
        break;
    case 'result':
        titleText = '본인 인증 완료';
        container = <VerificationResult/>;
        break;
    default :
        container = <NotFoundPage/>;
    }

    return (
        <PageTemplate title={titleText} isHidden={isHidden} clazz={clazz}>
          <div className="hasFooterWrap">
            {container}
            <FooterCopyright handleLogin={this.handleLogin}/>
          </div>
        </PageTemplate>
    )
  }
}

export default VerificationPage;
