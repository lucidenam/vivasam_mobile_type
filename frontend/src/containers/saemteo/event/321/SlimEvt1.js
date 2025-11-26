import React, {Component} from 'react';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import $ from 'jquery';

class SlimEvt1 extends Component {
    state = {
        slimCode: ['', '', ''],
        slimClass: ['','','']
    }

    onChange = (idx, e) => {
        const { logged, history, BaseActions, loginInfo, onNextStep} = this.props;
        const { data } = this.state;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else {
            // 준회원일 경우 신청 안됨.
            if (loginInfo.mLevel != 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 이벤트 처리
            let val = e.target.value;
            let slimCode = this.state.slimCode;
            let slimClass = this.state.slimClass;
            if(val.trim() != ''){
                slimCode[idx] = val;
                slimClass[idx] = 'on';
                $('#slimCode'+(idx+1)).focus();
            }else{
                slimCode[idx] = val;
                slimClass[idx] = '';
            }

            this.setState({slimCode: slimCode});
            this.setState({slimClass: slimClass});

            // 3개 다 입력 햇는지 체크
            let isEnd = true;
            // 정답인지 체크
            let isSuccess = true;
            slimCode.map( (item, idx) => {
                if(item === ''){
                    isEnd = false;
                }
                if(idx == 0){
                    if(item != '1'){
                        isSuccess = false;
                    }
                }else if(idx == 1){
                    if(item != '7'){
                        isSuccess = false;
                    }
                }else if(idx == 2){
                    if(item != '6'){
                        isSuccess = false;
                    }
                }
            });

            // 3개 다 입력한 경우 정답 체크
            if(isEnd){
                if(isSuccess){
                    setTimeout(()=>{
                        // 화면전환
                        onNextStep();
                    }, 100);//의도적 지연.
                }else{
                    setTimeout(()=>{
                        common.info('힌트를 확인해 주세요.');
                        $('#slimCode0').focus();
                    }, 100);//의도적 지연.
                }
            }
        }
    }

    render() {
        const { onTabClick } = this.props;
        return (
            <div className="slimEvt1">
                <h2><img src="/images/events/2020/event201207/slim_evt01.png" alt="고등 수학 선생님을 위한 슬림 이벤트" /></h2>
                <span className="blind">이벤트 기간: 2020.12.07 ~ 12.31</span>
                <div className="inner">
                    <div className="borderBox evtCodeWrap">
                        <p><img src="/images/events/2020/event201207/slim_notice01.png" alt="이벤트에 참여하시려면 슬림 코드를 입력하세요." /></p>
                        <div className="inputWrap">
                            <span className={'input '+this.state.slimClass[0]}><input id="slimCode0" type="number" maxLength={1} onChange={ this.onChange.bind(this, 0) } value={this.state.slimCode[0]}/></span>
                            <span className={'input '+this.state.slimClass[1]}><input id="slimCode1" type="number" maxLength={1} onChange={ this.onChange.bind(this, 1) } value={this.state.slimCode[1]}/></span>
                            <span className={'input '+this.state.slimClass[2]}><input id="slimCode2" type="number" maxLength={1} onChange={ this.onChange.bind(this, 2) } value={this.state.slimCode[2]}/></span>
                        </div>
                    </div>
                    <div className="slimEvtTxt">
                        <p>비상교육 슬림한 기본 수학<br /><em className="borderB">교과서 본문은 총 몇페이지</em>일까요?</p>
                        <button onClick={() => onTabClick(1)}> <img src="/images/events/2020/event201207/btn_hint01.png" alt="힌트보기" /></button>{/* a링크 기본 수학 특장점 탭으로 변경  */}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(SlimEvt1));