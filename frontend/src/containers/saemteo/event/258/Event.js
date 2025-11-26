import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            agreeCheck : 0 // 개인정보 체크
        };
    }

    // 개인정보 수정하기 이동
    // 내 주소 / 연락처 확인
    reApplyClick = (e) => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{
            history.push("/myInfo");
        }
    };


    // 개인정보 선택
    updateAgreeCheckChange = () => {
        const { logged, loginInfo , history, BaseActions } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        }else{
            this.setState({
                agreeCheck:!this.state.agreeCheck
            });
        }
    };

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{
            // 로그인시
            // 개인정보 약관 체크
            if(this.state.agreeCheck == 0){
                common.info("개인정보 수집 및 이용에 동의해 주세요.");
                return;
            }else{
                try {
                    event.eventId = eventId; // 이벤트 ID
                    const response = await api.eventInfo(eventId);
                    if(response.data.code === '3'){
                        common.error("이미 참여하셨습니다.");
                    }else if(response.data.code === '0'){
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
        }
    };

    render () {

        return (
            <section className="event190823">
                <h1><img src="images/events/2019/event190823/img.png" alt="비상교육 초등 미술 5~6 교과서를 보내드립니다."/></h1>
                <div className="blind">
                    <p>체계적인 학습 내용과 참신한 활동으로 좋은 평가를 받았던 비상교육 초등 미술 3~4 교과서!<br /><br />2019년 8월,<br />창의적인 융합 수업 자료와 다채로운 활동 자료로 새롭게 개발된 비상교육 초등 미술 5~6 교과서를 만나보실 수 있습니다.</p>
                </div>

                <div>
                    <img src="images/events/2019/event190823/img2.png" alt=""/>
                    <div className="blind">
                        <strong>비상교육 초등 미술 3~4 교과서 + 5~6 교과서를 연계하면 이런 점이 좋습니다.</strong>
                        <ul>
                            <li>3~4학년 미술 교과서의 활동 수준과 학습 위계를 고려하여 5~6학년 미술 교과서를 개발하여 학습의 중복 없이 보다 체계적인 미술 학습을 할 수 있습니다.</li>
                            <li>미술의 다양한 생활 속 예시를 최신 자료, 만화, 게임 등의 자료로 흥미 있게 제시하여 학습의 이해를 높이고 학습 동기를 유발할 수 있습니다.</li>
                            <li>특수 용지를 포함한 다양한 활동지를 교과서에 수록하여 수업 부담을 줄였으며, 선생님용 추가 활동지를 지도서에 추가하여 현장성을 높였습니다. </li>
                            <li>비바샘 사이트를 통해 실시간 업데이트되는 풍성한 수업 자료를 무료로 이용하실 수 있습니다. 단원별 멀티미디어 자료, 작품 설명, 누리집을 클릭 한 번으로 편리하게 확인할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>

                <div className="cont_wrap">
                    <div className="btn_wrap">
                        <ul>
                            <li><a href="https://dn.vivasam.com/VS/2020textbook/E_art%2056_text/index.html" target="_blank"><img src="images/events/2019/event190823/btn_book.png" alt="교과서 미리보기" /></a></li>
                            <li><a href="https://dn.vivasam.com/VS/2020textbook/E_art%2056_guide/index.html" target="_blank"><img src="images/events/2019/event190823/btn_guide.png" alt="지도서 미리보기" /></a></li>
                            <li><a href="https://www.vivasam.com/mtextbook2015/detail.do?BIDX=E_07&deviceMode=pc" target="_blank"><img src="images/events/2019/event190823/btn_detail.png" alt="미술 5~6 수업 지원 자료 자세히 보기" /></a></li>
                        </ul>
                    </div>

                    <dl className="agree_info">
                        <dt>개인정보 수집 및 이용 동의</dt>
                        <dd>
                            <ul>
                                <li>- 이용목적 : 비바샘 가입 및 경품 배송, 고객문의 응대</li>
                                <li>- 수집하는 개인정보 : 성명, 휴대전화번호, 재직학교 정보</li>
                                <li>- 개인정보 보유 및 이용기간 : 2019년 10월 31일까지 (이용목적 달성 시 즉시 파기)</li>
                                <li>- 주소 및 연락처 기재 오류로 반송된 도서는 재발송되지 않습니다. 개인 정보를 꼭 확인해주세요.<br /><a onClick={this.reApplyClick}>내 주소/연락처 확인▶</a></li>
                                <li>- 1인 1회 참여 가능합니다.</li>
                                <li>- 당첨자 개인정보(성명/휴대전화번호/주소)는 배송 업체에 공유됩니다.<br />(㈜한진 사업자등록번호 : 201-81-02823)</li>
                            </ul>
                        </dd>
                    </dl>
                    <p className="agree">
                        <input
                            type="checkbox"
                            id="infoCheck01"
                            value=""
                            className="checkbox"
                            checked={this.state.agreeCheck == 1}
                            onChange={this.updateAgreeCheckChange}
                        /><label htmlFor="infoCheck01"><span>본인은 개인정보 수집 및 이용에 동의합니다.</span></label>
                    </p>
                </div>

                <button
                    type="button"
                    className="btn_full_on"
                    onClick={this.eventApply}
                    >신청하기
                </button>
            </section>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event : state.saemteo.get('event').toJS()
    }),
    (dispatch) => ({
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));
//export default MiddleClassAppraisalListContainer;

