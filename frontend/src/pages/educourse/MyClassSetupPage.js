import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {connect} from 'react-redux';
import PageTemplate from 'components/page/PageTemplate';
/* import {MyClassSetupContainer} from 'containers/educourse'; */
import { MyTextBookSetup} from 'containers/educourse';

class MyClassSetupPage extends Component {
    componentDidMount() {
        const { logged, history, location, loginInfo } = this.props;
        const schoolLvlCd = loginInfo.schoolLvlCd;
        if(!logged) {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        }
        if (schoolLvlCd != 'ES' && schoolLvlCd != 'MS' && schoolLvlCd != 'HS') {
            alert('초중고 학교 선생님만 설정이 가능합니다. 회원정보수정 페이지에서 소속을 수정하시거나, 소속 변경이 안되시면 고객센터로 문의바랍니다.');
            history.push('/');
        }
    }

    render() {
        const { logged, match} = this.props;
        if(!logged) return false;

        return (
            <PageTemplate title="내 교과서">
                {/* <MyClassSetupContainer tab={match.params.name ? match.params.name : "class"}/> */}
                <MyTextBookSetup/>
            </PageTemplate>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    })
)(withRouter(MyClassSetupPage));
