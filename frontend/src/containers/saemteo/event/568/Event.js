import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import Slider from "react-slick";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import {FooterCopyright} from "../../../../components/page";
import {maskingStr} from "../../../../lib/StringUtils";

const PAGE_SIZE = 6;

class Event extends Component {

    state = {
        eventId: 568,
        isEventApply: false,    // 신청여부
        imgId:'',
        isShowDetail:false,
        popupClass:'',
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/568',
        choosedItems: {
            video: '',
            image: '',
            music: '',
            sam : ''
        },
        popularCnt:[],
        isPlayings:[false, false, false, false, false, false],
        playingClass:['', '', '', '', '', ''],
        isPlaying: false,
        audio: null,
        currentAudioUrl: null,
        eventAnswerContents: [],	// 이벤트 참여내용
        eventAnswerLeaveCnt: 0, // 남은 댓글 수
        pageNo: 1, 				    // 페이지
        pageSize: PAGE_SIZE, 		// 한 페이지에 들어갈 댓글 수
    };

    handleChange = (e) => {
        const {event, SaemteoActions} = this.props;

        if (e.target.name === 'agree') {
            event[e.target.name] = e.target.checked;
        } else {
            event[e.target.name] = e.target.value;
        }

        SaemteoActions.pushValues({type: "event", object: event});
    };

    handleLogin = (e) => {
        e.preventDefault();
        const {BaseActions, logged, history} = this.props;
        if (logged) {
            //로그아웃처리
            BaseActions.logout();
            history.push("/");
        } else {
            //로그인 화면으로 이동
            history.push("/login");
        }
    }

    componentDidMount = async () => {
        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();
            await this.checkEventCount();
            await this.commentConstructorList();	// 이벤트 댓글 목록 조회
        } catch (e) {
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    };

    // 이벤트 참여자수 확인
    checkEventCount = async () => {
        const {SaemteoActions, eventId} = this.props;
        const params = {
            eventId: 568,
            eventAnswerSeq: 2,
            answerIndex: 1
        };
        let response2 = await api.getSpecificEventAnswerCount(params);
        this.setState({
            eventAnswerCount: response2.data.eventAnswerCount
        });
    };

