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
    };
  }

  componentDidMount() {
    const {eventId, eventAnswer} = this.props;
    this.getEventInfo(eventId);
  }

  getEventInfo = async (eventId) => {
    const {history, event} = this.props;
    const response = await api.eventInfo(eventId);
    if (response.data.code && response.data.code === "0") {
      let eventInfo = response.data.eventList[0];
      event.eventId = eventInfo.eventId;
      let {memberId, name, email, schName, schZipCd, schAddr, cellphone} = response.data.memberInfo;
      event.memberId = memberId;
      event.userName = name;
      event.agreeY = false;
      event.agreeN = false;
      event.schName = schName;
      event.schZipCd = schZipCd;
      event.schAddr = schAddr;
      event.addressDetail = schName;

      if (cellphone != null && cellphone != '') {
        event.cellphone = cellphone;
        this.setState({
          telephoneCheck: true
        })
      } else {
        event.cellphone = '';
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

  handleChange = (e) => {
    const {event, SaemteoActions} = this.props;

    if (e.target.name === 'agree') {
      if (e.target.id === "join_agreeN") {
        event["agreeN"] = true;
        event["agreeY"] = false;
      } else {
        event["agreeN"] = false;
        event["agreeY"] = true;
      }
    } else {
      event[e.target.name] = e.target.value;
    }
    SaemteoActions.pushValues({type: "event", object: event});
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

  //값 입력 확인
  validateInfo = () => {
    const {event} = this.props;
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
    } else if (!event.agreeY && !event.agreeN) {
      obj.message = "필수 동의 선택 후 이벤트 신청을 완료해 주세요.";
    } else if (event.agreeN) {
      obj.message = "이벤트 신청을 위해 개인정보 수집 및 이용 동의가 필요합니다.";
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
    const {event, SaemteoActions, eventAnswer} = this.props;
    const obj = this.validateInfo();
    if (!obj.result) {
      common.error(obj.message);
      target.disabled = false;
      return false;
    }

    const receiveInfo= event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail;

    try {
      event.eventId = eventAnswer.eventId;
      event.eventAnswerDesc = receiveInfo;
      event.eventAnswerDesc2 = eventAnswer.eventAnswerContent;
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
    const {event, eventId, SaemteoActions, PopupActions, BaseActions, MyclassActions} = this.props;
    try {
      BaseActions.openLoading();

      var params = {
        eventId: event.eventId,
        eventAnswerDesc: event.eventAnswerDesc,
        eventAnswerDesc2: event.eventAnswerDesc2,
        schCode: event.schCode
      };

      let response = await SaemteoActions.insertEventApply(params);

      if (response.data.code === '1') {
        common.error("이미 신청하셨습니다.");
      } else if (response.data.code === '0') {
        PopupActions.openPopup({title: "신청완료", componet: <EventApplyResult eventId={eventId} surveyList={response.data.surveyList} handleClose={this.handleClose}/>});
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
                <h3>일상 한 컷, 교과서 속 순간 이벤트 {eventAnswer.eventId === "574" ? '1' : '2'}</h3>
              </div>
            </div>
            <div className="vivasamter_apply">
            <div className="vivasamter_applyDtl pdside0 type02">
                <div className="applyDtl_inner pdside20 pb25">
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
                        readOnly
                    />
                    <button
                        className="input_in_btn btn_gray"
                        onClick={this.openPopupSchool}>
                      학교 검색
                    </button>
                  </div>

                  <h2 className="info_tit">
                    <label htmlFor="ipt_address">학교 주소</label>
                  </h2>
                  <div className="input_wrap">
                    <input
                        type="text"
                        placeholder="우편번호"
                        value={event.schZipCd}
                        className="input_sm"
                        readOnly/>
                  </div>
                  <div className="input_wrap mt5" style={{display: event.schAddr !== '' ? 'block' : 'none'}}>
                    <input
                        type="text"
                        placeholder="주소 입력"
                        id="ipt_address"
                        value={event.schAddr}
                        className="input_sm"
                        readOnly/>
                  </div>
                  <div className="input_wrap mt5">
                    <input
                        type="text"
                        placeholder="상세 주소 입력"
                        id="ipt_detail_address"
                        name="addressDetail"
                        onChange={this.handleChange}
                        value={event.addressDetail}
                        className="input_sm"/>
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
                </div>
                <div className="acco_notice_list pdside20">
                  <div className="acco_notice_cont">
                    <span className="privacyTit">개인정보 수집 및 이용동의</span>
                    <ul className="privacyList">
                      <li>개인정보 수집 및 이용동의이용 목적 : 경품 발송 및 고객문의 응대</li>
                      <li>수집하는 개인정보 : 성명, 재직학교, 학교주소, 휴대전화번호</li>
                      <li>개인정보 보유 및 이용기간 : 2025년 8월 31일까지 (이용목적 달성 시 즉시 파기)</li>
                      <li>연락처 오류 시 경품 재발송이 불가능합니다. 개인정보를 꼭 확인해 주세요.</li>
                      <li>선물 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사와 배송업체에 제공됩니다.<br/>(㈜카카오 사업자 등록 번호: 120-81-47521, (주)다우기술 사업자등록번호: 220-81-02810)</li>
                      <li>선생님께서는 개인정보의 수집 및 이용, 처리 위탁에 대한 동의를 거부할 수 있습니다.<br/>단, 동의를 거부할 경우 신청이 불가합니다.</li>
                    </ul>
                  </div>
                </div>
                <div className="checkbox_circle_box mt25 pdside20">
                  <span className="txt">* 개인정보 수집 및 이용에 동의합니다.</span>
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