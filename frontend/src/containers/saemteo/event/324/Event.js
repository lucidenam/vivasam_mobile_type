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

class Event extends Component {
    state = {
        courseData: [
            {id: 1, blindTxt: '회차: 1, 일정: 1.14(목) 10:00 ~ 14:00, 코스: 남산 구간 - 흥인지문 구간 - 낙산 구간(숭례문 - 남산 - 흥인지문 - 낙산공원 - 혜화문)', popNum: 1},
            {id: 2, blindTxt: '회차: 2, 일정: 1.15(금) 10:00 ~ 13:00, 코스: 백악 구간(혜화문 - 숙정문 - 윤동주 문학관 - 서촌)', popNum: 2},
            {id: 3, blindTxt: '회차: 3, 일정: 2.4(목) 10:00 ~ 14:00, 코스: 남산 구간 - 흥인지문 구간 - 낙산 구간(숭례문 - 남산 - 흥인지문 - 낙산공원 - 혜화문)', popNum: 1},
            {id: 4, blindTxt: '회차: 4, 일정: 2.5(금) 10:00 ~ 13:00, 코스: 백악 구간(혜화문 - 숙정문 - 윤동주 문학관 - 서촌)', popNum: 2},
        ],
        data: [
            {id: 1, courseTxt: '숭례문 ▶ 남산 ▶ 광화문(점심) ▶ 흥인지문 ▶ 낙산공원 ▶ 혜화문', timeTxt: '약 4시간 소요(휴게시간 포함)', locationTxt01: '숭례문', locationTxt02: '지하철 1,4호선, 공항철도, 경의중앙선 서울역 4번 출구/지하철 4호선 회현역 5번 출구', imgUrl: '/images/events/2020/event201210/map01.png', imgAlt: '출발: 숭례문 - 도착: 혜화문 지도', title:'남산'},
            {id: 2, courseTxt: '혜화문 ▶ 숙정문 ▶ 윤동주 문학관(점심) ▶ 서촌', timeTxt: '약 3시간 소요(휴게시간 포함)', locationTxt01: '혜화문', locationTxt02: '지하철 4호선 한성대입구역 5번 출구', imgUrl: '/images/events/2020/event201210/map02.png', imgAlt: '출발: 혜화문 - 도착: 서촌 지도', title:'백악'},
        ],
        newData: [],
        popOpen: false,
        isEventApply: false
    }

    constructor(props) {
        super(props);
    }

