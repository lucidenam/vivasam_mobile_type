import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import InfoText from "./InfoText";
import * as joinActions from "../../store/modules/join";
import * as baseActions from "../../store/modules/base";
import {initializeGtag} from "store/modules/gtag";
import * as api from "../../lib/api";
import * as common from "../../lib/common";
import SubjectSelectContainer from "../../containers/login/SubjectSelectContainer";
import moment from "moment";

class joinConvertAccout extends Component {
	state = {
		resultMessage: '',
		resultClassName: '',
		oldPasswordMessage: '',
		oldPasswordClassName: '',
		passwordRule: false,
		passwordMessage: '',
		passwordClassName: '',
		passwordCheckMessage: '',
		passwordCheckClassName: '',
		joinModifyInfoEventYn: 'N',
		telephoneCheck: false,
		min: moment().subtract(74, 'years').format("YYYY-MM-DD"),
		max: moment().subtract(24, 'years').format("YYYY-MM-DD"),
		gradeVisible: false,
		subjectVisible: true,
		gradeSubVisible: false,
		subjectAddVisible: false,
		subjectCode: 'SC000',
		findOnclick: false, // true : 클릭 불가 상태 , false : 클릭 가능 상태

		// 450 이벤트 관련 속성
		checkEvent450Progress: true, /* 449, 450 이벤트 종료후 false 로 처리 하여 불필요한 체크 없도록 변경할 것 */
		progressReco: false,
		initReco: '',
		validInitReco: false,
		validReco: false,

	}

	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-HRYH9929GX', {
			'page_path': '/join/joinConvert',
			'page_title': '비밀번호 입력｜비바샘'
		});

		this._isMounted = true;
		const {agree, info, history, JoinActions} = this.props;

		//패스워드 재입력하게함
		info.oldPassword = '';
		info.password = '';
		info.passwordCheck = '';
		JoinActions.pushValues({type: "info", object: info});

		// if (this.props.test) {
		// 	agree = {
		// 		service: true,
		// 		privacy: true,
		// 	};
		// 	info = {
		// 		userName: '홍길동',
		// 		email: 'test@naver.com',
		// 		gender: 'M',
		// 		birthDay: '1999-01-02'
		// 	}
		// }

	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	constructor(props) {
		super(props);
		this.Checkpassword = React.createRef();
		this.NewPassword = React.createRef();
	}

	goOtherPage = async (path) => {
		const {PopupActions, history} = this.props;
		await PopupActions.closePopup();
		history.push(path);
	}

	handleChange = (e) => {
		const {info, JoinActions} = this.props;
		info[e.target.name] = e.target.value;
		JoinActions.pushValues({type: "info", object: info});

		if (e.target.name === "oldPassword") {
			if (this.refs.NewPassword.value) {
				this.checkpassword2(this.refs.NewPassword.value);
			}
		} else if (e.target.name === "password") {
			this.checkpassword2(e.target.value);
			if (this.refs.Checkpassword.value) {
				this.setPassWordCheckMessage(this.refs.Checkpassword.value);
			}
		} else if (e.target.name === "passwordCheck") {
			this.setPassWordCheckMessage(e.target.value);
		}
	}

	setPassWordCheckMessage = (value) => {
		let clazz = 'point_red';
		let text = "입력하신 비밀번호와 일치하지 않습니다.";
		if (this.checkpassword()) {
			clazz = 'point_color_blue';
			text = "동일한 비밀번호 입니다.";
		} else if (value === "") {
			text = "";
		}
		if (this._isMounted) {
			this.setState({
				passwordCheckMessage: text,
				passwordCheckClassName: clazz
			});
		}
	}

	//암호 규칙 확인
	checkpassword2 = (e) => {
		const {info} = this.props;
		let pass = e.target.value;
		let pattern1 = /[0-9]/;
		let pattern2 = /[a-zA-Z]/;
		let pattern3 = /[!@#$%^&*()?_~]/;
		let chk = 0;
		let text = '';
		let clazz = 'mt5 point_red';
		let ruleCheck = false;
		if (pass.search(/[0-9]/g) !== -1) chk++;
		if (pass.search(/[a-zA-Z]/ig) !== -1) chk++;
		if (pass.search(/[!@#$%^&*()?_~]/g) !== -1) chk++;
		if (pass === "") {
			clazz = ''
			text = "";
		} else if (pass.length < 8) {
			text = "최소 8자 이상 작성해주세요.";
		} else if (chk < 2) {
			text = "영문, 숫자 조합으로 10자 이상 혹은 특수문자 포함하여 \n" + "8자 이상으로 입력해주세요.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
			text = "8자 이상으로 입력해주세요.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
			text = "영문, 숫자 조합으로 10자 이상 혹은 특수문자 포함하여 \n" + "8자 이상으로 입력해주세요.";
		} else if (pass.indexOf(info.userId) > -1 && info.userId !== "") {
			text = "사용 가능한 비밀번호입니다.";
		} else {
			clazz = 'mt5 point_color_blue';
			text = "사용하실 수 있는 비밀번호 입니다.";
			ruleCheck = true;
		}
		this.setState({
			passwordClassName: clazz,
			passwordMessage: text,
			passwordRule: ruleCheck
		});
		this.handleChange(e);
	}

	//동일 암호 확인
	checkpassword = () => {
		const {info} = this.props;
		if (info.password !== info.passwordCheck) {
			return false;
		}
		return true;
	}

	handleClick = async (e) => {
		e.preventDefault();
		const {info, history} = this.props;
		let clazz = 'point_red';
		let obj = {result: false, message: ''}
		let checkpassword2 = this.checkpassword2(info.password);

		if (!info.password) {
			obj.message = '새 비밀번호를 입력해주세요.';
		} else if (!checkpassword2.passwordRule) {
			console.log(checkpassword2.passwordRule)
			obj.message = checkpassword2.passwordMessage;
		} else if (!info.passwordCheck) {
			obj.message = '새 비밀번호 확인란에 입력해주세요.';
		} else if (info.password !== info.passwordCheck) {
			obj.message = '입력하신 비밀번호와 일치하지 않습니다.';
		} else {
			obj.result = true;
		}
		if (this._isMounted) {
			this.setState({
				resultMessage: obj.message,
				resultClassName: clazz
			});
		}

		if (obj.result) {
			this.changePassword();
		}
	}

	changePassword = async () => {
		const {info, history, memberId, BaseActions, check, uuid, userId, tschUserId, newUserId} = this.props;
		console.log()

		try {
			let message = '';
			let clazz = 'point_red';
			let isValid = false;
			BaseActions.openLoading();

			const code = await api.insertSsoConversionJoin({
				uuid : uuid,
				userId : userId,
				tschUserId : tschUserId,
				newUserId : newUserId,
				password : info.password,
			});


			if (code.data === '0000') {
				common.info("통합회원 전환이 완료되었습니다. \n이제 비바샘과 비바샘 연수원 서비스를 하나의 아이디로 이용하실 수 있습니다.");
				this.goOtherPage('/');
			} else if (code.data === '1111') {
				common.error("서버측 에러가 발생했습니다. \n잠시후 다시 이용해주세요.");
			} else if (code.data === '3333') {
				common.info("필수 약관에 전부 동의해주세요.");
				this.goOtherPage('/join/agree');
			} else if (code.data === '4444') {
				common.info("아이디 혹은 비밀번호 입력이 필요합니다.");
			} else {
				common.error("서버측 에러가 발생했습니다. \n잠시후 다시 이용해주세요.");
			}

			if (this._isMounted) {
				this.setState({
					resultMessage: message,
					resultClassName: clazz
				});
			}
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 100);//의도적 지연.
		}
	}



	handleGoPage = async (path) => {
		const {PopupActions, history} = this.props;
		await PopupActions.closePopup();
		history.push(path);
	}

	render() {
		const {memberEmail, info} = this.props;
		const {
			resultMessage,
			oldPasswordMessage,
			passwordMessage,
			passwordCheckMessage,
			resultClassName,
			oldPasswordClassName,
			passwordClassName,
			passwordCheckClassName,
			phoneCheckMessage,
			phoneCheckClassName,
			min,
			max,
		} = this.state;
		return (
			<Fragment>
				{/*<div id="sticky" className="step_wrap">*/}
				{/*	<h2 className="step_tit">회원 정보 입력</h2>*/}
				{/*	<div className="step_num_box">*/}
				{/*		<span className="step_num">1</span>*/}
				{/*		<span className="step_num active"><span className="blind">현재페이지</span>2</span>*/}
				{/*		<span className="step_num">3</span>*/}
				{/*	</div>*/}
				{/*</div>*/}
				<section className="join renew renew07">
					<div className="join_use">
						<div className="join_info">
							<h2 className="info_tit">
								<label htmlFor="ipt_name">이름</label>
							</h2>
							<div className="input_wrap mb25">
								<input
									type="text"
									id="ipt_name"
									value={info.userName}
									className="input_sm"
									readOnly/>
							</div>
							<h2 className="info_tit"><label htmlFor="ipt_id">아이디</label></h2>
							<div className="input_wrap">
								<input
									type="text"
									name="userId"
									ref="userId"
									autoCapitalize="none"
									placeholder="4~12자 영문 또는 영문, 숫자 조합"
									id="ipt_id"
									onChange={this.handleChange}
									value={info.userId}
									className="input_sm"/>
								<button
									type="button"
									onClick={this.duplicateIdClick}
									className="input_in_btn btn_gray">중복확인
								</button>
							</div>
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_pw">비밀번호</label>
							</h2>
							<div className="input_wrap mb5">
								<input
									type="password"
									placeholder="영문+숫자 10자 이상/영문+숫자+특수문자 8자 이상"
									id="ipt_pw"
									name="password"
									ref="password"
									onChange={this.checkpassword2}
									value={info.password}
									className="input_sm"/>
							</div>
							<InfoText message={passwordMessage} className={passwordClassName}/>
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_pw_certify">
									비밀번호 확인
								</label>
							</h2>
							<div className="input_wrap">
								<input
									type="password"
									placeholder="비밀번호를 입력하세요"
									id="ipt_pw_certify"
									name="passwordCheck"
									onChange={this.handleChange}
									value={info.passwordCheck}
									ref="Checkpassword"
									className="input_sm"/>
							</div>
							<InfoText message={passwordCheckMessage} className={passwordCheckClassName}/>
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_email">이메일</label>
							</h2>
							<div className="input_wrap mb25 has_btn">
								<input
									type="email"
									placeholder="이메일을 입력하세요."
									id="ipt_email"
									name="email"
									ref="email"
									onChange={this.handleChange}
									value={info.email}
									className="input_sm"/>
								<button type="button"
										className="input_in_btn btn_gray"
										onClick={this.duplicateEmailClick}>중복확인
								</button>
							</div>
							{info.type === 'IPIN' && (
								<Fragment>
									<h2 className="info_tit">
										<label htmlFor="ipt_phone">휴대전화번호</label>
									</h2>
									<div className="input_wrap mb25">
										<input
											type="tel"
											placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
											id="ipt_phone"
											name="telephone"
											ref="telephone"
											onChange={this.phonecheck}
											value={info.telephone}
											maxLength="13"
											className="input_sm" readOnly={info.type === 'NICE'}/>
									</div>
									<InfoText message={phoneCheckMessage} className={phoneCheckClassName}/>
								</Fragment>
							)}
							<h2 className="info_tit">
								<label htmlFor="ipt_phone">휴대전화번호</label>
							</h2>
							<div className="input_wrap mb25">
								<input
									type="tel"
									placeholder="휴대전화번호 입력하세요 (예 : 010-2345-6789)"
									id="ipt_phone"
									name="telephone"
									ref="telephone"
									// onChange={this.phonecheck}
									// value={info.telephone}
									maxLength="13"
									className="input_sm" readOnly={info.type === 'NICE'}/>
							</div>
							<h2 className="info_tit mt25">
								<label htmlFor="ipt_address">주소</label>
							</h2>
							<div className="input_wrap">
								<input
									type="text"
									value={info.zipNo}
									className="input_sm"
									ref="zipNo"
									readOnly/>
								<button
									type="button"
									className="input_in_btn btn_gray"
									onClick={this.openPopupAddress}>우편번호 검색
								</button>
							</div>
							<div className="input_wrap mt5" style={{display: info.address !== '' ? 'block' : 'none'}}>
								<input
									type="text"
									id="ipt_address"
									value={info.address}
									className="input_sm"
									readOnly/>
							</div>
							<div className="input_wrap mt5 mb25">
								<input
									type="text"
									placeholder="상세주소를 입력"
									id="ipt_detail_address"
									name="addressDetail"
									ref="addressDetail"
									onChange={this.handleChange}
									value={info.addressDetail}
									className="input_sm"/>
							</div>

							<h2 className="info_tit"><label htmlFor="ipt_birth">생년월일</label></h2>
							<div className="input_wrap">
								<input type="text" className="input_sm"
									   value={info.birthDay}
									   onChange={this.handleChange}
									min={min}
									max={max}
									   required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" readOnly/>
							</div>

							<h2 className="info_tit mt25">
								<label htmlFor="ipt_gender">성별</label>
							</h2>
							<div className="input_wrap">
								<ul className="join_ipt_chk">
									<li className="join_chk_list">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_gender01"
											name="gender"
											ref="gender"
											value="M"
											// checked={info.gender === 'M'} disabled={info.gender !== 'M'} readOnly
										/>
										<label htmlFor="ipt_gender01">남자</label>
									</li>
									<li className="join_chk_list">
										<input
											type="radio"
											className="checkbox_circle"
											id="ipt_gender02"
											name="gender"
											value="F"
											// checked={info.gender === 'F'} disabled={info.gender !== 'F'} readOnly
										/>
										<label htmlFor="ipt_gender02">여자</label>
									</li>
								</ul>
							</div>

							<h2 className="info_tit mt25">회원 유형</h2>
							<ul className="category_list">
								<li>
									<input type="radio" name="join_category" id="join_category1"/>
									<label htmlFor="join_category1"><p>학교선생님</p></label>
								</li>
								<li>
									<input type="radio" name="join_category" id="join_category2"/>
									<label htmlFor="join_category2"><p>교육 대학생</p></label>
								</li>
								<li>
									<input type="radio" name="join_category" id="join_category3"/>
									<label htmlFor="join_category3"><p>교육전문직원<br /><span>(유치원/교육청)</span></p></label>
								</li>
								<li>
									<input type="radio" name="join_category" id="join_category4"/>
									<label htmlFor="join_category4"><p>일반</p></label>
								</li>
							</ul>

							<h2 className="info_tit mt25"><label htmlFor="ipt_belong">소속</label></h2>
							<div className="input_wrap">
								<input
									type="text"
									name="userBelong"
									ref="userBelong"
									autoCapitalize="none"
									placeholder="소속을 선택해 주세요"
									id="ipt_belong"
									// onChange={this.handleChange}
									// value={info.userBelong}
									className="input_sm bgfff"/>
								<button
									type="button"
									// onClick={this.duplicateIdClick}
									className="input_in_btn btn_gray">소속 검색
								</button>
							</div>

							<button
								className="btn_full_on mt25">
								통합회원 전환하기
							</button>

							<div className="info_tell">
								<div className="tell_box type02">
									<div className="line_box">
										<p className="line_box_tit">비바샘 선생님 전용 고객센터</p>
										<a href="tel:1544-7714" className="ico_tel">
											<img src="../images/member/tell2.png" alt="비바샘 선생님 전용 고객센터"/>
											<span className="blind">1544-7714</span>
										</a>
									</div>
									<div className="line_box">
										<p className="line_box_tit">비바샘 연수원 고객센터</p>
										<a href="tel:1544-9044" className="ico_tel">
											<img src="../images/member/tell3.png" alt="비바샘 연수원 고객센터"/>
											<span className="blind">1544-9044</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		test: state.join.get('test'),
		type: state.join.get('type').toJS(),
		agree: state.join.get('agree').toJS(),
		check: state.join.get('check').toJS(),
		info: state.join.get('info').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		PopupActions: bindActionCreators(popupActions, dispatch)
	})
)(withRouter(JoinSsoPwdResetPwdPopup));
