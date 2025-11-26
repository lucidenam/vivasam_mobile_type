import React, {Component, Fragment} from 'react';
import './Event.css';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import * as api from 'lib/api';
import * as common from 'lib/common';
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import InfoText from 'components/login/InfoText';
import FindAddress from 'containers/login/FindAddress';
import EventApplyResult from 'containers/saemteo/EventApplyResult';
import RenderLoading from 'components/common/RenderLoading';
import EventFindSchool from "../../EventFindSchool";
import * as myclassActions from 'store/modules/myclass';

class EventApply extends Component {

  constructor(props) {
    super(props);
    // Debounce
    this.applyButtonClick = debounce(this.applyButtonClick, 300);
    this.state = {
      /* 기존의 값 */
      initialSchName: '',
      initialSchZipCd: '',
      initialSchAddr: '',
      eventInfo: '',
      phoneCheckMessage: '',
      phoneCheckClassName: '',
      telephoneCheck: false,
      snsDisabled : true,
      blogCheck : false,
      instagramCheck : false,
      facebookCheck : false,
      youtubeCheck : false,
      etcCheck : false,
      subject : '',
      useYn : '',
      snsYn : '',
      /* 해당 이벤트에 추가 */
      isSetGroupCheck: "1", // 1 : 학급 / 2 : 동아리 ( 웹과의 연동을 위함 )
      isSetGroupName1: '', // 학급 - 학년
      isSetGroupName2: '', // 학급 - 반
      isSetGroupCircleName: '', // 동아리
      eMailDomain: '', // Email Domain ( email ID )
      anotherEmailDomain: '', // Email Back Domain ( gmail.com / naver.com ... )
      isAnotherEmailDomain: '', // ( 0 : 직접입력 X / 1 : 직접 입력 )
      firstAnotherEmailDomain: '', //회원의 기본 이메일 주소 도메인 저장
      eventContents: '', // 이벤트 신청 내용 ( 꿈 명함 이유 )
      eventLength: 0, // 이벤트 신청 길이
      infoCheck01: false, // 캠페인 유의사항 확인
      infoCheck02: false // 캠페인 후기 사진 동의 여부
    };
  }

  componentDidMount() {
    const {eventId, eventAnswer} = this.props;
    this.getEventInfo(eventId);
  }

