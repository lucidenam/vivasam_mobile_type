import React, {Component,Fragment} from 'react';
import './Event.css';
import * as api from 'lib/api';
import {debounce} from "lodash";
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common'
import {withRouter} from "react-router-dom";
import * as SaemteoActions from 'store/modules/saemteo';
import * as baseActions from 'store/modules/base';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import {bindActionCreators} from "redux";

class Event extends Component{

    validate = () => {
        return true;
    };

    constructor(props) {
        super(props);
        this.state = {
            eventApplyCheck : 0 // 0 : 신청 불가능 / 1 : 신청 가능
        };
    }

    // 이벤트 신청 검사
    eventApply = async (e) => {
        const { logged, history, BaseActions , event, eventId, handleClick } = this.props;
        if(!logged){ // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");

        }else{ // 로그인시
            try {
                event.eventId = e.currentTarget.value; // 이벤트 ID
                const response = await api.eventInfo(event.eventId);
                if(response.data.code === '3'){
                    common.error("이미 참여하셨습니다.");
                }else if(response.data.code === '0'){
                    handleClick(event.eventId);
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
            <section className="event191127">
                <h1><img src="images/events/2019/event191127/img.jpg" alt="역사, 말을 걸다" /></h1>
                <div className="blind">
                    <p>교과서 속 주인공과 대화를 해보세요.각 주인공의 질문에 의미 있는 의견을 남겨주신 분께 풍성한 선물을 드립니다.</p>
                    <dl>
                        <dt>신청기간</dt>
                        <dd>2019. 11. 27 ~ 2019. 12. 22 </dd>
                        <dt>당첨자 발표일</dt>
                        <dd>2019.12.23</dd>
                    </dl>
                </div>

                <div className="cont">
                    <img src="images/events/2019/event191127/img2.jpg" alt="" />
                    <p className="blind">안녕하세요, 저는 중학교 2학년이에요. 저는 세계 곳곳을 다니며 사진을 찍고 싶어요. 어디를 가면 좋을까요? - 스타벅스 카페라떼 (100명)</p>
                    <div className="btn_wrap left">
                        <button type="button" id="eApply" className="btn_apply" value="269" onClick={this.eventApply}>참여하기</button>
                    </div>
                    <p className="blind">우리의 역사를 떠오르게 하는 단어는 수백 가지가 넘는 것 같아요. 지금부터 저와 함께 역사 단어 끝말잇기를 해볼까요? 단군! - 보조배터리 (50명)</p>
                    <div className="btn_wrap right">
                        <button type="button" className="btn_apply" value="270" onClick={this.eventApply}>참여하기</button>
                    </div>
                </div>

                <div className="cont">
                    <img src="images/events/2019/event191127/img3.jpg" alt="" />
                    <p className="blind">안녕하세요. 친구들과 함께 조선에서 근대로 이어지는 역사를 책으로 엮어내려고 해요. 선생님께서 책 제목을 지어주실래요? - 문화상품권 5천원권 (50명)</p>
                    <div className="btn_wrap left">
                        <button type="button" className="btn_apply" value="271" onClick={this.eventApply}>참여하기</button>
                    </div>
                    <p className="blind">안녕하세요, 저는 격동의 시대를 살고 있는 청년입니다. 만일 선생님이 저의 친구라면, 지금 이 시대에, 무엇을 해보고 싶으신가요? - 메가박스 영화 예매권 2매 (30명)</p>
                    <div className="btn_wrap right">
                        <button type="button" className="btn_apply" value="272" onClick={this.eventApply}>참여하기</button>
                    </div>
                </div>

                <div className="cont">
                    <img src="images/events/2019/event191127/img4.jpg" alt="" />
                    <p className="blind">안녕하세요, 저희는 2000년대에 태어난 학생입니다.태풍 같은 10대에게 '역사'란 무엇일까요? - 배스킨라빈스 아이스크림 (100명)</p>
                    <div className="btn_wrap center">
                        <button type="button" className="btn_apply" value="273" onClick={this.eventApply}>참여하기</button>
                    </div>
                </div>

                <p className="blind">지금, PC로 비바샘에 방문하시면, ‘역사, 말을 걸다‘ 이벤트 참여 뿐 아니라 5명의 교과서 속 주인공을 만나보실 수 있습니다.</p>
                <a href="https://www.vivasam.com/mtextbook2015/main.do?schLvl=MS&deviceMode=pc" target="_blank"><img src="images/events/2019/event191127/bn.jpg" alt="2015 개정 교육과정 비상교육 역사, 한국사 교과서 자세히보기" /></a>

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
