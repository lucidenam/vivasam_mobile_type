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
      eventLength:0,
      eventContents:'',
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
    const {eventId} = this.props;
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
      SaemteoActions.pushValues({type: "event", object: event});
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
      event[e.target.name] = e.target.checked;
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

  //값 입력 확인
  validateInfo = () => {
    const {event, eventAnswer} = this.props;
    const {telephoneCheck, eventContents} = this.state;
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
    } else if (event.receive === "교실") {
      if (event.receiveGrade === "" || Number(event.receiveGrade) === 0) {
        obj.message = "학년을 입력해 주세요.";
      }
      if (event.receiveClass === "" || Number(event.receiveClass) === 0) {
        obj.message = "반을 입력해 주세요.";
      }
    } else if (event.receive === "기타") {
      if (!event.receiveEtc || event.receiveEtc === "") {
        obj.message = "수령처를 입력해 주세요.";
      }
    } else if (!eventContents || eventContents === "") {
      obj.message = "이용 후기를 입력해 주세요.";
    } else if ((!event.studentCnt || Number(event.studentCnt) === 0) && eventAnswer.eventId == 588) {
      obj.message = "학급 학생 수를 입력해 주세요.";
    } else if (!event.agree) {
      obj.message = "필수 동의 선택 후 이벤트 신청을 완료해 주세요.";
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
    const {eventContents} = this.state;
    const obj = this.validateInfo();
    if (!obj.result) {
      common.error(obj.message);
      target.disabled = false;
      return false;
    }

    let receive = event.receive;
    if (event.receive === "교실") {
      receive += `(${event.receiveGrade}학년 ${event.receiveClass} 반)`;
    } else if (event.receive === "기타") {
      receive += `(${event.receiveEtc})`;
    }

    let receiveInfo = event.inputType + '/' + event.schName + '/' + event.cellphone + '/' + event.schZipCd + '/' + event.schAddr + ' ' + event.addressDetail + '/수령처 : ' + receive;

    try {
      event.eventId = eventAnswer.eventId;
      event.eventAnswerDesc = receiveInfo;
      event.eventAnswerDesc2 = eventContents + (eventAnswer.eventId == 588 ? '^||^' + Number(event.studentCnt) : "");
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
    const {event, eventId, SaemteoActions, PopupActions, BaseActions} = this.props;
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

  // 내용 입력
  setApplyContent = (e) => {
    if (e.target.value.length > 200) {
      return false;
    }
    this.setState({
      eventLength: e.target.value.length,
      eventContents: e.target.value
    });
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
              <h3>{eventAnswer.eventId === "587" ? '이벤트 1) 한 걸음, 나만의 수업 만들기 도전!' : '이벤트 2) 두 걸음, 우리반 사회정서 체크!'}</h3>
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

                {eventAnswer.eventId === "588" ?
                  <Fragment>
                    <h2 className="info_tit">
                      <label htmlFor="ipt_receive">수령처</label>
                    </h2>
                    <div className={'combo_box ' + (event.receive === '교실' ? 'type2' : (event.receive === '기타' ? 'type3' : 'type1'))}>
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
                      <div className={'input_wrap mt5 receiveEtc ' + (event.receive === '기타' ? '' : 'hide')}>
                        <input
                          type="text"
                          autoCapitalize="none"
                          name="receiveEtc"
                          onChange={this.handleChange}
                          className="input_sm"/>
                      </div>
                      <div className={'input_wrap mt5 receiveGradeClass ' + (event.receive === '교실' ? '' : 'hide')}>
                        <input
                          type="number"
                          maxLength={2}
                          name="receiveGrade"
                          onInput={this.inputOnlyNumber}
                          onChange={this.handleChange}
                          className="input_sm"/>
                        <span className="label_txt">학년</span>
                        <input
                          type="number"
                          autoCapitalize="none"
                          name="receiveClass"
                          maxLength={2}
                          onInput={this.inputOnlyNumber}
                          onChange={this.handleChange}
                          className="input_sm"/>
                        <span className="label_txt">반</span>
                      </div>
                    </div>
                  </Fragment>
                  : ''}
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

                {eventAnswer.eventId === "588" ?
                  <Fragment>
                    <h2 className="info_tit">
                      <label htmlFor="ipt_receive">학급 인원 수</label>
                    </h2>
                    <div className="input_wrap mt5 receiveGradeClass">
                      <input
                        type="number"
                        name="studentCnt"
                        maxLength="2"
                        onInput={this.inputOnlyNumber}
                        onChange={this.handleChange}
                        value={event.studentCnt}
                        className="input_sm wp143"/>
                      <span className="label_txt">명</span>
                    </div>
                  </Fragment>
                  : ''}

                <h2 className="info_tit not_essential">
                  <label htmlFor="ipt_textarea">이용 후기</label>
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
                      placeholder={eventAnswer.eventId === "587" ? "비바클래스에서 수업 만들고 진행한 후기를 남겨주세요. (최대 200자)" : "비바클래스에서 학습심리정서검사를 진행한 후기를 남겨주세요. (최대 200자)"}
                      className="ipt_textarea">
                    </textarea>
                </div>
                <div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/200</p></div>
              </div>
              <div className="acco_notice_list pdside20">
                <div className="acco_notice_cont">
                  <span className="privacyTit">개인정보 수집 및 이용동의</span>
                  {eventAnswer.eventId === "588" ?
                    <ul className="privacyList">
                      <li>이용목적 : 경품 발송 및 고객 문의 응대</li>
                      <li>수집하는 개인정보 : 성명, 재직 학교, 휴대전화번호 , 학교 주소<br/>개인 정보 보유 및 이용 기간: 2026년 01월 02일 (이용 목적 달성 후 3개월 내 파기)</li>
                      <li>개인 정보 오기로 인한 경품 재발송은 불가능합니다. 개인 정보를 꼭 확인해 주세요.</li>
                      <li>경품 발송을 위해 개인 정보가 서비스사와 배송 업체에 제공됩니다. <br/>(주)모바일이앤엠애드 사업자등록번호 : 215-87-19169, (주) 카카오 120-81-47521, ㈜ 다우기술 220-81-02810</li>
                      <li>경품은 당첨자 발표 이후 순차적으로 발송되며 유효기간 만료로 인한 연장 및 재발송은 불가합니다.</li>
                    </ul>
                    :
                    <ul className="privacyList">
                      <li>이용목적 : 경품 발송 및 고객 문의 응대</li>
                      <li>수집하는 개인정보 : 성명, 재직 학교, 학교 주소, 수령처, 휴대전화번호<br/>※ 학교 주소와 학급 학생 수, 수령처는 이벤트 2 당첨 시 상품을 발송하기 위해 수집합니다.</li>
                      <li>개인 정보 보유 및 이용 기간: 2026년 01월 02일까지(이용 목적 달성 시 즉시 파기)</li>
                      <li>개인 정보 오기로 인한 경품 재발송은 불가능합니다. 개인 정보를 꼭 확인해 주세요.</li>
                      <li>경품 발송을 위해 개인 정보가 서비스사와 배송 업체에 제공됩니다. <br/>아기자기 선물가게 사업자등록번호: 530-31-00427</li>
                      <li>경품은 당첨자 발표 이후 순차적으로 발송되며, 학급 학생 대상 이벤트의 경우 간식 배송을 위해 선생님께 연락드릴 수 있습니다.</li>
                    </ul>
                  }

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