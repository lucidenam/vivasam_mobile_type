import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PersonalIdentification from 'components/login/PersonalIdentification';
import {initializeGtag} from "../../store/modules/gtag";

class JoinVerification extends Component {

    constructor(props) {
      super(props);
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/join/verify',
            'page_title': '본인 인증 | 회원가입｜비바샘'
        });
        const { type, agree, check, history } = this.props;
        
        if(!type.isSelected) {
            history.replace('/join/select');
        }
        if ((!type.ssoMember && (!agree.service || !agree.privacy))
            || (type.ssoMember && (!agree.special || !agree.service || !agree.privacy || !agree.tschService || !agree.tschPrivacy ))) {
            history.replace('/join/agree');
        }
        // if(!check.userName || !check.email || !check.cellphone) {
        //     history.go('/join/check');
        // }

        this.update = this.update.bind(this);        
    }

    
    update(uuid) {
        this.props.history.push({
            pathname: '/join/verifyResult',
            search: '?uuid=' + uuid
        });
    }


    render() {
        
        
        let container = <PersonalIdentification callback={this.update} isJoin={true} />;
        

        return (
            <Fragment>
                <div id="sticky" className="step_wrap">
                    <h2 className="step_tit">본인 인증</h2>
                    <div className="step_num_box">
                        <span className="step_num">1</span>
                        <span className="step_num active"><span className="blind">현재페이지</span>2</span>
                        <span className="step_num">3</span>
                    </div>
                </div>
                <section className="join">
                    {container}
                </section>
            </Fragment>
        );
    }
}

export default connect(
  (state) => ({
    type : state.join.get('type').toJS(),
    agree : state.join.get('agree').toJS(),
    check : state.join.get('check').toJS(),
    info : state.join.get('info').toJS()
  }),
  (dispatch) => ({
    JoinActions: bindActionCreators(joinActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(JoinVerification));
