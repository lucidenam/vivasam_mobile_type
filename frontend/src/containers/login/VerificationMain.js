import React, { Component,Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import queryString from 'query-string';
import PersonalIdentification from 'components/login/PersonalIdentification';
import {initializeGtag} from "../../store/modules/gtag";

class VerificationMain extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        memberId : '',
        query : {}
    }

    componentDidMount(){
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/verification/main',
            'page_title': '본인 인증｜비바샘'
        });

        if(this.props.logged) this.props.replace('/');

        const { history, location } = this.props;
        this.setState({
            query : queryString.parse(location.search)
        });
        let locationState = location.state;
        if(!locationState || typeof locationState === 'undefined') {
            history.go(-1);
        } else {
            this.setState({
                memberId: locationState.memberId
            });
        }
        
        this.update = this.update.bind(this);

    }
    
    update(uuid) {
        this.props.history.push({
            pathname: '/verification/result',
            search: '?uuid=' + uuid
        });
    }
    
    render() {
        const {memberId, query} = this.state;
        let isResult = query.uuid;
        let container = <PersonalIdentification callback={this.update} isJoin={false} memberId={memberId} />;
        

        return (
            <div id="pop_wrap">
                <div id="pop_header" className="pop_header">
                    <h1 className="header_tit">본인 인증</h1>
                    <div className="btnClose">
                        {/* <a href="#" className="btn_close"><span className="blind">팝업 닫기</span></a> */}
                    </div>
                </div>
                <section id="pop_content" className="renew07_certification">
                    {container}
                </section>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(VerificationMain));
