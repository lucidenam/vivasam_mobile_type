import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import InfoText from "./InfoText";
import * as joinActions from "../../store/modules/join";
import * as baseActions from "../../store/modules/base";
import * as api from "../../lib/api";
import Sticky from 'react-sticky-el';
import {initializeGtag} from "store/modules/gtag";
import PwdSecurityText from "./PwdSecurityText";
import {validateResultCodeHash} from "../../lib/StringUtils";

class FindPwdResetPwdPopup extends Component {
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
			'page_path': '/myInfo/password',
			'page_title': '비밀번호 변경｜비바샘'
		});
		this._isMounted = true;
		const {info, logged, history, JoinActions} = this.props;
		//로그인 정보 없을시 return
		// if (!logged) {
		// 	history.push('/');
		// }
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
//				this.checkpassword2(this.refs.NewPassword.value);
			}
		} else if (e.target.name === "password") {
			this.checkPasswordNotice(e.target.value);
//			this.checkpassword2(e.target.value);
			if (this.refs.Checkpassword.value) {
//				this.setPassWordCheckMessage(this.refs.Checkpassword.value);
			}
		} else if (e.target.name === "passwordCheck") {
//			this.setPassWordCheckMessage(e.target.value);
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
			text = "최소 8자리 이상으로 입력해주세요.";
		} else if (chk < 2) {
			text = "비밀번호는 숫자, 영문, 특수문자를 두가지이상 혼용하여야 합니다.";
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

	checkPwdAlert = (value) => {
		const { info,loginInfo } = this.props;
		let pass = value;
		let pattern1 = /[0-9]/;
		let pattern2 = /[a-zA-Z]/;
		let pattern3 = /[!@#$%^&*()?_~]/;

		function consChr(newPwd) {
			let chrStr = [...newPwd].map(v => v.charCodeAt());
			let preStr = 0;
			let chr = 0;

			chrStr.forEach(s => {
				if (Math.abs(preStr - s) == 1) {
					chr++;
				}
				preStr = s;
			});
			return chr > 2;
		}

		function keyboardCheck(newPwd) {
			let keyboard = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

			for (let i = 0; i < newPwd.length-2; i++) {
				const sliceValue = newPwd.substring(i, i + 3);
				// 모든 조건을 한번씩 순회
				if (keyboard.some((code) => code.includes(sliceValue))) {
					return true;
				}
			}
			// 모든 조건을 넘겼을 때
			return false;
		}

		let same = /(.)\1+/;
		let cons = consChr(pass);
		let keyCheck = keyboardCheck(pass);
		let chk = 0;
		let text = '';
		let ruleCheck= false;
		if(pass.search(/[0-9]/g) !== -1 ) chk ++;
		if(pass.search(/[a-zA-Z]/ig)  !== -1 ) chk ++;
		if(pass.search(/[!@#$%^&*()?_~]/g)  !== -1  ) chk ++;

		if (info.password === '') {
			text = '새 비밀번호를 입력해주세요.';
		} else if (info.passwordCheck === '') {
			text = '새 비밀번호 확인란에 입력해주세요.';
		} else if (info.password !== info.passwordCheck) {
			text = '입력하신 비밀번호와 일치하지 않습니다.';
		} else if(pass.length < 8 ){
			text = "최소 8자리 이상으로 입력해주세요.";
		} else if(chk < 2){
			text = "비밀번호는 숫자, 영문, 특수문자를 두가지이상 혼용하여야 합니다.";
		} else if(pattern1.test(pass) && pattern2.test(pass) && pattern3.test(pass) && pass.length < 8) {
			text = "영문+숫자+특수문자인 경우 8자리 이상으로 구성하여야 합니다.";
		} else if(pattern1.test(pass) && pattern2.test(pass) && !pattern3.test(pass) && pass.length < 10) {
			text = "영문+숫자인 경우 10자리 이상으로 구성하여야 합니다.";
		} else if (pass.indexOf(loginInfo.memberId) > -1 && loginInfo.memberId !== "") {
			text = "비밀번호는 아이디를 포함할 수 없습니다.";
		} else if (info.oldPassword === info.password) {
			text = "이전 비밀번호와 같습니다.";
		} else if (same.test(pass) || cons || keyCheck) {
			text = "사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.";
		} else {
			text = "사용하실 수 있는 비밀번호 입니다.";
			ruleCheck= true;
		}
		if (!ruleCheck) {
			alert(text);
		}
		return ruleCheck;
	}

	//동일 암호 확인
	checkpassword = () => {
		const {info} = this.props;
		if (info.password !== info.passwordCheck) {
			return false;
		}
		return true;
	}

	// 비밀번호 유효성 말풍선
	checkPasswordNotice = (value) => {
		let eng_num = /^(?=.*[a-zA-Z])(?=.*[0-9]).{10,}$/;
		let eng_num_special = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~@#$!%*?&])[a-zA-Z\d~@#$!%*?&]{8,}$/;
		let text;

		if (eng_num_special.test(value)) {
			text = '안전';
		} else if (eng_num.test(value)) {
			text = '보통';
		} else {
			text = '';
		}
		let obj = {
			passwordMessage: text
		}
		if(this._isMounted){
			this.setState(obj);
		}
		return obj;
	}

	handleClick = async (e) => {
		e.preventDefault();
		const {info, history} = this.props;
		let clazz = 'point_red';
		let obj = {result: false, message: ''}
//		let checkpassword2 = this.checkpassword2(info.password);

		let result = this.checkPwdAlert(info.password);
		if (result) {
			this.changePassword();
		} else {
			return false;
		}
	}

	changePassword = async () => {
		const {info, history, memberId, uuidForCertifiNum, certifiNum, BaseActions} = this.props;
		try {
			let message = '';
			let clazz = 'point_red';
			let isValid = false;
			BaseActions.openLoading();

			const response = await api.changePassword2(memberId, info.password, uuidForCertifiNum, certifiNum);
			if (response.data.code && response.data.code === "0") {
				if (window.confirm('변경되었습니다. 비바샘 로그인 페이지로 이동합니다.')) {
					this.goOtherPage('/login');
				}
			} else if(response.data.code && (response.data.code === "1" || response.data.code === "2") ){
				message = '입력값을 다시 확인해주세요.'
				alert(message);
				return;
			} else if(response.data.code && response.data.code === "3"){
				message = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.'
				alert(message);
				return;
			} else if (response.data.code && response.data.code === "4") {
				message = '사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.'
				alert(message);
				return;
			} else if (response.data.code && response.data.code === "5") {
				message = '사용불가한 비밀번호입니다. 비밀번호를 재작성해주세요.'
				alert(message);
				return;
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
				<Sticky className={'tab_wrap'}>
					<ul className="tab tab-col2">
						<li className='tab_item'>
							<spam
								className="tab_link fpw"
							>
								<span>비밀번호 재설정</span>
							</spam>
						</li>

					</ul>
				</Sticky>
				<h2 className="blind">
					비밀번호 재설정
				</h2>
				<div className="persnal_cont renew">
					<h2 className="info_tit mt15">
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
					<PwdSecurityText type={passwordMessage}/>
					<h2 className="info_tit mt15">
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
					<a
						href="#"
						onClick={this.handleClick}
						className="btn_full_on">
						비밀번호 변경
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
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS(),
		info: state.join.get('info').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch),
		PopupActions: bindActionCreators(popupActions, dispatch)
	})
)(withRouter(FindPwdResetPwdPopup));