  getEventInfo = async (eventId) => {
    const {history, event, SaemteoActions} = this.props;
    const response = await api.eventInfo(eventId);
    if (response.data.code && response.data.code === "0") {
      let eventInfo = response.data.eventList[0];
      event.eventId = eventInfo.eventId;
      let {memberId, name, email, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
      event.memberId = memberId;
      event.userName = name;
      event.agree = false;
      event.agreeY = false;
      event.agreeN = false;
      event.schName = schName;
      event.schZipCd = schZipCd;
      event.schAddr = schAddr;
      event.addressDetail = schName;
      event.inputType = '개인정보 불러오기';
      event.userInfo = 'Y';

      if (cellphone != null && cellphone != '') {
        event.cellphone = cellphone;
        this.setState({
          telephoneCheck: true
        })
      } else {
        event.cellphone = '';
      }

      if (email != null && email != '') {
        let splitEmail = email.split('@');
        event["emailId"] = splitEmail[0];
        event["emailDomain"] = splitEmail[1];
        SaemteoActions.pushValues({type: "event", object: event});
        this.setState({
          eMailDomain: event.emailId,
          anotherEmailDomain: event.emailDomain,
          firstAnotherEmailDomain: event.emailDomain
        });
      }
      this.phoneCheckByUserInfoCellphone(cellphone);
      this.setState({
        eventInfo: eventInfo,
        initialSchName: schName,
        initialSchZipCd: schZipCd,
        initialSchAddr: schAddr
      });

    } else if (response.data.code && response.data.code === "3") {
      common.info("이미 신청하셨습니다.");
      history.replace(history.location.pathname.replace('apply', 'view'));
    } else {
      history.push('/saemteo/index');
    }
  };

  // 키 입력시 숫자만 입력
  inputOnlyNumber = (e) => {
    this.checkMaxLength(e);
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
  }

  // maxLength 강제 적용
  checkMaxLength = (e) => {
    if (e.target.value.length > e.target.maxLength) {
      e.target.value = e.target.value.slice(0, e.target.maxLength);
    }
  }

  handleChange = (e) => {
    const {event, SaemteoActions} = this.props;

    if (e.target.name === 'agree') {
      if (e.target.id === "join_agreeN") {
        event["agree"] = false;
        event["agreeN"] = true;
        event["agreeY"] = false;
      } else {
        event["agree"] = true;
        event["agreeN"] = false;
        event["agreeY"] = true;
      }
    } else {
      event[e.target.name] = e.target.value;
    }
    SaemteoActions.pushValues({type: "event", object: event});
  };

  handleUserInfo = (e) => {
    const {event, SaemteoActions} = this.props;
    const {initialSchName, initialSchZipCd, initialSchAddr} = this.state;
    if (e.target.value === 'Y') {
      event.inputType = '개인정보 불러오기';
      event.schName = initialSchName;
      event.schZipCd = initialSchZipCd;
      event.schAddr = initialSchAddr;
      event.addressDetail = initialSchName;
    } else {
      event.inputType = '직접입력';
      event.schName = '';
      event.schZipCd = '';
      event.schAddr = '';
      event.addressDetail = '';
    }
    SaemteoActions.pushValues({type: "event", object: event});

    this.handleChange(e);
  };

  handleAnswerInfo = (e) => {
    const {event} = this.props;
    const {blogCheck, instagramCheck, facebookCheck, youtubeCheck, etcCheck} = this.state;

    if (e.target.name === 'snsYn') {
      if (e.target.value === '있음') {
        this.setState({
          snsDisabled: false
        });
      } else {
        this.setState({
          blogCheck: false,
          instagramCheck: false,
          facebookCheck: false,
          youtubeCheck: false,
          etcCheck: false,
        });

        this.setState({
          snsDisabled: true,
        });
      }
      this.setState({
        snsYn: e.target.value
      });
    } else if (e.target.name === 'snsCheck') {
        let id = e.target.id;
        if (id === 'blog') {
          if (blogCheck) {
            this.setState({
              blogCheck: false,
            });
          } else {
            this.setState({
              blogCheck: true,
            });
          }
        } else if (id === 'instagram') {
          if (instagramCheck) {
            this.setState({
              instagramCheck: false,
            });
          } else {
            this.setState({
              instagramCheck: true,
            });
          }
        } else if (id === 'facebook') {
          if (facebookCheck) {
            this.setState({
              facebookCheck: false,
            });
          } else {
            this.setState({
              facebookCheck: true,
            });
          }
        } else if (id === 'youtube') {
          if (youtubeCheck) {
            this.setState({
              youtubeCheck: false,
            });
          } else {
            this.setState({
              youtubeCheck: true,
            });
          }
        } else {
          if (etcCheck) {
            this.setState({
              etcCheck: false,
            });
          } else {
            this.setState({
              etcCheck: true,
            });
          }
        }
    } else if (e.target.name === 'subject') {
      this.setState({
        subject: e.target.value
      });
    } else if (e.target.name === 'useYn') {
      this.setState({
        useYn: e.target.value
      });
    }

    event[e.target.name] = e.target.value;
  };

  // 사용자의 핸드폰정보 조회시 유효성 체크
  phoneCheckByUserInfoCellphone = (cellphone) => {
    let text = '';
    let checkFlag = false;
    let clazz = 'point_red ml15';
    if (cellphone === '') {
      text = "";
    } else if (!this.checkPhoneNum(cellphone)) {
      text = "휴대폰 번호가 유효하지 않습니다.";
    } else {
      clazz = 'point_color_blue ml15';
      text = "등록가능한 휴대폰 번호입니다.";
      checkFlag = true;
    }
    this.setState({
      phoneCheckClassName: clazz,
      phoneCheckMessage: text,
      telephoneCheck: checkFlag
    });
  }
  //핸드폰번호 체크
  phoneCheck = (e) => {
    e.target.value = common.autoHypenPhone(e.target.value);
    let tel = e.target.value;
    let text = '';
    let checkFlag = false;
    let clazz = 'point_red';
    if (tel === '') {
      text = "";
    } else if (!this.checkPhoneNum(tel)) {
      text = "휴대폰 번호가 유효하지 않습니다.";
    } else {
      clazz = 'point_color_blue';
      text = "등록가능한 휴대폰 번호입니다.";
      checkFlag = true;
    }
    this.setState({
      phoneCheckClassName: clazz,
      phoneCheckMessage: text,
      telephoneCheck: checkFlag
    });
    this.handleChange(e);
  };
  checkPhoneNum = (value) => {
    if (!value) return false;
    if (value === '' || value.length === 0) {
      return false;
    } else if (value.indexOf("01") !== 0) {
      return false;
    } else if (value.length !== 13) {
      return false;
    }

    return true;
  };

  //우편번호 검색 팝업
  openPopupAddress = () => {
    const {PopupActions} = this.props;
    PopupActions.openPopup({title: "우편번호 검색", componet: <FindAddress handleSetAddress={this.handleSetAddress}/>});
  };
  //도로명주소 입력 후 callback
  handleSetAddress = (zipNo, roadAddr) => {
    const {event, PopupActions, SaemteoActions} = this.props;
    event.inputType = '직접입력';
    event.userInfo = 'N';
    event.schZipCd = zipNo;
    event.schAddr = roadAddr;
    SaemteoActions.pushValues({type: "event", object: event});
    PopupActions.closePopup();
  };

  // 내용 입력
  // 댓글 수정 시 길이 연동 및 이벤트 내용 수정
  setApplyContent = (e) => {
    if (e.target.value.length > 300) {
      // common.info("300자 이내로 입력해 주세요.");
      return false;
    }
    this.setState({
      eventLength: e.target.value.length,
      eventContents: e.target.value
    });
  };

  //값 입력 확인
  validateInfo = () => {
    const {event, eventAnswer} = this.props;
    const {telephoneCheck, blogCheck, instagramCheck, facebookCheck, youtubeCheck, etcCheck, subject, useYn, snsYn} = this.state;
    let reg_name = /[\uac00-\ud7a3]{2,4}/;
    let obj = {result: false, message: ''};

    let snsArr = [];
    if (blogCheck) {
      snsArr.push('블로그(네이버, 티스토리)');
    }
    if (instagramCheck) {
      snsArr.push('인스타그램');
    }
    if (facebookCheck) {
      snsArr.push('페이스북');
    }
    if (youtubeCheck) {
      snsArr.push('유튜브');
    }
    if (etcCheck) {
      snsArr.push('기타');
    }

    if (!event.userName) {
      obj.message = '성명을 입력해주세요.';
    } else if (!reg_name.test(event.userName)) {
      obj.message = '올바른 성명 형식이 아닙니다.';
    } else if (!event.schName) {
      obj.message = '재직학교를 입력해 주세요.';
    } else if (event.telephone === "") {
      obj.message = '휴대전화번호를 입력해 주세요.';
    } else if (!telephoneCheck) {
      obj.message = '휴대폰 번호가 유효하지 않습니다.';
    } else if (event.receive === "") {
      obj.message = '수령처를 선택해주세요.';
    } else if (event.receive === "교실" && (event.receiveGrade === "" || event.receiveClass === "")) {
      obj.message = '학년 반을 입력해주세요.';
    } else if (event.receive === "기타" && event.receiveEtc === "") {
      obj.message = '수령처를 입력해주세요.';
    } else if (subject === '') {
      obj.message = '담당 교과를 입력해 주세요.';
    } else if (useYn === '') {
      obj.message = 'AI 디지털교과서 사용여부를 선택해 주세요.';
    } else if (snsYn === '') {
      obj.message = 'SNS 채널 운영 유무 및 운영 채널을 선택해 주세요.';
    } else if (snsYn === '있음' && snsArr.length < 1) {
      obj.message = 'SNS 채널 운영 유무 및 운영 채널을 선택해 주세요.';
    } else if (this.state.eventContents === "") { // 내용 미입력
      obj.message = '지원 동기를 입력해 주세요.';
    } else if (!event.agreeY && !event.agreeN) {
      obj.message = "개인정보 수집 및 이용 동의를 확인해주세요.";
    } else if (event.agreeN) {
      obj.message = "개인정보 수집 및 이용에 동의하지 않을시, 이벤트 응모를 완료할 수 없습니다.";
    } else if (!event.agree) {
      obj.message = '필수 동의 선택 후 이벤트 신청을 완료해 주세요.';
    } else {
      obj.result = true;
    }
    return obj;
  };

  applyButtonClickSafe = (e) => {
    this.applyButtonClick(e.target);
  };

  applyButtonClick = (target) => {
    target.disabled = true;
    const {event, history, SaemteoActions, eventAnswer} = this.props;
    const {telephoneCheck, blogCheck, instagramCheck, facebookCheck, youtubeCheck, etcCheck, subject, useYn, snsYn} = this.state;
    let obj = this.validateInfo();
    if (!obj.result) {
      common.error(obj.message);
      target.disabled = false;
      return false;
    }

    let userInfo = "";
    if (event.userInfo == "Y") {
      userInfo = "개인정보 불러오기";
    } else {
      userInfo = "직접 입력"
    }
    event["eventAnswerDesc2"] = "";

    let receiveInfo = "";
    let answerData = "";

    let receive = event.receive;
    if (event.receive === "기타") {
      receive = event.receiveEtc;
    } else if (event.receive === "교실") {
      receive = event.receiveGrade + '학년 ' + event.receiveClass + '반';
    }

    let snsArr = [];
    if (blogCheck) {
      snsArr.push('블로그(네이버, 티스토리)');
    }
    if (instagramCheck) {
      snsArr.push('인스타그램');
    }
    if (facebookCheck) {
      snsArr.push('페이스북');
    }
    if (youtubeCheck) {
      snsArr.push('유튜브');
    }
    if (etcCheck) {
      snsArr.push('기타');
    }

    receiveInfo = userInfo + '/' + event.schName + '/' + event.cellphone;
    answerData = subject + '^||^' + useYn + '^||^' + snsYn + "/" + snsArr + '^||^' + this.state.eventContents;


    try {
      event.eventId = eventAnswer.eventId;
      event.eventAnswerDesc = receiveInfo;
      event.eventAnswerDesc2 = answerData;
      SaemteoActions.pushValues({type: "event", object: event});
      // 신청 처리
      this.insertApplyForm();
    } catch (e) {
      console.log(e);
    }
  };

  openPopupSchool = (e) => {
    e.preventDefault;
    const {PopupActions} = this.props;
    PopupActions.openPopup({title: "학교 검색", componet: <EventFindSchool handleSetSchool={this.handleSetSchool}/>});
  }
  // 학교검색 선택후 callback
  handleSetSchool = (obj) => {
    const {event, SaemteoActions, PopupActions} = this.props;
    const {schoolName, schoolCode, zip, addr} = obj;

    event.schCode = schoolCode;
    event.schName = schoolName;
    event.schZipCd = zip;
    event.schAddr = addr;
    event.addressDetail = '';

    SaemteoActions.pushValues({type: "event", object: event});
    PopupActions.closePopup();
  }

  handleClose = async (e) => {
    e.preventDefault();
    const {eventId, PopupActions, history} = this.props;
    await PopupActions.closePopup();
    history.push('/saemteo/event/view/' + eventId);
  };

  //신청
  insertApplyForm = async () => {
    const {eventAnswer, event, eventId, SaemteoActions, PopupActions, BaseActions, MyclassActions} = this.props;
    try {
      BaseActions.openLoading();
      event.eventId = eventId;

      var params = {
        eventId: 570,
        eventAnswerDesc: event.eventAnswerDesc,
        eventAnswerDesc2: event.eventAnswerDesc2,
        userInfo: event.userInfo,
        schCode: event.schCode
      };

      let response = await SaemteoActions.insertEventApply(params);

      if (response.data.code === '1') {
        common.error("이미 신청하셨습니다.");
      } else if (response.data.code === '0') {
        PopupActions.openPopup({title: "신청완료", componet: <EventApplyResult eventId={event.eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
        // 신청 완료.. 만약 학교 정보가 변경되었을 경우는 나의 클래스정보 재조회
        if (event.schCode && event.schCode !== this.state.initialSchCode) {
          MyclassActions.myClassInfo();
        }
      } else {
        common.error("신청이 정상적으로 처리되지 못하였습니다.");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setTimeout(() => {
        BaseActions.closeLoading();
      }, 1000);//의도적 지연.
    }
  };

  render() {
    const {eventInfo, phoneCheckMessage, phoneCheckClassName} = this.state;

    if (eventInfo === '') return <RenderLoading/>;
    const {event, eventAnswer} = this.props;

    return (
      <section className="vivasamter">
        <Fragment>
          <h2 className="blind">
            비바샘터 신청하기
          </h2>
          <div className="applyDtl_top top_yell topStyle2">
            <div className="applyDtl_cell ta_c pick color2">
              <h3>AI 디지털교과서 교사 연구회 지원하기</h3>
            </div>
          </div>
          <div className="vivasamter_apply">
            <div className="vivasamter_applyDtl pdside0 type02">
              <div className="applyDtl_inner pdside20 pt25 pb25">
                <h2 className="info_tit tit_flex">
                  <label htmlFor="ipt_name">성명</label>
                  <div className="input_wrap name_wrap style2">
                    <input
                      type="text"
                      placeholder="성명을 입력하세요"
                      id="ipt_name"
                      name="userName"
                      onChange={this.handleChange}
                      value={event.userName}
                      className="input_sm input_name"
                      readOnly={true}/>
                  </div>
                </h2>
                <h2 className="info_tit tit_flex">
                  <label htmlFor="ipt_school_name">학교정보</label>
                  <ul className="join_ipt_chk">
                    <li className="join_chk_list half">
                      <input
                        id="userInfoY"
                        type="radio"
                        className="checkbox_circle"
                        name="userInfo"
                        value="Y"
                        checked={event.userInfo === 'Y'}
                        onChange={this.handleUserInfo}
                      />
                      <label htmlFor="userInfoY">정보 불러오기</label>
                    </li>
                    <li className="join_chk_list half">
                      <input
                        id="userInfoN"
                        type="radio"
                        className="checkbox_circle"
                        name="userInfo"
                        value="N"
                        checked={event.userInfo === 'N'}
                        onChange={this.handleUserInfo}
                      />
                      <label htmlFor="userInfoN">직접입력</label>
                    </li>
                  </ul>
                </h2>
                <h2 className="info_tit">
                  <label htmlFor="ipt_school_name">재직학교</label>
                </h2>
                <div className="input_wrap school_wrap style2">
                  <input
                    type="text"
                    placeholder="예) 비바샘 고등학교"
                    id="ipt_school_name"
                    name="schName"
                    onChange={this.handleChange}
                    value={event.schName}
                    className="input_sm input_school"
                    readOnly={event.userInfo === 'Y'}
                  />
                  {
                    event.userInfo === 'Y' ?
                      <button
                        className="input_in_btn btn_gray"
                        onClick={this.openPopupSchool}>
                        학교 검색
                      </button> : ''
                  }
                </div>

                {/*{event.userInfo == 'Y' &&*/}
                {/*	<div>*/}
                {/*		<p className="bulTxt mt10">* 학교 검색에서 찾으시는 학교가 없을 경우, 직접 입력을 통해<br/> <span className="ml8">재직학교와 주소를 입력해 주세요.</span></p>*/}
                {/*		<p className="bulTxt">* 학교 검색으로 변경된 정보는 선생님의 회원 정보로 갱신됩니다.</p>*/}
                {/*	</div>*/}
                {/*}*/}
                <h2 className="info_tit" style={{display: "none"}}>
                  <label htmlFor="ipt_address">학교 주소</label>
                </h2>
                <div className="input_wrap" style={{display: "none"}}>
                  <input
                    type="text"
                    placeholder="우편번호"
                    value={event.schZipCd}
                    className="input_sm"
                    readOnly/>
                  { /* 부분 렌더링 예시 */
                    (event.userInfo === 'N') &&  // 직접입력
                    <button
                      type="button"
                      className="input_in_btn btn_gray"
                      onClick={this.openPopupAddress}
                    > 우편번호 검색
                    </button>
                  }
                </div>
                <div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}} style={{display: "none"}}>
                  <input
                    type="text"
                    placeholder="주소 입력"
                    id="ipt_address"
                    value={event.schAddr}
                    className="input_sm"
                    readOnly/>
                </div>
                <div className="input_wrap mt5" style={{display: "none"}}>
                  <input
                    type="text"
                    placeholder="상세 주소 입력"
                    id="ipt_detail_address"
                    name="addressDetail"
                    onChange={this.handleChange}
                    value={event.addressDetail}
                    className="input_sm"/>
                </div>
                <h2 className="info_tit" style={{display: "none"}}>
                  <label htmlFor="ipt_receive">수령처</label>
                </h2>
                <div className={'combo_box ' + (event.receive === '교실' ? 'type2' : (event.receive === '기타' ? 'type3' : 'type1'))} style={{display: "none"}}>
                  <div className="selectbox select_sm">
                    <select name="receive" id="ipt_receive" onChange={this.handleChange}>
                      <option value="교무실">교무실</option>
                      <option value="행정실">행정실</option>
                      <option value="택배실">택배실</option>
                      <option value="진로상담실">진로상담실</option>
                      <option value="경비실">경비실</option>
                      <option value="교실">교실</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  <div className={'input_wrap mt5 receiveEtc ' + (event.receive === '기타' ? '' : 'hide')} style={{display: "none"}}>
                    <input
                      type="text"
                      autoCapitalize="none"
                      name="receiveEtc"
                      onChange={this.handleChange}
                      className="input_sm"/>
                  </div>
                  <div className={'input_wrap mt5 receiveGradeClass ' + (event.receive === '교실' ? '' : 'hide')} style={{display: "none"}}>
                    <input
                      type="number"
                      maxLength={5}
                      name="receiveGrade"
                      onInput={this.inputOnlyNumber}
                      onChange={this.handleChange}
                      className="input_sm"/>
                    <span className="label_txt">학년</span>
                    <input
                      type="text"
                      autoCapitalize="none"
                      name="receiveClass"
                      onChange={this.handleChange}
                      className="input_sm"/>
                    <span className="label_txt">반</span>
                  </div>
                </div>

                <h2 className="info_tit">
                  <label htmlFor="ipt_phone">휴대전화번호</label>
                </h2>
                <div className="input_wrap">
                  <input
                    type="tel"
                    placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
                    id="ipt_phone"
                    name="cellphone"
                    onChange={this.phoneCheck}
                    value={event.cellphone}
                    maxLength="13"
                    className="input_sm mb5"/>
                  <InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
                </div>
                <h2 className="info_tit tit_flex">
                  <label htmlFor="ipt_school_name">담당 교과</label>
                  <ul className="join_ipt_chk">
                    <li className="join_chk_list half">
                      <input
                        id="subject01"
                        type="radio"
                        className="checkbox_circle"
                        name="subject"
                        value="수학"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="subject01">수학</label>
                    </li>
                    <li className="join_chk_list half mr20">
                      <input
                        id="subject02"
                        type="radio"
                        className="checkbox_circle"
                        name="subject"
                        value="영어"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="subject02">영어</label>
                    </li>
                    <li className="join_chk_list half">
                      <input
                        id="subject03"
                        type="radio"
                        className="checkbox_circle"
                        name="subject"
                        value="정보"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="subject03">정보</label>
                    </li>
                  </ul>
                </h2>
                <h2 className="info_tit tit_flex">
                  <label htmlFor="ipt_school_name">AI 디지털교과서 사용여부</label>
                  <ul className="join_ipt_chk">
                    <li className="join_chk_list half">
                      <input
                        id="useY"
                        type="radio"
                        className="checkbox_circle"
                        name="useYn"
                        value="사용"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="useY">사용</label>
                    </li>
                    <li className="join_chk_list half">
                      <input
                        id="useN"
                        type="radio"
                        className="checkbox_circle"
                        name="useYn"
                        value="미사용"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="useN">미사용</label>
                    </li>
                  </ul>
                </h2>
                <h2 className="info_tit tit_flex">
                  <label htmlFor="ipt_school_name">운영 중인 SNS 채널</label>
                  <ul className="join_ipt_chk">
                    <li className="join_chk_list half">
                      <input
                        id="snsY"
                        type="radio"
                        className="checkbox_circle"
                        name="snsYn"
                        value="있음"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="snsY">있음</label>
                    </li>
                    <li className="join_chk_list half">
                      <input
                        id="snsN"
                        type="radio"
                        className="checkbox_circle"
                        name="snsYn"
                        value="없음"
                        onChange={this.handleAnswerInfo}
                      />
                      <label htmlFor="snsN">없음</label>
                    </li>
                  </ul>
                </h2>
                <div>
                  <ul className="join_ipt_chk">
                    <li className="join_chk_list">
                      <input type="checkbox" className="checkbox_circle" name="snsCheck" id="blog" onChange={this.handleAnswerInfo} value="블로그(네이버, 티스토리)" checked={this.state.blogCheck} disabled={this.state.snsDisabled}/>
                      <label htmlFor="blog">블로그(네이버, 티스토리)</label>
                    </li>
                    <li className="join_chk_list">
                      <input type="checkbox" className="checkbox_circle" name="snsCheck" id="instagram" onChange={this.handleAnswerInfo} value="인스타그램" checked={this.state.instagramCheck} disabled={this.state.snsDisabled}/>
                      <label htmlFor="instagram">인스타그램</label>
                    </li>
                    <li className="join_chk_list">
                      <input type="checkbox" className="checkbox_circle" name="snsCheck" id="facebook" onChange={this.handleAnswerInfo} value="페이스북" checked={this.state.facebookCheck} disabled={this.state.snsDisabled}/>
                      <label htmlFor="facebook">페이스북</label>
                    </li>
                    <li className="join_chk_list">
                      <input type="checkbox" className="checkbox_circle" name="snsCheck" id="youtube" onChange={this.handleAnswerInfo} value="유튜브" checked={this.state.youtubeCheck} disabled={this.state.snsDisabled}/>
                      <label htmlFor="youtube">유튜브</label>
                    </li>
                    <li className="join_chk_list">
                      <input type="checkbox" className="checkbox_circle" name="snsCheck" id="etc" onChange={this.handleAnswerInfo} value="기타" checked={this.state.etcCheck} disabled={this.state.snsDisabled}/>
                      <label htmlFor="etc">기타</label>
                    </li>
                  </ul>
                </div>
                <h2 className="info_tit not_essential">
                  <label htmlFor="ipt_textarea">지원동기</label>
                </h2>
                <div className="input_wrap">
					<textarea
            name="applyContent"
            id="ipt_textarea"
            cols="1"
            rows="10"
            maxLength="300"
            value={this.state.eventContents}
            onChange={this.setApplyContent}
            placeholder="300자 이내로 입력해주세요."
            className="ipt_textarea">
					</textarea>
                </div>
                <div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/300</p></div>
              </div>
              <div className="acco_notice_list pdside20">
                <div className="acco_notice_cont">
                  <span className="privacyTit">개인정보 수집 및 이용동의</span>
                  <ul className="privacyList">
                    <li>개인정보 수집 및 이용동의이용 목적 : AI 디지털교과서 교사 연구회 지원 확인</li>
                    <li>수집하는 개인정보 : 성명, 재직학교, 휴대전화번호, 담당 과목</li>
                    <li>개인정보 보유 및 이용기간 : 2025년 9월 15일까지 </li>
                  </ul>
                </div>
              </div>
              <div className="checkbox_circle_box mt25 pdside20">
                <input
                  type="checkbox"
                  name="agree"
                  onChange={this.handleChange}
                  checked={event.agree}
                  className="checkbox_circle checkbox_circle_rel"
                  id="join_agree"/>
                <label
                  htmlFor="join_agree"
                  className="checkbox_circle_simple">
                  <strong className="checkbox_circle_tit">
                    본인은 개인정보 수집 및 이용동의 안내를 확인<br/>
                    하였으며, 이에 동의합니다.
                  </strong>
                </label>
              </div>
              <div className="acco_notice_list evtNoticee">
                <div className="acco_notice_cont">
                  <ul className="privacyList">
                    <li>위 항목을 모두 입력하셔야 지원이 가능합니다.</li>
                    <li>개인정보가 불분명한 경우 선발 명단에서 제외될 수 있습니다. 개인정보는 꼭 확인해주세요.</li>
                    <li>작성하신 내용은 지원 후 수정/삭제가 불가합니다.</li>
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={this.applyButtonClickSafe}
                className="btn_event_apply btn_c2 mt20">신청하기
              </button>
            </div>
          </div>
        </Fragment>
      </section>
    );
  }
}

export default connect(
  (state) => ({
    event: state.saemteo.get('event').toJS(),
    eventAnswer: state.saemteo.get('eventAnswer').toJS(),
  }),
  (dispatch) => ({
    PopupActions: bindActionCreators(popupActions, dispatch),
    SaemteoActions: bindActionCreators(saemteoActions, dispatch),
    BaseActions: bindActionCreators(baseActions, dispatch),
    MyclassActions: bindActionCreators(myclassActions, dispatch)
  })
)(withRouter(EventApply));