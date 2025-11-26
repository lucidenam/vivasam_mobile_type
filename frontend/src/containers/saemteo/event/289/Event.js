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

    // 이벤트 신청 검사
    eventApply = async () => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
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
    };

    render () {

        return (
            <section className="event200519">
                <h1><img src="/images/events/2020/event200519/img01.png" alt="2020 비바샘 꿈지기 캠페인"/></h1>
                <div className="blind">
                    <p>학생들의 꿈을 응원하는 꿈지기 선생님, 비바샘이 학생들의 다채로운 꿈을 담은 단 하나의 ‘꿈 명함’ 을 만들어 드립니다. 오늘도 꿈을 위해 달려가고 있는 우리 반, 우리
                        동아리 학생들에게 꿈 명함을 선물하고 싶은 사연을 남겨주세요.</p>
                </div>

                <h2><img src="/images/events/2020/event200519/img02.png" alt="캠페인 안내"/></h2>
                <div className="blind">
                    <dl>
                        <dt>캠페인 기간</dt>
                        <dd>2020. 6. 2(화) ~ 10. 30(토)</dd>
                        <dt>당첨자 발표</dt>
                        <dd>매달 2회, 사연 10개씩 선정하여 공지사항을 통해 발표합니다.</dd>
                        <dd>* 6.15(월) / 6.30(화) / 7.15(수) / 7.31(금) / 8.14(금) / 8.28(금) / 9.11(금) / 9.25(금) / 10.15(목) / 11.2(월)</dd>
                        <dt>당첨자 경품</dt>
                        <dd>학생 꿈 명함 제작 학생 1명 당 1개의 꿈 명함(1통)을 제작해 드립니다.</dd>
                        <dd>꿈지기 선물 꿈지기 캠페인 후기를 보내주신 선생님께 소정의 선물을 드립니다.</dd>
                    </dl>
                </div>

                <h3><img src="/images/events/2020/event200519/img03.png" alt="꿈지기 캠페인 참여 유의사항" />
                    <a href="https://www.vivasam.com/event/dreamMate/dream2020Part.do?deviceMode=pc"><span className="blind">꿈지기 생생후기</span></a>
                </h3>
                <div className="blind">
                    <ul>
                        <li>학급, 동아리 등 50명 이내 그룹 단위로만 신청 가능합니다.</li>
                        <li>당첨되신 분께 꿈 명함 제작을 위한 정보를 요청드립니다.</li>
                        <li>꿈 명함을 수령 후 반드시 후기 사진을 꼭 보내주세요.</li>
                        <li>꿈지기 생생후기 게시판에 후기 사진 게재를 위하여 학생들의 초상권 동의서를 수급합니다.</li>
                    </ul>
                </div>

                <h2><img src="/images/events/2020/event200519/img04.png" alt="꿈 명함 제작 일정 안내"/></h2>
                <div className="blind">
                    <ol>
                        <li>당첨 안내 (1주 소요)</li>
                        <li>학생들의 꿈 정보 확인 (3주 소요)</li>
                        <li>꿈 명함 제작 완료 (3일 소요)</li>
                        <li>꿈 명함 도착 (1주)</li>
                        <li>캠페인 후기 수급</li>
                    </ol>
                    <p>
                        <strong>* (가칭) 꿈지기 모꼬지</strong><br/>
                        꿈지기 선생님이 한자리에 모이는 '2020 꿈지기 모꼬지' 행사가 연말에 준비될 예정입니다.<br/>
                        당첨자를 포함하여 꿈지기 캠페인에 사연을 신청해주신 선생님 들 중 100분을 선정하여 진행됩니다. 자세한 안내 사항은 행사를 준비하며 개별 안내 드립니다.
                    </p>

                </div>

                <div className="btn_apply_wrap">
                    <button type="button" id="eApply" className="btn_apply" onClick={this.eventApply} >
                        <img src="/images/events/2020/event200519/btn_apply.png" alt="캠페인 참여하기"/>
                    </button>
                </div>
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

