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
                    common.error("이미 신청하셨습니다.");
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
            <section className="event190304">
                <h1><img src="/images/events/2019/event190304/img01.jpg" alt="2019 비바샘 꿈지기 캠페인"/></h1>
                <div className="blind">
                    <p>학생들의 꿈을 응원하는 꿈지기 선생님, 비바샘이 학생들의 다채로운 꿈을 담은 단 하나의 ‘꿈 명함’ 을 만들어 드립니다. 오늘도 꿈을 위해 달려가고 있는 우리 반, 우리
                        동아리 학생들에게 꿈 명함을 선물하고 싶은 사연을 남겨주세요.</p>
                </div>

                <h2><img src="/images/events/2019/event190304/img02.jpg" alt=""/></h2>
                <div className="blind">
                    <dl>
                        <dt>캠페인 기간</dt>
                        <dd>2019. 3. 4(월) ~ 5. 30(목) *이전에 참여하신 선생님도 응모하실 수 있습니다.</dd>
                        <dt>당첨자 선정</dt>
                        <dd>매달 2회, 사연 10개씩 선정하여 공지사항을 통해 발표합니다.</dd>
                        <dt>발표 일정</dt>
                        <dd>3/15(금), 3/29(금), 4/15(월), 4/30(화), 5/15(수), 5/31(금)</dd>
                        <dt>캠페인 선물</dt>
                        <dd>학생 꿈 명함 제작 학생 1명 당 1개의 꿈 명함(1통)을 제작해 드립니다.</dd>
                        <dd>꿈지기 선물 꿈지기 캠페인 후기를 보내주신 선생님께 소정의 선물을 드립니다. 신세계 상품권 (5만원권)</dd>
                    </dl>
                    <h2>꿈지기 캠페인 참여 유의사항</h2>
                    <ul>
                        <li>학급, 동아리 등 50명 이내 그룹 단위로만 신청 가능합니다.</li>
                        <li>당첨된 꿈지기 선생님께 명함 제작에 필요한 학생 정보를 요청드립니다.</li>
                        <li>꿈 명함을 수령 후 후기 사진을 꼭 보내주세요.</li>
                    </ul>
                    <p>※ 꿈 명함 수령 후 학생들의 초상권 동의서를 꼭 보내주시기 바랍니다.</p>
                </div>

                <h2><img src="/images/events/2019/event190304/img03.jpg" alt="꿈 명함 제작 일정 안내"/></h2>
                <ol className="blind">
                    <li>당첨 안내</li>
                    <li>학생들의 꿈 정보 확인</li>
                    <li>꿈 명함 제작 완료</li>
                    <li>꿈 명함 도착</li>
                </ol>

                <div className="btn_apply_wrap">
                    <button
                        type="button"
                        id="eApply"
                        className="btn_apply"
                        onClick={this.eventApply}
                    >
                        <img src="/images/events/2019/event190304/btn_apply.png" alt="사연 등록하기"/>
                    </button>
                </div>

                <div className="cont">
                    <img src="/images/events/2019/event190304/img_info.jpg" alt="신청 시 유의사항"/>
                    <ul className="blind">
                        <li>정확하지 않은 주소로 인해 반송된 물품은 재발송되지 않으니 주소를 꼭 확인해주세요.</li>
                        <li>선물 발송에 필요한 정보(성명, 주소, 휴대전화번호 등)는 서비스 업체에 공유됩니다.</li>
                        <li>신청자 개인정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. (롯데글로벌로지스(주) - 사업자등록번호 : 102-81-23012)</li>
                    </ul>
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

