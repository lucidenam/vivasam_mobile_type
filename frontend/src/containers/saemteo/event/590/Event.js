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
    eventId: 590,
    isEventApply: false,    // 신청여부
    imgId:'',
    isShowDetail:false,
    popupClass:'',
    eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/590',
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
      eventId: 590,
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
    const {isEventApply, eventAnswerCount} = this.state;

    if (!this.prerequisite(e)) {
      return false;
    }

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }

    if (eventAnswerCount > 1000) {
      common.error("선착순 마감되었습니다.");
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
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: false,
      className: 'evtSwiper'
    };

    return (
        <section className="event250829">
          <a href="https://e.vivasam.com/aidt/main" target="_blank" className="logo"></a>
          <div className="evtTitWrap">
            <div className="title">
              <img src="/images/events/2025/event250829_1/img01.png" alt="선생님의 비바샘 원픽은? 이벤트"/>
              <a href="https://www.vivasam.com/aidt/lounge/shorts/list"  target="_blank"  className="btn_shotsLink"><span className="blind">숏츠 영상관 바로가기</span> </a>
            </div>
            <div className="blind">
              <p>비상 AIDT 지원센터 리뉴얼 이벤트</p>
              <h2>우리 AIDT 지원센터가 달라졌어요!</h2>
              <p>핵심 기능만 콕 집어! 더 쉽게! AIDT 수업을 지원합니다.</p>
              <p>비상 AIDT 숏츠로 재미있고 쉽게 AIDT 수업 노하우를 배워보세요!</p>
              <p>영상을 보고 한줄평 남기면 커피 기프티콘을 드려요</p>

            </div>

            <div className="evtItemWrap">
              <Slider {...settings}>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner01.png" alt="[공통_비바샘2]대시보드"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner02.png" alt="[공통_비바샘2]리포트"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner03.png" alt="[수학_비바샘2]느린학습자 기초학습관"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner04.png" alt="[수학_비바샘2]입체적 평가와 AI 평어"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner05.png" alt="[정보_비바샘2]실습의 단계별 힌트"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner06.png" alt="[정보_비바샘2]코딩 실습, AI가 채점"/>
                </div>
                {/*<div className="thumb">*/}
                {/*  <img src="/images/events/2025/event250829_1/banner07.png" alt="[초등영어_비바샘2]4가지 활동"/>*/}
                {/*</div>*/}
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner08.png" alt="[초등영어_비바샘2]무한반복"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner09.png" alt="01[공통_학생3]AI 감정 케어"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner10.png" alt="02[수학_학생3]문제풀이영상"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner11.png" alt="03[공통_학생3]게임"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner12.png" alt="04[영어_학생3] AI 문법 첨삭"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner13.png" alt="05[영어_학생3]AI튜터"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner14.png" alt="06[고등정보_학생3]개발자가 된 것처럼 쉬운 코딩"/>
                </div>
                <div className="thumb">
                  <img src="/images/events/2025/event250829_1/banner15.png" alt="07[수학_학생3]수학마을 수학놀이터"/>
                </div>
              </Slider>
            </div>
          </div>
          <div className="evtConMid">
            <img src="/images/events/2025/event250829_1/txt.png"/>
            <div className="blind">
              <h3>이벤트 기간</h3>
              <p>2025년 8월 29일(금) ~ 9월 30일(화)</p>
              <span>* 선착순 1,000명 참여 시 조기 마감</span>
            </div>

          </div>
          <div className="evtContWrap">
            <div className="evtCont evtCont01">
            <img src="/images/events/2025/event250829_1/evt_img_02.png" alt=""/>
                <div className="inner">
                  <div className="blind">
                    <h3>이벤트1 선생님의 비바샘 원픽은 무엇인가요?</h3>
                    <p>
                      비바샘에서 제공하는 다양한 서비스를 살펴보고
                      선생님의 원픽을 골라주세요! 원픽으로 고른 이유 또는 사용 후기를 적어주시면,
                      각 서비스별로 숨어있는 랜덤 선물을 총 300분께 드립니다♡
                    </p>
                  </div>
                  <div className="btn_wrap">
                    <a href="https://www.vivasam.com/aidt/lounge/shorts/list" className="btnLink" target="_blank">
                      <img src="/images/events/2025/event250829_1/btn_shorts.png" alt="숏츠 영상관 바로가기"/></a>
                      <button className="btnApply" onClick={this.eventApply}>
                        <img src="/images/events/2025/event250829_1/btn_apply.png" alt="한줄평 이벤트 참여하기"/>
                      </button>
                  </div>
                </div>

            </div>

            <div className="evtCont evtCont02">
                <div className="commentWrap">
                  <h3>지금까지 <em>00</em>명의<span>선생님이 남긴 한줄평</span></h3>
                  <ul className="commentList">
                    {eventApplyAnswerList.length > 0 ?
                        eventApplyAnswerList :
                        <li className="nodata">
                          <p>텅~아직 작성된 내용이 없어요</p>
                        </li>
                    }
                    {/*{eventApplyAnswerList.length > 0 ?*/}
                    {/*    eventApplyAnswerList :*/}
                    {/*    <li className="nodata">*/}
                    {/*      <p>텅~아직 작성된 내용이 없어요</p>*/}
                    {/*    </li>*/}
                    {/*}*/}
                  </ul>
                  <button type="button" className="btnMore"
                          style={{display: eventViewAddButton === 1 ? 'block' : 'none'}}
                          onClick={this.commentListAddAction}>
                    더 보기(<span>{eventAnswerLeaveCnt}</span>)<i></i>
                  </button>
                </div>
            </div>
          </div>

          <div className="evtNotice">
            <strong>확인사항</strong>
              <ul className="evtInfoList">
                <li>1인 1회 참여 가능합니다.</li>
                <li>의미없는 내용 또는 주제와 무관한 내용 작성 시 관리자에 의해 삭제되며 참여가
                  인정되지 않습니다.</li>
                <li>경품은 이벤트 종료 후 일괄 발송됩니다.</li>
                <li>경품은 이벤트 참여 시 입력한 휴대폰 번호로 발송되며 입력 정보가 부정확하여 수령하지
                  못한 경우 재발송이 불가합니다.</li>
                <li>관람평 내용은 마케팅 및 서비스 개선에 활용될 수 있습니다.</li>
                <li>이벤트 내용은 상황에 따라 조기 종료 혹은 변경될 수 있습니다.</li>

              </ul>
            </div>

            <div className={"evtDetailPop " + popupClass} style={{display: isShowDetail ? '' : 'none'}}>
              <div className="evtPopWrap">
                <button type="button" className="btn_evt_pop_close" onClick={this.detailPopHide}><span><em
                    className="blind">닫기</em></span></button>
                <img src={"/images/events/2024/event240809/" + imgId} alt="이미지"/>
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
      event_answer_desc: answers[0].replaceAll("\n", "<br/>"),
      event_answer_desc2: answers[1].replaceAll("\n", "<br/>"),
      event_answer_desc3: answers[2].replaceAll("\n", "<br/>"),
      event_answer_desc4: answers[3].replaceAll("\n", "<br/>"),
    });
  };

  render() {
    const {eventName, event_answer_desc, event_answer_desc2,event_answer_desc3,event_answer_desc4} = this.state;

    return (
        /* 후기 리스트 */
        <li>
          <div className="titWrap">
            <span className="tit">{event_answer_desc3}</span>
          </div>
          <div className="content">
            <div className="txtWrap">
              <div className="inner">
                {event_answer_desc4}
              </div>
              <strong className="teacher">{eventName} 선생님</strong>
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