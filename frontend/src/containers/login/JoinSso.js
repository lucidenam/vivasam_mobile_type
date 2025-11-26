import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import InfoText from 'components/login/InfoText';
import * as popupActions from 'store/modules/popup';
import * as joinActions from "../../store/modules/join";
import * as baseActions from "../../store/modules/base";
import {initializeGtag} from "store/modules/gtag";
import * as api from "../../lib/api";
import * as common from "../../lib/common";
import SubjectSelectContainer from "../../containers/login/SubjectSelectContainer";
import moment from "moment";
import FindSchool from "./FindSchool";

class JoinSso extends Component {
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
		joinComplete:false,

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
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/sso',
			'page_title': '본인 인증 결과｜비바샘'
		});

		let {info, history, JoinActions, sso} = this.props;

		//이전 값 없으면 회원가입 첫페이지로
		if (!sso.uuid || !sso.newUserId) {
			history.replace('/join/agree');
		}

		this._isMounted = true;

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
		this.password = React.createRef();
	}

	handleChange = (e) => {
		const {info, agree, JoinActions} = this.props;

		if(e.target.name === "mTypeCd") {
			agree[e.target.name] = e.target.value;
			JoinActions.pushValues({type: "agree", object: agree});
		} else {
			info[e.target.name] = e.target.value;
			JoinActions.pushValues({type: "info", object: info});

			if (e.target.name === "password") {
				this.checkpassword2(e.target.value);
				if (this.refs.Checkpassword.value) {
					this.setPassWordCheckMessage(this.refs.Checkpassword.value);
				}
			} else if (e.target.name === "passwordCheck") {
				this.setPassWordCheckMessage(e.target.value);
			}
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
	checkpassword2 = (value) => {
		const {info} = this.props;

		let pass = value;
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

	}

	//동일 암호 확인
	checkpassword = () => {
		const {info} = this.props;
		if (info.password !== info.passwordCheck) {
			return false;
		}
		return true;
	}

	openPopupSchool = () => {
		const { PopupActions } = this.props;
		PopupActions.openPopup({ title: "소속 검색", component: <FindSchool handleSetSchool={this.handleSetSchool} /> });
	}

	handleSetSchool = async (obj) => {
		let { school, PopupActions, JoinActions } = this.props;

		//학년, 내교과 hidden
		this.setState({
			gradeVisible: obj.schoolGrade !== 'E' ? false : true,
			subjectVisible: obj.schoolGrade !== 'E' ? true : false,
			subjectAddVisible: false,
			gradeSubVisible: true,
		});
		//내교화 초기화
		school.mainSubject = '';
		school.secondSubject = '';
		//담당 학년 초기화
		school.myGrade = '';
		for (var key in school.grade) {
			school.grade[key].checked = false;
		}

		await JoinActions.pushValues({ type: "school", object: { ...school, ...obj } });

		PopupActions.closePopup();
	}

	insertSsoConversionJoinClick = (e) => {
		e.preventDefault();
		const {info, school, agree} = this.props;
		let clazz = 'point_red';
		let obj = {result: false, message: ''}
		this.checkpassword2(info.password);

		if (!info.password) {
			obj.message = '비밀번호를 입력해주세요.';
		} else if (!this.state.passwordRule) {
			obj.message = this.state.passwordMessage;
		} else if (!info.passwordCheck) {
			obj.message = '비밀번호 확인란에 입력해주세요.';
		} else if (info.password !== info.passwordCheck) {
			obj.message = '입력하신 비밀번호와 일치하지 않습니다.';
		} else if (!agree.mTypeCd) {
			obj.message = '회원 유형을 입력해주세요.';
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
			this.insertSsoConversionJoin();
		}
	}

	insertSsoConversionJoin = async () => {
		const {info, school, agree, history, sso, BaseActions} = this.props;

		try {
			BaseActions.openLoading();

			let snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
			let snsObject = null;
			if (snsLoginInfo != null) {
				snsObject = {
					'snsId': snsLoginInfo.id,
					'snsType': snsLoginInfo.type,
					'accessToken': snsLoginInfo.accessToken,
					'snsPhoneNumber': snsLoginInfo.phoneNumber,
					'snsYear': snsLoginInfo.year,
					'snsName': snsLoginInfo.name,
					'snsEmail': snsLoginInfo.email,
				}
			}

			const code = await api.insertSsoConversionJoin({...sso, ...school, ...agree, ...info, ...snsObject});


			if (code.data === '0000') {
				//common.info("통합회원 전환이 완료되었습니다. \n이제 비바샘과 비바샘 연수원 서비스를 하나의 아이디로 이용하실 수 있습니다.");
				//history.push('/');
				//회원가입 성공
				this.setState({
					joinComplete: true
				});
			} else if (code.data === '1111') {
				common.error("서버측 에러가 발생했습니다. \n잠시후 다시 이용해주세요.");
			} else if (code.data === '3333') {
				common.info("필수 약관에 전부 동의해주세요.");
				history.push('/join/agree');
			} else if (code.data === '4444') {
				common.info("아이디 혹은 비밀번호 입력이 필요합니다.");
			} else {
				common.error("서버측 에러가 발생했습니다. \n잠시후 다시 이용해주세요.");
			}

		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 100);//의도적 지연.
		}
	}

	render() {
		const {info, school, agree, check} = this.props;
		const {
			passwordMessage,
			passwordCheckMessage,
			passwordClassName,
			passwordCheckClassName,
		} = this.state;

		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">회원 정보 입력</h2>
					<div className="step_num_box">
						<span className="step_num">1</span>
						<span className="step_num">2</span>
						<span className="step_num active"><span className="blind">현재페이지</span>3</span>
					</div>
				</div>
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
									id="ipt_id"
									value={info.userId}
									className="input_sm"
									readOnly/>
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
									onChange={this.handleChange}
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


							{/*<h2 className="info_tit mt25">회원 유형</h2>
							<ul className="category_list">
								<li>
									<input type="radio" name="mTypeCd" id="mTypeCd1" value="0"
										   checked={agree.mTypeCd === '0'} onChange={this.handleChange} />
									<label htmlFor="mTypeCd1"><p>학교선생님</p></label>
								</li>
								<li>
									<input type="radio" name="mTypeCd" id="mTypeCd2" value="2"
										   checked={agree.mTypeCd === '2'} onChange={this.handleChange} />
									<label htmlFor="mTypeCd2"><p>교육 대학생</p></label>
								</li>
								<li>
									<input type="radio" name="mTypeCd" id="mTypeCd3" value="1"
										   checked={agree.mTypeCd === '1'} onChange={this.handleChange} />
									<label htmlFor="mTypeCd3"><p>교육전문직원<br /><span>(유치원/교육청)</span></p></label>
								</li>
								<li>
									<input type="radio" name="mTypeCd" id="mTypeCd4" value="3"
										   checked={agree.mTypeCd === '3'} onChange={this.handleChange} />
									<label htmlFor="mTypeCd4"><p>일반</p></label>
								</li>
							</ul>*/}

							<button
								onClick={this.insertSsoConversionJoinClick}
								className="btn_full_on mt25 noAbsolute">
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
				{/* 회원가입 완료 팝업 */}
				{ this.state.joinComplete ?
					// "/components/login/JoinCompletePopup"에 있음
					<div className="join_complete_popup">
						<div className="popup_wrap">
							<div className="txt_box">
								<h4>환영합니다!</h4>
								<p>비바샘 통합회원 가입이 완료되었습니다. <br/>로그인 후 하나의 아이디로 <br/>비바샘의 다양한 서비스를 이용해 보세요.</p>
							</div>
							<Link className="btn" to='/login'>로그인 하기<i></i></Link>
						</div>
					</div> : ''
				}
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
		info: state.join.get('info').toJS(),
		school: state.join.get('school').toJS(),
		sso: state.join.get('sso').toJS(),
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinSso));
