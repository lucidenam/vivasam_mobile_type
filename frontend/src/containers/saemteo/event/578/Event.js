import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter, Link} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import {FooterCopyright} from "../../../../components/page";


class Event extends Component {

  state = {
    isEventApply: false,    // 신청여부
    imgId:'',
    isShowDetail:false,
    popupClass:'',
    eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/578',
    choosedItems: {
      video: '',
      image: '',
      music: ''
    },
    popularCnt:[],
    isPlayings:[false, false, false, false, false, false],
    playingClass:['', '', '', '', '', ''],
    isPlaying: false,
    audio: null,
    currentAudioUrl: null,
  };

  handleChange = (e) => {
    const {event, SaemteoActions} = this.props;

    if (e.target.name === 'agree') {
      event.agree = e.target.value;
    } else {
      event[e.target.name] = e.target.value;
    }

    SaemteoActions.pushValues({type: "event", object: event});
  };

  componentDidMount = async () => {
    const {BaseActions} = this.props;
    BaseActions.openLoading();
    try {
      await this.eventApplyCheck();
      await this.getPopularCnt(); // 인기투표수 가져오기

    } catch (e) {
      console.log(e);
      common.info(e.message);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }
  };

  // 인기투표수
  getPopularCnt = async () => {
    const {eventId} = this.props;
    const params = {
      eventId: eventId,
      eventAnswerSeq: 2,
    };

    let response2 = await api.getPopularCnt(params);
    this.setState({
      popularCnt: response2.data.popularCnt
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

    // 기 신청 여부
    if(isEventApply){
      common.error("이미 신청하셨습니다.");
      return;
    }

    return true;
  };

  // 참여하기 버튼 클릭, eventApply로 이동
  eventApply = async (e) => {
    const {event} = this.props;
    const {isEventApply, choosedItems} = this.state;

    if (!this.prerequisite(e)) {
      return false;
    }

    const {video, image, music} = choosedItems;
    if (!video || !image || !music) {
      common.info("모든 부문에 투표해 주세요.");
      return false;
    }

    if(!event.agree ){
      common.info("개인정보 수집 및 이용 동의를 확인해주세요.");
      return false ;
    }
    if (event.agree === 'disagree') {
      common.info("개인정보 수집 및 이용에 동의하지 않을시, 이벤트 응모를 완료할 수 없습니다.");
      return false;
    }

    // 기 신청 여부
    if (isEventApply) {
      common.error("이미 신청하셨습니다.");
      return false;
    }

    try {
      // 신청 처리
      await this.insertApplyForm();
    } catch (e) {
      console.log(e);
    } finally {
      setTimeout(() => {
      }, 1000);//의도적 지연.
    }
  };

  insertApplyForm = async () => {
    const {event, history, SaemteoActions, PopupActions, BaseActions, MyclassActions, eventId} = this.props;

    try {
      BaseActions.openLoading();

      const eventAnswerDesc2 = this.state.choosedItems.video + "^||^" + this.state.choosedItems.image  + "^||^" + this.state.choosedItems.music;

      var params = {
        eventId: eventId,
        eventAnswerDesc: "",
        // eventAnswerDesc2: this.state.choosedItems,
        eventAnswerDesc2: eventAnswerDesc2,
        cellphone: "",
        userInfo: "",
        schCode: "",
      };

      let response = await SaemteoActions.insertEventApply(params);

      if (response.data.code === '1') {
        common.error("이미 신청 하셨습니다.");
      } else if (response.data.code === '0') {
        // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
        if (event.schCode && event.schCode !== this.state.initialSchCode) {
          MyclassActions.myClassInfo();
        }
        common.info("투표에 참여해 주셔서 감사합니다.");
        window.location.reload();
        // history.push('/saemteo/event/view/' + eventId);

      } else if (response.data.code === '5') {
        common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
      } else if (response.data.code === '6') {
        common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
      } else {
        common.error("신청이 정상적으로 처리되지 못하였습니다.");
      }

    } catch (e) {
      console.log(e);
      common.info(e.message);
      history.push('/saemteo/event/view/' + eventId);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
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
      console.log("choosedItems items:", this.state.choosedItems);
    });
  };

  detailPopHide = () => {
    const {isShowDetail} = this.state;
    this.setState({
      isShowDetail:false,
    });
  }

  copyToClipboard = (e) => {
    // 글을 쓸 수 있는 란을 만든다.
    let aux = document.createElement("input");
    // 지정된 요소의 값을 할당 한다.
    aux.setAttribute("value", this.state.eventUrl);
    // bdy에 추가한다.
    document.body.appendChild(aux);
    // 지정된 내용을 강조한다.
    aux.select();
    // 텍스트를 카피 하는 변수를 생성
    document.execCommand("copy");
    // body 로 부터 다시 반환 한다.
    document.body.removeChild(aux);
    common.info('링크가 복사되었습니다.');
  };

  render () {
    const {imgId, isShowDetail, popupClass, playingClass, popularCnt} = this.state;
    return (
        <section className="event250814">
          <span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>
          <button className="btnShare" onClick={this.copyToClipboard}><span className="blind">이벤트 공유하기</span></button>
          <div className="evtTitWrap">
            <h1><img src="/images/events/2025/event250814/img1.png" alt=""/></h1>
            <div className="blind">
              <h3>제2회 비바샘 AI 플랫폼 활용 공모전</h3>
              <h2>도전 ! AI 알잘딱깔샘! 인기투표</h2>
              <p>참여작 무료 <span>000</span>개, 참여 선생님 <span>000</span>분의 열기로 뜨거웠던 공모전!</p>
              <p>1차 심사에서 선정된 후보를 소개합니다.</p>
              <p><span>AIDEA</span>가 돋보였던 비바샘 광고에 투표해 주세요!</p>
              <p>*순위는 1차 심사 점수와 인기투표 점수를 합산하여 최종 선정됩니다</p>
            </div>
            <div className="blind">
              <dl>
                <dt>투표 기간</dt>
                <dd>2025년 8월 14일(목) ~ 8월 21일(목)</dd>
                <dt>선정작 발표</dt>
                <dd>2025년 8월 28일(목)</dd>
              </dl>
              <p>※ 부문당 1인 1회 투표 가능, 중복 투표 불가</p>
            </div>
          </div>

          <div className="evtCont evtCont01">
            <img src="/images/events/2025/event250814/tit_01.png" alt="하트를 눌러 투표하신 후 하단의 투표하기 버튼을 꼭 눌러 주세요."/>
            <div className="blind">
              <h3>하트를 눌러 투표하신 후, 하단의 투표하기 버튼을 꼭 눌러주세요.</h3>
            </div>
            <div className="evtItemWrap">
              <div className="evtAwardBox">
                <h3><img src="/images/events/2025/event250814/tit_02.png" alt="영상"/></h3>
                <ul>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_1.png" alt="후보1"/></h2>
                    <div className="evtVdoBox">
                      <div className="thumb vdo" onClick={() => {
                        this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_김민지.mp4')
                      }}>
                        <img src="/images/events/2025/event250814/thumb_vdo_01.png" alt="썸네일"/>
                      </div>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">나의 이야기, 너의 이야기,<br/>우리의 이야기</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video01" value="영상 후보1" onClick={this.choosedItems}/>
                        <label htmlFor="video01"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[0].totalCnt >= 999 ? '999+' : popularCnt[0].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_2.png" alt="후보2"/></h2>
                    <div className="thumb vdo" onClick={() => {
                      this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_김성문.mp4')
                    }}>
                      <img src="/images/events/2025/event250814/thumb_vdo_02.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt"><p className="GM">내가 아는 교사 이야기</p></div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video02" value="영상 후보2" onClick={this.choosedItems}/>
                        <label htmlFor="video02"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[1].totalCnt >= 999 ? '999+' : popularCnt[1].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_3.png" alt="후보3"/></h2>
                    <div className="thumb vdo" onClick={() => {
                      this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_성공주.mp4')
                    }}>
                      <img src="/images/events/2025/event250814/thumb_vdo_03.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">VIVASAM LA VIDA</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video03" value="영상 후보3" onClick={this.choosedItems}/>
                        <label htmlFor="video03"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[2].totalCnt >= 999 ? '999+' : popularCnt[2].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_4.png" alt="후보4"/></h2>
                    <div className="thumb vdo" onClick={() => {
                      this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_이승재.mp4')
                    }}>
                      <img src="/images/events/2025/event250814/thumb_vdo_04.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt"><p className="GM">비상한 꿈</p></div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video04" value="영상 후보4" onClick={this.choosedItems}/>
                        <label htmlFor="video04"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[3].totalCnt >= 999 ? '999+' : popularCnt[3].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_5.png" alt="후보5"/></h2>
                    <div className="thumb vdo" onClick={() => {
                      this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_정도행.mp4')
                    }}>
                      <img src="/images/events/2025/event250814/thumb_vdo_05.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">내가 가장 빛나는 곳,<br/>비바샘과 함께</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video05" value="영상 후보5" onClick={this.choosedItems}/>
                        <label htmlFor="video05"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[4].totalCnt >= 999 ? '999+' : popularCnt[4].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_6.png" alt="후보6"/></h2>
                    <div className="thumb vdo" onClick={() => {
                      this.detailPop("video", 'https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_영상_정복영.mp4')
                    }}>
                      <img src="/images/events/2025/event250814/thumb_vdo_06.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">선생님을 빛나게 하다</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="video" id="video06" value="영상 후보6" onClick={this.choosedItems}/>
                        <label htmlFor="video06"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[5].totalCnt >= 999 ? '999+' : popularCnt[5].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="evtCont evtCont02">
            <div className="evtItemWrap">
              <div className="evtAwardBox">
                <h3><img src="/images/events/2025/event250814/tit_03.png" alt="이미지"/></h3>
                <ul>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_1.png" alt="후보1"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '고태용.jpg', '')
                    }}>
                      <img src="/images/events/2025/event250814/고태용.jpg" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">웃고 싶은 샘! 비바샘으로 오샘!</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image01" value="이미지 후보1" onClick={this.choosedItems}/>
                        <label htmlFor="image01"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[6].totalCnt >= 999 ? '999+' : popularCnt[6].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_2.png" alt="후보2"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '박유진.jpg', '')
                    }}>
                      <img src="/images/events/2025/event250814/박유진.jpg" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">내일의 가능성을 건네다, 비바샘</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image02" value="이미지 후보2" onClick={this.choosedItems}/>
                        <label htmlFor="image02"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[7].totalCnt >= 999 ? '999+' : popularCnt[7].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_3.png" alt="후보3"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '이인혜.png', 'pdSide')
                    }}>
                      <img src="/images/events/2025/event250814/이인혜.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">교과서 속에서 시작되는<br/>아이들의 미래 이야기</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image03" value="이미지 후보3" onClick={this.choosedItems}/>
                        <label htmlFor="image03"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[8].totalCnt >= 999 ? '999+' : popularCnt[8].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_4.png" alt="후보4"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '전채원.png', '')
                    }}>
                      <img src="/images/events/2025/event250814/전채원.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">비바샘, 수업을 ON하다</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image04" value="이미지 후보4" onClick={this.choosedItems}/>
                        <label htmlFor="image04"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[9].totalCnt >= 999 ? '999+' : popularCnt[9].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_5.png" alt="후보5"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '정지현.png', '')
                    }}>
                      <img src="/images/events/2025/event250814/정지현.png" alt="썸네일"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">선생님의 놀이터</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image05" value="이미지 후보5" onClick={this.choosedItems}/>
                        <label htmlFor="image05"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[10].totalCnt >= 999 ? '999+' : popularCnt[10].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_w_6.png" alt="후보6"/></h2>
                    <div className="thumb img" onClick={() => {
                      this.detailPop("img", '홍찬우.png', '')
                    }}>
                      <img src="/images/events/2025/event250814/홍찬우.png" alt="홍찬우"/>
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">교과서 너머의 세상,<br/>비바샘과 함께</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="image" id="image06" value="이미지 후보6" onClick={this.choosedItems}/>
                        <label htmlFor="image06"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[11].totalCnt >= 999 ? '999+' : popularCnt[11].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="evtCont evtCont03">
            <div className="evtItemWrap">
              <div className="evtAwardBox">
                <h3><img src="/images/events/2025/event250814/tit_04.png" alt="음원"/></h3>
                <ul>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_11.png" alt="후보1"/></h2>
                    <div className={"thumb mp3 " + playingClass[0]} onClick={() => {
                      this.audioControls(this.itemRef1, 1)
                    }}>
                      <img src="/images/events/2025/event250814/thumb01.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_김광록.mp3"
                          ref={(ref) => this.itemRef1 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">Viva Class!</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music01" value="음원 후보1" onClick={this.choosedItems}/>
                        <label htmlFor="music01"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[12].totalCnt >= 999 ? '999+' : popularCnt[12].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_12.png" alt="후보2"/></h2>
                    <div className={"thumb mp3 " + playingClass[1]} onClick={() => {
                      this.audioControls(this.itemRef2, 2)
                    }}>
                      <img src="/images/events/2025/event250814/thumb02.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_유주희.mp3"
                          ref={(ref) => this.itemRef2 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">Be Viva! Be Smart!</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music02" value="음원 후보2" onClick={this.choosedItems}/>
                        <label htmlFor="music02"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[13].totalCnt >= 999 ? '999+' : popularCnt[13].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_13.png" alt="후보3"/></h2>
                    <div className={"thumb mp3 " + playingClass[2]} onClick={() => {
                      this.audioControls(this.itemRef3, 3)
                    }}>
                      <img src="/images/events/2025/event250814/thumb03.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_이사야.mp3"
                          ref={(ref) => this.itemRef3 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">교실요정 비바샘</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music03" value="음원 후보3" onClick={this.choosedItems}/>
                        <label htmlFor="music03"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[14].totalCnt >= 999 ? '999+' : popularCnt[14].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_14.png" alt="후보4"/></h2>
                    <div className={"thumb mp3 " + playingClass[3]} onClick={() => {
                      this.audioControls(this.itemRef4, 4)
                    }}>
                      <img src="/images/events/2025/event250814/thumb04.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_진보라.mp4"
                          ref={(ref) => this.itemRef4 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">샘들 곁엔 비바샘</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music04" value="음원 후보4" onClick={this.choosedItems}/>
                        <label htmlFor="music04"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[15].totalCnt >= 999 ? '999+' : popularCnt[15].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>
                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_15.png" alt="후보5"/></h2>
                    <div className={"thumb mp3 " + playingClass[4]} onClick={() => {
                      this.audioControls(this.itemRef5, 5)
                    }}>
                      <img src="/images/events/2025/event250814/thumb05.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_천은정.mp3"
                          ref={(ref) => this.itemRef5 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">수업 준비에 지칠 때면</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music05" value="음원 후보5" onClick={this.choosedItems}/>
                        <label htmlFor="music05"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[16].totalCnt >= 999 ? '999+' : popularCnt[16].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                  <li>
                    <h2><img src="/images/events/2025/event250814/txt_g_16.png" alt="후보6"/></h2>
                    <div className={"thumb mp3 " + playingClass[5]} onClick={() => {
                      this.audioControls(this.itemRef6, 6)
                    }}>
                      <img src="/images/events/2025/event250814/thumb06.png" alt="썸네일"/>
                      <audio
                          className="react-player"
                          src="https://dn.vivasam.com/vs/event/movie/contents/제2회 AI플랫폼 활용 공모전_음원_최영식.mp3"
                          ref={(ref) => this.itemRef6 = ref}
                      />
                    </div>
                    <div className="info">
                      <div className="txt">
                        <p className="GM">선생님, 묻고 싶어요<br/>Tell me what's your pick</p>
                      </div>
                      <div className="rdo">
                        <input type="radio" name="music" id="music06" value="음원 후보6" onClick={this.choosedItems}/>
                        <label htmlFor="music06"><p
                            className="like">{popularCnt.length > 0 ? (popularCnt[17].totalCnt >= 999 ? '999+' : popularCnt[17].totalCnt) : 0}</p>
                        </label>
                      </div>
                    </div>

                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="evtCont evtCont04">
            <div className="inner">
              <div className="privacy">
                <h3>※ 개인정보 수집 및 이용 동의</h3>
                <p>- 이용 목적: 인기투표 이벤트 참여 확인 및 CS 문의 응대</p>
                <p>- 수집하는 개인정보: 성명, 비바샘 ID</p>
                <p>- 개인정보 보유 및 이용 기간: <span>2025년 9월 28일</span>까지<br/>&nbsp;&nbsp;&nbsp;(이용 목적 달성 시 즉시 파기)</p>

                <p className="sm">선생님께서는 개인정보의 수집 및 이용,<br/>취급 위탁에 대한 동의를 거부할 수 있습니다.<br/>단, 동의를 거부할 경우 인기투표 참여가 불가합니다.
                </p>
              </div>
              <div className="agreeBox">
                <p>* 개인정보 수집 및 이용에 동의합니다.</p>
                <div className="iptform">
                  <span className="chk"><input
                      type="radio"
                      name="agree"
                      onChange={this.handleChange}
                      value="agree"
                      id="join_agree"/>
                  <label htmlFor="join_agree">
                   동의함
                  </label></span>
                  <span className="chk"><input
                      type="radio"
                      name="agree"
                      onChange={this.handleChange}
                      value="disagree"
                      // checked={agree}
                      id="join_agree2"/>
                  <label htmlFor="join_agree2">
                  동의하지 않음
                  </label></span>
                </div>
              </div>
              <button type="button" className="btn_join" onClick={this.eventApply}><span className="blind">투표하기</span>
                <img src="/images/events/2025/event250814/btn_join.png" alt="투표하기"/>
              </button>
            </div>
          </div>

          <div className={"evtDetailPop " + popupClass} style={{display: isShowDetail ? '' : 'none'}}>
            <div className="evtPopWrap">
              <button type="button" className="btn_evt_pop_close" onClick={this.detailPopHide}><span><em
                  className="blind">닫기</em></span></button>
              <img src={"/images/events/2025/event250814/" + imgId} alt="이미지"/>
            </div>
          </div>

          <div className="evtCont evtNotice">
            <div className="inner">
              <strong>유의사항</strong>
              <ul>
                <li>부문당 1인 1회 투표 가능합니다.</li>
                <li>영상 / 이미지 / 음원 당 응모작 1개씩만 선택 가능합니다.</li>
                <li>비바샘에 가입한 회원만 투표하실 수 있습니다.</li>
                <li>투표가 완료되면, 취소, 수정, 재참여는 불가능합니다.</li>

              </ul>
            </div>
          </div>
          <FooterCopyright handleLogin={this.handleLogin}/>
        </section>
    )
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