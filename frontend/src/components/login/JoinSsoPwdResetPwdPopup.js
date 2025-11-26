import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import InfoText from "./InfoText";
import * as joinActions from "../../store/modules/join";
import * as baseActions from "../../store/modules/base";
import * as api from "../../lib/api";
import * as common from "../../lib/common";
import {initializeGtag} from "store/modules/gtag";

class JoinSsoPwdResetPwdPopup extends Component {
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
	}

	componentDidMount() {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/verifyResult',
			'page_title': '비밀번호 입력｜비바샘'
		});
		this._isMounted = true;
		const {info, history, JoinActions} = this.props;

		//패스워드 재입력하게함
		info.oldPassword = '';
		info.password = '';
		info.passwordCheck = '';
		JoinActions.pushValues({type: "info", object: info});
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
		let text = "비밀번호가 일치하지 않습니다. 다시 입력해 주세요.";
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
		const {info, memberId} = this.props;
		let pass = value;
		let pattern1 = /[0-9]/;
		let pattern2 = /[a-zA-Z]/;
		let pattern3 = /[!@#$%^&*()?_~]/;
		let chk = 0;
		let text = '';
		let clazz = 'point_red';
		let ruleCheck = false;
		if (pass.search(/[0-9]/g) !== -1) chk++;
		if (pass.search(/[a-zA-Z]/ig) !== -1) chk++;
		if (pass.search(/[!@#$%^&*()?_~]/g) !== -1) chk++;
		if (pass === "") {
			clazz = ''
			text = "";
		} else if (pass.length < 8) {
			text = "최소 8자 이상으로 작성해주세요.";
		} else if (chk < 2) {
			text = "비밀번호는 숫자, 영문, 특수문자를 두가지 이상 혼용하여야 합니다.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
			text = "영문+숫자+특수문자인 경우 8자리 이상으로 구성하여야 합니다.";
		} else if (pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
			text = "영문+숫자인 경우 10자리 이상으로 구성하여야 합니다.";
		} else if (pass.indexOf(memberId) > -1 && memberId !== "") {
			text = "비밀번호는 아이디를 포함할 수 없습니다.";
		} else {
			clazz = 'point_color_blue';
			text = "사용하실 수 있는 비밀번호 입니다.";
			ruleCheck = true;
		}
		let obj = {
			passwordClassName: clazz,
			passwordMessage: text,
			passwordRule: ruleCheck
		}
		if (this._isMounted) {
			this.setState(obj);
		}
		return obj;
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
			passwordCheckClassName
		} = this.state;
		return (
			<section id="pop_content">
				<h2 className="blind">
					통합회원 비밀번호 재설정
				</h2>
				<div className="persnal_cont">
					<h2 className="info_tit mt30">
						<label htmlFor="ipt_password_new">
							새 비밀번호
						</label>
					</h2>
					<input
						type="password"
						placeholder="새 비밀번호를 입력하세요"
						className="input_sm mb5"
						name="password"
						onChange={this.handleChange}
						value={info.password}
						ref="NewPassword"
						id="ipt_password_new"/>
					<InfoText message={passwordMessage} className={passwordClassName}/>
					<h2 className="info_tit mt30">
						<label htmlFor="ipt_password_new2">
							새 비밀번호 확인
						</label>
					</h2>
					<input
						type="password"
						placeholder="새 비밀번호를 입력하세요"
						className="input_sm mb5"
						name="passwordCheck"
						onChange={this.handleChange}
						value={info.passwordCheck}
						ref="Checkpassword"
						id="ipt_password_new2"/>
					<InfoText message={passwordCheckMessage} className={passwordCheckClassName}/>
					<a
						href="#"
						onClick={this.handleClick}
						className="btn_round_on btn_round_big mt30">
						통합회원 전환하기
					</a>
					<div className="find_validate">
						<InfoText message={resultMessage} className={resultClassName}/>
					</div>
				</div>
			</section>
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
