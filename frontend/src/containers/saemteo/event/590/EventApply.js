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
      onePick: '',
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
      infoCheck02: false, // 캠페인 후기 사진 동의 여부
      school : ''
    };
  }

  componentDidMount() {
    const {eventId, eventAnswer} = this.props;
    this.getEventInfo(eventId);
  }

  getEventInfo = async (eventId) => {
    const {history, event, SaemteoActions, eventAnswer} = this.props;
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

      this.setState({
        onePick: eventAnswer.eduArr
      });

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

  changeSchool = (e) => {
    const {event, SaemteoActions} = this.props;
    event.school = e.target.value;
    SaemteoActions.pushValues({type: "event", object: event});
    this.handleChange(e);
  }

  changeText = (e) => {
    const {event, SaemteoActions} = this.props;
    event.text = e.target.value;
    SaemteoActions.pushValues({type: "event", object: event});
    this.handleChange(e);
  }

  changeTitle = (e) => {
    const {event, SaemteoActions} = this.props;
    event.title = e.target.value;
    SaemteoActions.pushValues({type: "event", object: event});
    this.handleChange(e);
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
    if (e.target.value.length > 200) {
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
    const {telephoneCheck} = this.state;
    let reg_name = /[\uac00-\ud7a3]{2,4}/;
    let obj = {result: false, message: ''};
    if (!event.userName) {
      obj.message = '성명을 입력해주세요.';
    } else if (!reg_name.test(event.userName)) {
      obj.message = '올바른 성명 형식이 아닙니다.';
    } else if (!event.schName) {
      obj.message = '재직학교를 입력해 주세요.';
    } else if (!event.schAddr || !event.addressDetail) {
      obj.message = '상세주소를 입력해 주세요.';
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
    } else if (this.state.eventContents === "") { // 내용 미입력
      obj.message = '한줄평을 입력해 주세요.';
    } else if (!event.agreeY && !event.agreeN) {
      obj.message = "개인정보 수집 및 이용 동의를 확인해주세요.";
    } else if (event.agreeN) {
      obj.message = "개인정보 수집 및 이용에 동의하지 않을시, 이벤트 응모를 완료할 수 없습니다.";
    } else if (!event.agree) {
      obj.message = '필수 동의 선택 후 이벤트 신청을 완료해 주세요.';
    } else if (event.school == undefined || event.text == undefined || event.title == undefined) {
      obj.message = '한출평 남길 숏츠를 선택해 주세요.';
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

    receiveInfo = userInfo + '/' + event.schName + '/' + event.cellphone;
    answerData = this.state.eventContents;


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

  goUpdateInfo = async (e) => {
    e.preventDefault();
    const {eventId, PopupActions, history} = this.props;
    await PopupActions.closePopup();
    history.push('/myInfo');
  }

  //신청
  insertApplyForm = async () => {
    const {eventAnswer, event, eventId, SaemteoActions, PopupActions, BaseActions, MyclassActions} = this.props;
    const {eventContents} = this.state;
    try {
      BaseActions.openLoading();
      event.eventId = eventId;

      var params = {
        eventId: 590,
        eventAnswerDesc: event.eventAnswerDesc,
        eventAnswerDesc2: event.school + '^||^' + event.text + '^||^' + event.title + '^||^' +eventContents,
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
    const {eventInfo, phoneCheckMessage, phoneCheckClassName,school} = this.state;

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
                <h3>비상 AIDT 지원센터 리뉴얼 이벤트</h3>
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
                              onClick={this.goUpdateInfo}>
                            회원정보 수정
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
                  <h2 className="info_tit not_essential">
                    <label htmlFor="ipt_textarea">한줄평 남길 숏츠</label>
                  </h2>
                  <div className="select_wrap mt5">
                    <div className="selectbox select_sm">
                      <select name="dateSelect" id={"dateSelect"} onChange={this.changeSchool}>
                        <option value="">학교급을 선택해 주세요</option>
                        <option value="공통">공통</option>
                        <option value="초등">초등</option>
                        <option value="중고등">중고등</option>
                        <option value="서비스">서비스</option>
                      </select>
                    </div>
                    <h1>{event.school}</h1>
                    <div className="selectbox select_sm">
                      <select name="dateSelect" id={"text"} onChange={this.changeText}>
                        <option value="">교과를 선택해 주세요</option>
                        {event.school === '공통' &&
                            <option value="공통_영어">영어</option>
                        }
                        {event.school === '공통' &&
                          <option value="공통_수학">수학</option>
                        }
                        {event.school === '초등' &&
                          <option value="초등_영어">영어</option>
                        }
                        {event.school === '초등' &&
                          <option value="초등_수학">수학</option>
                        }
                        {event.school === '중고등' &&
                          <option value="중고등_정보">정보</option>
                        }
                        {event.school === '중고등' &&
                          <option value="중고등_영어,수학">영어,수학</option>
                        }
                        {event.school === '중고등' &&
                          <option value="중고등_영어">영어</option>
                        }
                        {event.school === '중고등' &&
                          <option value="중고등_수학">수학</option>
                        }
                        {event.school === '서비스' &&
                          <option value="서비스_기타">기타</option>
                        }

                      </select>
                    </div>
                    <div className="selectbox select_sm">
                      <select name="dateSelect" id={"dateSelect"} onChange={this.changeTitle}>
                        <option value="">영상제목을 선택해 주세요</option>
                        {event.text === '중고등_정보' &&
                          <option value="실습 프로그램이 한 곳에">실습 프로그램이 한 곳에</option>
                        }
                        {event.text === '중고등_정보' &&
                          <option value="AI가 코딩도 채점한다">AI가 코딩도 채점한다</option>
                        }
                        {event.text === '중고등_정보' &&
                          <option value="실습의 단계별 힌트">실습의 단계별 힌트</option>
                        }
                        {event.text === '중고등_정보' &&
                          <option value="개발자가 된 것처럼 쉬운 코딩">개발자가 된 것처럼 쉬운 코딩</option>
                        }
                        {event.text === '중고등_정보' &&
                          <option value="책 안챙겨도 수업이 된다">책 안챙겨도 수업이 된다</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="수업도구와 협업 툴">수업도구와 협업 툴</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="감정까지 케어해주는 AIDT">감정까지 케어해주는 AIDT</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="리포트가 4개?!">리포트가 4개?!</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="소리 끄고 화면 잠그고">소리 끄고 화면 잠그고</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="수업 시간에 당당하게 게임 하기">수업 시간에 당당하게 게임 하기</option>
                        }
                        {event.text === '중고등_영어,수학' &&
                          <option value="대시보드">대시보드</option>
                        }
                        {event.text === '공통_영어' &&
                          <option value="AI문법">AI문법</option>
                        }
                        {event.text === '공통_수학' &&
                          <option value="입체적 평가와 AI평어">입체적 평가와 AI평어</option>
                        }
                        {event.text === '공통_수학' &&
                          <option value="1초만에 100개 전개도">1초만에 100개 전개도</option>
                        }
                        {event.text === '초등_영어' &&
                          <option value="4가지 활동">4가지 활동</option>
                        }
                        {event.text === '초등_영어' &&
                          <option value="무한반복학습">무한반복학습</option>
                        }
                        {event.text === '초등_영어' &&
                          <option value="무궁무진 수업자료">무궁무진 수업자료</option>
                        }
                        {event.text === '초등_수학' &&
                          <option value="수학마을 수학놀이터">수학마을 수학놀이터</option>
                        }
                        {event.text === '초등_수학' &&
                          <option value="느린학습자 기초학습관">느린학습자 기초학습관</option>
                        }
                        {event.text === '중고등_영어' &&
                          <option value="AI튜터">AI튜터</option>
                        }
                        {event.text === '중고등_영어' &&
                          <option value="1초 구문분석 마법">1초 구문분석 마법</option>
                        }
                        {event.text === '중고등_수학' &&
                          <option value="문제풀이영상">문제풀이영상</option>
                        }
                        {event.text === '서비스_기타' &&
                          <option value="될 때까지 지원하는 비상 AIDT 지원센터">될 때까지 지원하는 비상 AIDT 지원센터</option>
                        }
                      </select>
                    </div>
                  </div>
                  <h2 className="info_tit not_essential">
                    <label htmlFor="ipt_textarea">한줄평</label>
                  </h2>
                  <div className="input_wrap">
												<textarea
                                                    name="applyContent"
                                                    id="ipt_textarea"
                                                    cols="1"
                                                    rows="10"
                                                    maxLength="200"
                                                    value={this.state.eventContents}
                                                    onChange={this.setApplyContent}
                                                    placeholder="EX) AI가 교사의 수업 흐름을 자연스럽게 이어가는 게 인상 깊었어요!"
                                                    className="ipt_textarea">
												</textarea>
                  </div>
                  <div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/200</p></div>
                </div>
                <div className="acco_notice_list pdside20">
                  <div className="acco_notice_cont">
                    <span className="privacyTit">개인정보 수집 및 이용동의</span>
                    <ul className="privacyList">
                      <li>개인 정보 수집 및 이용 동의 이용 목적: 경품 발송 및 고객 문의 응대</li>
                      <li>수집하는 개인 정보: 성명, 재직 학교, 휴대전화번호</li>
                      <li>개인 정보 보유 및 이용 기간: 2025년 12월 15일까지(이용 목적 달성 시 즉시 파기)</li>
                      <li>개인 정보 오기로 인한 경품 재발송은 불가능합니다. 개인 정보를 꼭 확인해 주세요.</li>
                      <li>경품 발송을 위해 개인 정보가 서비스사에 제공됩니다. (㈜모바일이앤엠애드 사업자등록번호:215-87-19169)</li>
                    </ul>
                    <br/>
                    <p className="privacyTxt pl0">선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다. <br/> 단, 동의를 거부할 경우
                      신청이 불가합니다.</p>
                  </div>
                </div>
                <div className="checkbox_circle_box mt25 pdside20">
                  <span className="txt">* 본인은 개인정보 수집 및 이용내역을 확인하였으며, 이에 동의합니다.</span>
                  <input
                      type="radio"
                      name="agree"
                      onChange={this.handleChange}
                      checked={event.agreeY}
                      className="checkbox_circle checkbox_circle_rel"
                      id="join_agree"/>
                  <label
                      htmlFor="join_agree"
                      className="checkbox_circle_simple">
                    <strong className="checkbox_circle_tit">동의함</strong>
                  </label>
                  <input
                      type="radio"
                      name="agree"
                      onChange={this.handleChange}
                      checked={event.agreeN}
                      className="checkbox_circle checkbox_circle_rel"
                      id="join_agreeN"/>
                  <label
                      htmlFor="join_agreeN"
                      className="checkbox_circle_simple">
                    <strong className="checkbox_circle_tit">동의하지않음</strong>
                  </label>
                </div>
                <button
                    type="button"
                    onClick={this.applyButtonClickSafe}
                    className="btn_event_apply btn_c2 mt20">참여하기
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