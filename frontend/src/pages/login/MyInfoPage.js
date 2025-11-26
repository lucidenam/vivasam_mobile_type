import React, {Component} from 'react';
import PageTemplate from 'components/page/PageTemplate';
import MyInfoContainer from 'containers/login/MyInfoContainer';
import TabMenuContainer from 'containers/menu/TabMenuContainer';
import {connect} from "react-redux";
import { withRouter } from 'react-router-dom';

class MyInfoPage extends Component{
    render () {
        const { ssoLoginMode, history } = this.props;
        if (!ssoLoginMode) {
            alert("죄송합니다.\n\n" + "현재 시스템 안정화 작업 중이며\n" + "빠른 작업으로 서비스 이용에 차질 없도록 하겠습니다.\n" + "감사합니다.");
            history.push("/");
        }
        let tabName;
        switch (this.props.match.params.name) {
        case 'password':
            tabName = 'password';
            break;
        default :
            tabName = 'myInfo';
        }
        return (
            <PageTemplate title='회원정보 수정' disableSticky={true}>
                <TabMenuContainer tabName={tabName}/>
                <MyInfoContainer tabName={this.props.match.params.name}/>
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
)(withRouter(MyInfoPage));