    // 댓글 출력
    commentConstructorList = async () => {
        const {pageNo, pageSize, eventId, eventAnswerCount} = this.state;

        const params = {
            eventId: eventId,
            eventAnswerSeq: 2,
            answerPage: {
                pageNo: pageNo,
                pageSize: pageSize
            }
        };

        const responseList = await api.getSpecificEventAnswerList(params);
        let eventJoinAnswerList = responseList.data.eventJoinAnswerList;

        // 최초 조회시 전체건수가 6건이상이면 더보기 버튼 표시
        if(eventAnswerCount > PAGE_SIZE){
            this.setState({
                eventViewAddButton : 1
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        // 전체 갯수가 마지막 조회건수보다 작으면 더보기 버튼 숨김
        if(this.state.eventAnswerCount <= this.state.pageSize) {
            this.setState({
                eventViewAddButton: 0
            });
        }

        this.setState({
            eventAnswerContents : eventJoinAnswerList,
            pageSize : this.state.pageSize + PAGE_SIZE,
            eventAnswerLeaveCnt : eventAnswerCount - eventJoinAnswerList.length,
        });
    };

    eventApplyCheck = async () => {
        const {logged, eventId, event} = this.props;
        if (logged) {
            const response = await api.chkEventJoin({eventId});
            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    prerequisite = (e) => {
        const {logged, history, BaseActions, SaemteoActions, eventId, handleClick, loginInfo} = this.props;
        const {isEventApply} = this.state;

        if (!logged) {
            // 미로그인시
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }

        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }

        // 준회원일 경우 신청 안됨.
        if (loginInfo.mLevel !== 'AU300') {
            common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
            return false;
        }

        return true;
    };

    // 댓글 더보기
    commentListAddAction = () => {
        this.commentConstructorList(); // 댓글 목록 갱신
    };

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async (e) => {
        const {event,loginInfo, SaemteoActions, eventId, handleClick} = this.props;
        const {isEventApply, choosedItems} = this.state;

        if (!this.prerequisite(e)) {
            return false;
        }

        const {sam} = choosedItems;
        if (!sam) {
            common.info("선생님의 원픽을 선택해 주세요.");
            return false;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        try {
            const eventAnswer = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eduArr: this.state.choosedItems.sam
            }
            SaemteoActions.pushValues({type: "eventAnswer", object: eventAnswer});
            handleClick(eventId);
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    insertApplyForm = async () => {
        const {loginInfo, SaemteoActions, handleClick, BaseActions, MyclassActions, eventId} = this.props;

        try {
            BaseActions.openLoading();

            const eventAnswerDesc2 = this.state.choosedItems.sam;

            var params = {
                eventId: eventId,
                memberId: loginInfo.memberId,
                eventAnswerDesc: eventAnswerDesc2
            };

            SaemteoActions.pushValues({type: "eventAnswer", object: params});
            handleClick(eventId);
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    detailPop = (type, item, claz) => {
        const {isShowDetail, imgId, isPlayings} = this.state;

        if (type == "video") {
            const videoUrl = item;
            this.handlePreviewClick(videoUrl);
        }

        if(type == "img"){
            this.setState({
                isShowDetail:true,
                imgId:item,
                popupClass: claz == '' ? '' : claz
            });
        }
    };

    // 비디오
    handlePreviewClick = async (videoUrl) => {
        const {history,eventId,SaemteoActions} = this.props;
        const pathUrl = '/saemteo/event/preview/'+ eventId +'/EventDetail';
        let test = {url : videoUrl};
        SaemteoActions.pushValues({type:"eventAnswer", object:test});
        history.push(pathUrl);
    }

    // 음원
    audioControls = (tar, idx) => {
        const { isPlayings } = this.state

        if(isPlayings[idx - 1]){
            tar.pause();
            this.updateElement(idx);
        }else{
            tar.play();
            this.updateElement(idx);

        }
    }
    updateElement = (idx) => {
        this.setState((prevState) => {
            const newPlaying = [...prevState.isPlayings];
            const newPlayingClass = [...prevState.playingClass];

            newPlaying[idx - 1] = newPlaying[idx - 1] == true ? false : true;
            newPlayingClass[idx - 1] = newPlayingClass[idx - 1] == '' ? 'playing' : '';

            return {isPlayings: newPlaying, playingClass: newPlayingClass};
        });
    }

    choosedItems = (e) => {
        if (!this.prerequisite(e)) {
            e.target.checked = false;
            return false;
        }

        const {name, value} = e.target;
        this.setState(prevState => ({
            choosedItems: {
                ...prevState.choosedItems,
                [name]: value,
            }
        }), () => {
        });
    };

    detailPopHide = () => {
        const {isShowDetail} = this.state;
        this.setState({
            isShowDetail:false,
        });
    }

    render () {
        const {eventAnswerContents,imgId, isShowDetail, popupClass, eventViewAddButton, eventAnswerLeaveCnt} = this.state;
        const eventApplyAnswerList = eventAnswerContents.map((eventList, index) =>
            <EventListApply {...eventList} key={eventList.event_answer_id}/>
        );
        
        //slick option 설정
        const settings = {
            autoplay: true,
            autoplaySpeed: 0,
            speed: 5000,
            cssEase: 'linear',
            slidesToShow: 4,
            slidesToScroll: 1,
            arrows: false,
            className: 'evtSwiper'
        };

        return (
            <section className="event250625">
                <div className="evtTitWrap">
                    <h1><img src="/images/events/2025/event250625/img1.jpg" alt="선생님의 비바샘 원픽은? 이벤트"/></h1>
                    <div className="blind">
                        <p>비바샘X상상그리다필름</p>
                        <p>영상 ON AIR 프로젝트 4</p>
                        <h2>선생님의 ONE PICK은?</h2>
                        <p>선생님 “비바샘”하면 뭐가 떠오르세요? 교과서 수업 자료? 선생님 전용 프로모션? 귀염뽀짝 비버샘? 비바샘의 다양한 서비스를 영상으로 살펴보고 선생님의 비바샘 원픽을 골라주세요!</p>
                        <ul>
                            <li>이벤트 기간 : 6월 25일(수)~7월 15일(화)</li>
                            <li>당첨자 발표 : 7월 18일(금)</li>
                        </ul>
                    </div>

                    <div className="evtItemWrap">
                        <Slider {...settings}>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/DwuTBmmYBbQ?si=fQh9iznI2_nizGj0', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb01.png" alt="비바샘의 영혼의 단짝 비상교과서" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/mwrze2PjJSo?si=FXPE3dawsa2V1G0L', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb02.png" alt="AI 디지털 수업 메이트 비상 AI 디지털교과서" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/MNUjs-MZge0?si=t28tYuNyX2mbbuWE', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb03.png" alt="수업 고민 해결 교과 자료" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/opnFk3apIxI?si=kl7-hQ5Q3V4S0B1O', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb04.png" alt="스마트한 수업의 비밀 에듀테크 테마관" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/tT5bghZ1m4M?si=ALpYrAgI2BQ6_hW4', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb05.png" alt="주제별 창의 융합 수업 자료 샘스토리" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/soVQeVAdqwo?si=BRat70IAnWRtMJ5j', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb06.png" alt="비바샘의 얼굴 귀염둥이 비버샘" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/86nhGkHz5MM?si=rCao3QkvvDO9WGHM', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb07.png" alt="문화와 힐링이 함께하는 하루 교사문화 프로그램" />
                            </button>
                            <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/O-NjLbcoGe8?si=qbqU70Mk_3zzXlE9', '_blank')}}>
                                <img src="/images/events/2025/event250625/vdo_thumb08.png" alt="세상에 하나뿐인 나만의 명함 꿈지기 캠페인" />
                            </button>
                        </Slider>
                    </div>
                </div>

                <div className="evtContWrap">
                    <div className="evtCont evtCont01">
                        <img src="/images/events/2025/event250625/img2.jpg" alt=""/>
                        <div className="inner">
                            <div className="blind">
                                <h3>이벤트1 선생님의 비바샘 원픽은 무엇인가요?</h3>
                                <p>
                                    비바샘에서 제공하는 다양한 서비스를 살펴보고
                                    선생님의 원픽을 골라주세요! 원픽으로 고른 이유 또는 사용 후기를 적어주시면,
                                    각 서비스별로 숨어있는 랜덤 선물을 총 300분께 드립니다♡
                                </p>
                            </div>
                            
                            <ul className="evtItemBox">
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/DwuTBmmYBbQ?si=fQh9iznI2_nizGj0', '_blank')}}>
                                        <span className="blind">비바샘의 영혼의 단짝 비상교과서 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam01" value="비상교과서" onClick={this.choosedItems} />
                                        <label htmlFor="sam01"><span className="blind">비바샘의 영혼의 단짝 비상교과서</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/mwrze2PjJSo?si=FXPE3dawsa2V1G0L', '_blank')}}>
                                        <span className="blind">AI 디지털 수업 메이트 비상 AI 디지털교과서 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam02" value="비상 AI 디지털교과서" onClick={this.choosedItems} />
                                        <label htmlFor="sam02"><span className="blind">AI 디지털 수업 메이트 비상 AI 디지털교과서</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/MNUjs-MZge0?si=t28tYuNyX2mbbuWE', '_blank')}}>
                                        <span className="blind">수업 고민 해결 교과 자료 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam03" value="교과 자료" onClick={this.choosedItems} />
                                        <label htmlFor="sam03"><span className="blind">수업 고민 해결 교과 자료</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/opnFk3apIxI?si=kl7-hQ5Q3V4S0B1O', '_blank')}}>
                                        <span className="blind">스마트한 수업의 비밀 에듀테크 테마관 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam04" value="에듀테크 테마관" onClick={this.choosedItems} />
                                        <label htmlFor="sam04"><span className="blind">스마트한 수업의 비밀 에듀테크 테마관</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/tT5bghZ1m4M?si=ALpYrAgI2BQ6_hW4', '_blank')}}>
                                        <span className="blind">주제별 창의 융합 수업 자료 샘스토리 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam05" value="샘스토리" onClick={this.choosedItems} />
                                        <label htmlFor="sam05"><span className="blind">주제별 창의 융합 수업 자료 샘스토리</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/soVQeVAdqwo?si=BRat70IAnWRtMJ5j', '_blank')}}>
                                        <span className="blind">비바샘의 얼굴 귀염둥이 비버샘 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam06" value="비버샘" onClick={this.choosedItems} />
                                        <label htmlFor="sam06"><span className="blind">비바샘의 얼굴 귀염둥이 비버샘</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/86nhGkHz5MM?si=rCao3QkvvDO9WGHM', '_blank')}}>
                                        <span className="blind">문화와 힐링이 함께하는 하루 교사문화 프로그램 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam07" value="교사문화 프로그램" onClick={this.choosedItems} />
                                        <label htmlFor="sam07"><span className="blind">문화와 힐링이 함께하는 하루 교사문화 프로그램</span></label>
                                    </div>
                                </li>
                                <li>
                                    <button className="thumb vdo" onClick={()=>{window.open('https://youtube.com/shorts/O-NjLbcoGe8?si=qbqU70Mk_3zzXlE9', '_blank')}}>
                                        <span className="blind">세상에 하나뿐인 나만의 명함 꿈지기 캠페인 영상 보러가기</span>
                                    </button>
                                    <div className="rdo">
                                        <input type="radio" name="sam" id="sam08" value="꿈지기 캠페인" onClick={this.choosedItems} />
                                        <label htmlFor="sam08"><span className="blind">세상에 하나뿐인 나만의 명함 꿈지기 캠페인</span></label>
                                    </div>
                                </li>
                            </ul>

                            <div className="btn_wrap">
                                <button className="btnApply" onClick={this.eventApply}><span className="blind">참여하기</span></button>
                            </div>
                        </div>
                        <img src="/images/events/2025/event250625/img3.jpg" alt=""/>
                        <div className="inner">
                            <div className="blind">
                                <h3>이벤트2 유튜브 이벤트</h3>
                                <p>
                                    비바샘 유튜브 채널 구독과 좋아요를 누르고 선생님의 원픽을 댓글에 남겨주세요.
                                    100명을 추첨해 시원한 음료를 드립니다!
                                </p>
                                <p>스타벅스 아이스 아메리카노 Tall 사이즈 100명</p>
                                <p>
                                    이벤트 참여는 아래의 비바샘 유튜브 바로가기 버튼을 클릭해 주세요.
                                    유튜브 영상 설명 더보기란에서 참여 방법을 확인하실 수 있습니다.
                                </p>
                            </div>
                            <div className="btn_wrap">
                                <a href="https://youtu.be/_Xvew1T40aA?si=ZwdpBoMFzdYngp-O" className="btnLink" target="_blank"><span className="blind">비바샘 유튜브 바로가기</span></a>
                            </div>
                        </div>
                    </div>

                    <div className="evtCont evtCont02">
                        <div className="commentWrap">
                            <ul className="commentList">
                                {eventApplyAnswerList.length > 0 ?
                                    eventApplyAnswerList :
                                    <li className="nodata">
                                        <p>텅~아직 작성된 내용이 없어요</p>
                                    </li>
                                }
                            </ul>
                            <button type="button" className="btnMore" style={{display: eventViewAddButton === 1 ? 'block' : 'none'}}
                                    onClick={this.commentListAddAction}>
                                더 보기(<span>{eventAnswerLeaveCnt}</span>)<i></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="evtNotice">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>본 이벤트는 교사인증을 완료한 선생님 대상 이벤트입니다.</li>
                        <li>각 이벤트는 1인 1회 참여하실 수 있습니다.</li>
                        <li>이벤트 2번은 이벤트 1번과 중복으로 참여 및 당첨이 가능합니다.</li>
                        <li>참여 완료 후 수정이 어렵습니다.</li>
                        <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                        <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>이벤트 운영 상황에 따라 운영 일정 변경이 있을 수 있습니다.</li>
                        <li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br /> 
                            (㈜카카오 사업자등록번호 : 120-81-47521) / <br />
                            (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)
                        </li>
                    </ul>
                </div>

                <div className={"evtDetailPop " + popupClass} style={{display: isShowDetail ? '' : 'none'}}>
                    <div className="evtPopWrap">
                        <button type="button" className="btn_evt_pop_close" onClick={this.detailPopHide}><span><em className="blind">닫기</em></span></button>
                        <img src={"/images/events/2024/event240809/"+ imgId} alt="이미지"/>
                    </div>
                </div>

                <FooterCopyright handleLogin={this.handleLogin}/>
            </section>
        )
    }
}

class EventListApply extends Component {

    constructor(props) {
        super(props);
        this.state = {
            member_id: this.props.member_id, // 멤버 아이디
            event_id: this.props.event_id, // eventId
            event_answer_desc: this.props.event_answer_desc, // 응답문항
            event_answer_desc2: "",
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅
        let eventSetName = maskingStr(this.state.member_id);
        let answers = this.state.event_answer_desc.split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc2: answers[0].replaceAll("\n", "<br/>"),
            event_answer_desc: answers[1].replaceAll("\n", "<br/>"),
        });
    };

    render() {
        const {eventName, event_answer_desc, event_answer_desc2} = this.state;

        return (
            /* 후기 리스트 */
            <li>
                <strong className="teacher">{eventName} 선생님</strong>
                <div className="content">
                    <div className="titWrap">
                        <span className="tit">원픽</span>
                        <p className="cate">{event_answer_desc2}</p>
                    </div>
                    <div className="txtWrap">
                        <div className="inner">
                            {event_answer_desc}
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}


export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event: state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(Event));