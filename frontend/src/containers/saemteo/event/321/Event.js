import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import EvtTab1 from './EvtTab1';
import EvtTab2 from './EvtTab2';
import EvtTab3 from './EvtTab3';
import EvtTab4 from './EvtTab4';
import Link from 'react-router-dom/Link';
import $ from 'jquery';

class Event extends Component {
    state = {
        tabArr: ['왜 슬림한\n교과서인가?', '기본 수학\n특장점', '수업\n지원 자료', '슬림★\n이벤트'],
        onIdx: 0,
    }

    componentDidMount() {
        const { tabId } = this.props
        if(tabId > 0){
            this.setState({onIdx: tabId-1});
        }
    }

    onTabClick = idx => {
        let today = new Date();
        let chkStartDate1 = new Date(2021, 0, 1, 0);

        if(today.getTime() >= chkStartDate1.getTime()){
            if(idx === 3){
                common.info('이벤트가 종료 되었습니다.');
            }else{
                this.setState({
                    onIdx: idx
                })
                if(idx === 1){
                    // 포커싱
                    setTimeout(()=>{
                        $('html, body').animate({scrollTop : 530}, 1);
                    }, 100);//의도적 지연.
                }
            }
        }else{
            this.setState({
                onIdx: idx
            })
            if(idx === 1){
                // 포커싱
                setTimeout(()=>{
                    $('html, body').animate({scrollTop : 530}, 1);
                }, 100);//의도적 지연.
            }
        }
    }

    // 이벤트 신청 검사
    eventApply = async (contents, e) => {
        const { logged, history, BaseActions, SaemteoActions , event, eventId, handleClick, eventAnswer, loginInfo} = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }

            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 로그인시
            try {
                event.eventId = eventId; // 이벤트 ID
                const response = await api.eventInfo(eventId);
                if(response.data.code === '3'){
                    common.error("이미 참여하셨습니다.");
                    return false;
                }else if(response.data.code === '0') {
                    // 입력값 확인
                    let selContents = {};
                    let selContentCnt = 0;
                    for(let i=0; i<contents.length; i++){
                        if(contents[i].isSelect){
                            selContents[selContentCnt++] = contents[i].title;
                        }
                    }

                    if(selContentCnt != 2){
                        common.error("장점 2개를 선택해 주세요.");
                        return false;
                    }

                    // Store에 전송하기 위한 AnswerContents Push 후 Event 전송
                    let eventAnswerArray = {};
                    eventAnswerArray.selContents = selContents;
                    eventAnswer.eventAnswerContent = eventAnswerArray;
                    SaemteoActions.pushValues({type:"eventAnswer", object:eventAnswer});
                    handleClick(eventId);
                }else{
                    common.error("신청이 정상적으로 처리되지 못하였습니다.");
                }
            } catch (e) {
                console.log(e);
            }finally {
                setTimeout(()=>{
                }, 1000);//의도적 지연.
            }
        }
    };

    render() {
        const { tabArr, onIdx } = this.state;
        const obj = {
            0: <EvtTab1 />,
            1: <EvtTab2 />,
            2: <EvtTab3 />,
            3: <EvtTab4 onTabClick={this.onTabClick} eventApply={this.eventApply}/>
        };

        return (
            <section className="event201207">
                <div className="evtTitWrap">
                    <h1><img src="/images/events/2020/event201207/img01.png" alt="‘가장 슬림한 수학 교과서’ 비상교육 고등 기본 수학" /></h1>
                    <a href="https://dn.vivasam.com/VS/EBOOK/고등기본수학MW/index.html" target="_blank" title="새창열림" className="btnPreview"><img src="/images/events/2020/event201207/btn_preview.png" alt="미리보기" /></a>
                </div>
                <div className="evtTabWrap">
                    <div className="btnTabWrap">
                        {
                            /* <Link to={}> 탭 링크로 변경 */
                            tabArr.map( (item, idx) => {
                                return (
                                    <Link to={`/saemteo/event/view/321/${idx+1}`} key={`btnTab${idx}`} className={`btnTab${idx === onIdx ? ' on' : ''}`} onClick={ () => this.onTabClick(idx) }>{ item }</Link>
                                )
                            })
                        }
                    </div>
                    <div className="tabContWrap">
                        {
                            this.state.onIdx == 3
                                ? this.onTabClick(0)
                                : obj[this.state.onIdx]
                        }
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));