    componentDidMount = async() => {
        const { BaseActions, eventId } = this.props;
        BaseActions.openLoading();
        try{
            await this.eventApplyCheck();
        }catch(e){
            console.log(e);
            common.info(e.message);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

    };

    onPop = popNum => {
        console.log(popNum)
        const { data, popOpen } = this.state
        this.setState({
            newData: data.filter( item => item.id  === popNum),
            popOpen: !popOpen
        })
    }

    onPopClose = () => {
        this.setState({
            newData: [],
            popOpen: false
        })
    }

    eventApplyCheck = async() => {
        const { logged, eventId, event } = this.props;
        if(logged){
            event.eventId = eventId; // 이벤트 ID
            const response = await api.eventInfo(eventId);
            if(response.data.code === '3'){
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    // 이벤트 신청 검사
    eventApply = async () => {
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
                common.info("교사 인증 후 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
            
            // 로그인시
            try {
                if(this.state.isEventApply){
                    common.error("이미 신청하셨습니다.");
                }else{
                    handleClick(eventId);
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
        const { courseData, newData, popOpen } = this.state
        return (
            <section className="event201210">
                <div className="evtCont01">
                    <h1><img src="/images/events/2020/event201210/img01.jpg" alt="재우쌤과 함께하는 한양도성 순성 놀이" /></h1>
                    <div className="blind">
                        <p>창의 여행 전문가 김재우 선생님과 함께 한양도성을 차근차근 걸으며, 역사 속 인물을 만나는 여행을 떠나보세요.<br />걷기 좋아하는 비바샘 선생님이라면 누구나 신청 가능합니다.</p>
                    </div>
                </div>
                <div className="evtCont02">
                    <div className="imgWrap"><img src="/images/events/2020/event201210/img02.jpg" alt="" /></div>
                    <div className="blind">
                        <strong>순성놀이 파트너 김재우 교사</strong>
                        <ul>
                            <li>- 現 문헌중학교 국어 교사</li>
                            <li>- 여행작가</li>
                            <li>- 비바샘 &lt;재우쌤의 창의 여행&gt; 콘텐츠 저자</li>
                        </ul>
                        <h2>신청 안내</h2>
                        <ul>
                            <li>신청기간: 2020.12.10~2020.12.23</li>
                            <li>당첨자 발표: 2020.12.28</li>
                            <li>모집인원: 회차당 15명</li>
                            <li>참가비: 5천원 (참가비는 소외계층 교육을 위한 학생복지기금으로 전액 기부됩니다.)</li>
                        </ul>
                    </div>
                </div>
                <div className="evtCont03">
                    <div className="imgWrap"><img src="/images/events/2020/event201210/img03.jpg" alt="" /></div>
                    <h2 className="blind">순성놀이 개요</h2>
                    <ul>
                        {
                            courseData.map( (item, idx) => {
                                return (
                                    <li key={`course${idx+1}`}>
                                        <p className="blind">{ item.blindTxt }</p>
                                        <button type="button" className="btnCourse" onClick={ () => this.onPop(item.popNum) }><span className="blind">{ idx+1 }회차 코스보기</span></button>
                                    </li>
                                )
                            })

                        }
                    </ul>
                    <ul class="blind">
							<li>- 각각 다른 코스로 최대 2회 신청 가능합니다. (예: 1.14(목), 2.5(금) 신청)</li>
							<li>- 일정에는 휴게시간이 포함되어 있습니다.</li>
							<li>- 당첨 후에는 회차 변경이 불가능하며, 최소자가 생길 경우 추가 선정하여 개발 연락 드립니다.</li>
						</ul>
                </div>
                <div className="evtCont04">
                    <div className="imgWrap"><img src="/images/events/2020/event201210/img04.jpg" alt="유의사항" /></div>
                    <ul className="blind">
                        <li>한양도성 순성 놀이는 <strong>일부 산행을 동반한 트래킹 활동</strong>입니다. 코스 상세보기에서 반드시 해당 구간을 확인해주세요.</li>
                        <li>당일<strong> 날씨 및 노면 상황에 따라 코스가 변경</strong>될 수 있으며, 활동 시간도 조율될 수 있습니다.</li>
                        <li><strong>코로나19</strong>로 사회적 거리 두기 단계가 격상될 시에는 행사가 취소될 수 있습니다.</li>
                        <li>다른 선생님께 당첨 기회를 양도하실 수 없으며, 동반인 동행은 불가능입니다.</li>
                        <li>한정된 인원으로 진행되므로 당일 참석 가능 여부를 꼭 확인해주세요.</li>
                    </ul>
                    <div className="btnWrap">
						<button type="button" onClick={ this.eventApply }><img src="/images/events/2020/event201210/btn_apply.png" alt="신청하기" /></button>
					</div>
                </div>
                {
                    // 팝업
                    popOpen && newData.map( (item, idx) => {
                                    return (
                                        <div key={`evtPop${idx}`} className="evtPop">
                                            <div className="evtPopHeader">
                                                <h2>{ item.title } 구간 코스 상세 안내</h2>
                                                <button type="button" class="evtPopClose" onClick={ this.onPopClose }><span className="blind">팝업 닫기</span></button>
                                            </div>
                                            <div className="evtPopCont">
                                                <div className="courseBox">
                                                    <ul>
                                                        <li>
                                                            <strong className="txtBold">&middot; 코스 안내</strong>
                                                            <br/>
                                                            <div className="txtBold">{ item.courseTxt }</div>
                                                        </li>
                                                        <li>
                                                            <span className="txtBold">&middot; 소요 시간</span>
                                                            <div>{ item.timeTxt }</div>
                                                        </li>
                                                        <li>
                                                            <span className="txtBold">&middot; 집합 장소</span>
                                                            <div>
                                                                <span className="txtBold">{ `[${item.locationTxt01}]` }</span>
                                                                <span className="txtPush">{ item.locationTxt02 }</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="imgWrap"><img src={ item.imgUrl } alt={ item.imgAlt } /></div>
                                            </div>
                                        </div>
                                    )
                    })
                    
                }

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