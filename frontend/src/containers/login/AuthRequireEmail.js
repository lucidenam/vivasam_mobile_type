import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import * as common from 'lib/common';
import {withRouter} from 'react-router-dom';
import {initializeGtag} from "store/modules/gtag";
import * as api from 'lib/api';
import * as baseActions from 'store/modules/base';
import InfoText from "../../components/login/InfoText";

class AuthRequireEmail extends Component {
	state = {
		validCertifyMail: false, // 공직자 메일인증 여부
		certifiNum: '',	// 인증코드
		uuidForCertifiNum: '',	// 인증uuid
		eMailDomain: '',
		anotherEmailDomain: '',
		certifyConfirmMessage: '',
		memberValidateEmail: '',
		privacy: false,
	}

	componentDidMount = () => {
		initializeGtag();
		function gtag() {
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/login/requireAdd',
			'page_title': '교사 인증 대기 안내｜비바샘'
		});
		const {logged, loginInfo, history, BaseActions} = this.props;
		let userId = '';
		if (logged) {
			// epki 인증이 되어있을 경우 신청 불가
			if(loginInfo.epkiYn === 'Y'){
				common.info("이미 인증이 완료된 상태입니다.");
				BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
				history.push("/");
				return;
			}
			userId = loginInfo.memberId;
			this.setState({
				userId: userId
			});
		}else{
			common.info("로그인 후 가능합니다.");
			BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
			history.push("/login");
			return;
		}
	}

	handleChangeCertifiNum = (e) => {

		this.setState({
			certifiNum: e.target.value
		});

	}

	setEmailDomain = (e) => {
		this.setState({
			eMailDomain: e.target.value,
			validCertifyMail: false,
		});
	};

	setAnotherEmailDomain = (e) => {
		if (e.target.name === 'emailDomain') {
			this.setState({
				anotherEmailDomain: e.target.value,
				validCertifyMail: false,
			})
		}
	};

	// 인증코드 발송
	sendCertifyMail = async () => {
		const {eMailDomain, anotherEmailDomain} = this.state;
		const {loginInfo} = this.props;

		if(eMailDomain === "" || anotherEmailDomain === "") {
			common.error('메일 주소를 입력해 주세요.');
			return;
		}

		let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
		let reg_email = /^[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[@]{1}[-A-Za-z0-9_]+[-A-Za-z0-9_.]*[.]{1}[A-Za-z]{2,5}$/;
		if (!reg_email.test(memberValidateEmail)) {
			common.error('올바른 이메일 형식이 아닙니다.');
			return;
		}

		const response = await api.sendCertifyMail(memberValidateEmail, false, loginInfo.memberId);
		let uuidForCertifiNum = '';

		if(response.data != '' && response.data.result == 0) {
			common.info('인증코드가 발송되었습니다.');
			uuidForCertifiNum = response.data.uuidForCertifiNum
		} else if(response.data != '' && response.data.result == 1) {
			common.info('이미 교사인증받은 메일 주소입니다.');
			return;
		} else {
			common.error("처리 중 오류가 발생 하였습니다.");
			return;
		}

		this.setState({
			validCertifyMail: false,
			certifiNum: '',
			uuidForCertifiNum: uuidForCertifiNum,
		})

	}

	// 인증코드 인증하기
	checkCertifyMail = async () => {
		const {eMailDomain, anotherEmailDomain, certifiNum, uuidForCertifiNum} = this.state;
		const {loginInfo} = this.props;

		if(certifiNum !== '' && certifiNum.length === 6 && uuidForCertifiNum !== '') {
			//서버에서 인증번호 확인
			let memberValidateEmail = eMailDomain + "@" + anotherEmailDomain;
			const response = await api.checkCertifyMail(certifiNum, uuidForCertifiNum, memberValidateEmail, loginInfo.memberId);
			if(response.data.code === '0') {
				this.setState({
					certifyConfirmMessage: '인증 완료',
					validCertifyMail: true,
					memberValidateEmail: memberValidateEmail,
				});
			} else if(response.data.code === '1') {
				common.error("인증코드를 확인해주세요.");
			} else if(response.data.code === '3') {
				common.error("인증코드가 일치하지 않습니다.\n정확한 인증 코드를 다시 확인해 주세요.\n만약 어려움이 있으시다면, ‘나중에 하기’를 선택하셔서 가입 완료 후에 교사 인증을 진행하실 수 있습니다.");
			} else {
				common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
			}
		} else {
			common.error("인증코드를 확인해주세요.");
		}
	}

	handleFormChk = async (e) => {
		const {validCertifyMail, memberValidateEmail, certifiNum, uuidForCertifiNum, privacy} = this.state;
		const {loginInfo} = this.props;

		let target = e.target;
		target.disabled = true;

		/*if(!privacy){
			common.info("위 필수 내용에 동의 후 진행 가능합니다.");
			target.disabled = false;
			return false;
		}*/
		if (!validCertifyMail) {
			common.info('공직자 메일 인증을 완료해주세요.');
			target.disabled = false;
			return false;
		}

		const response = await api.updateCertifyMail(memberValidateEmail, certifiNum, uuidForCertifiNum, loginInfo.memberId);
		if(response.data.code === '0') {
			common.info("공직자 메일 인증이 완료되었습니다.");
			window.location.hash = '/';
			window.viewerClose();
		} else if(response.data.code === '1') {
			common.error("이메일을 다시 확인해주세요.");
			target.disabled = false;
		} else {
			common.error("서버측 오류입니다. 잠시후 다시 시도해주세요.");
			target.disabled = false;
		}

	}

	handleChangeAgree = (e) => {
		this.setState({
			privacy: e.target.checked
		});
	}

	render() {
		return (
			<section className="login">
				<h2 className="blind">비바샘 교사 인증</h2>
				<div className="tcWrap renew07">
					<div className="titWrap">
						<div className="infoWrap">
							<h2>공식자 메일 인증</h2>
							<p>선생님의 공직자 메일로 발송된 인증코드를 확인해주세요.</p>
							<p>메일로 받으신 인증코드를 입력 후 [인증하기] 버튼을 클릭해 주세요.</p>
						</div>
					</div>
					<div className="tcCont">
						<div className="mail_area mt10">
							<div className="input_wrap multi_wrap email">
								<input
									type="text"
									name="email"
									ref="email"
									onChange={this.setEmailDomain}
									className="input_sm input_fix_wrap"
									// value={eMailDomain}
									value={this.state.eMailDomain}
									id="ipt_email"/>
								<span className="label_txt">@</span>
								<div className="selectbox select_sm">
									<select name="emailDomain" ref="emailDomain" id="ipt_email" className=""
											onChange={this.setAnotherEmailDomain}>
										<option value="firstDomain">선택</option>
										<option value="korea.kr">korea.kr</option>
										<option value="sen.go.kr">sen.go.kr</option>
									</select>
								</div>
							</div>
							<button className='btn_full_on btn_full_gray btn_t_mid noPosition'
									onClick={this.sendCertifyMail}>인증코드 발송
							</button>
						</div>

						<div className="input_area">
							<input type="number" name="certifiNum" placeholder="인증코드를 입력해주세요."
								   onChange={this.handleChangeCertifiNum} value={this.state.certifiNum} maxLength="13"/>
							<button className="btn_full_on btn_full_red btn_t_mid noPosition"
									onClick={this.checkCertifyMail}>인증하기
							</button>
							<InfoText message={this.state.certifyConfirmMessage}/>
						</div>

						{/*<div className="sort_alert">
							<p>
								※ 비바샘은 교사 인증 내용 확인 및 답변을 위해 회원가입 시 ​입력한<br /> 선생님의 개인정보와 서류를 수집하고 있습니다.​
							</p>
							<div className="indent_box required">
								<p>
									<strong>- 수집항목 : </strong> 성명, 아이디, 연락처(휴대폰 번호), 교사인증 서류​​
								</p>
								<p>
									<strong>- 개인정보 수집방법 :​</strong> 비바샘 교사인증 페이지를 통한 수집​​
								</p>
								<p>
									<strong>- 개인정보의 보유 및 이용 기간​ : </strong><br />
									선생님의 개인정보는 교사인증 서류 확인을 위해 서류 인증 내역에​<br /> 보관됩니다.​<br />
									개인정보는 삭제를 요청하기 전까지 최대 1년간 보관됩니다.
								</p>
							</div>
						</div>*/}

						{/*<div className=" cs_check">
							<input
								type="checkbox"
								name="privacy"
								onChange={this.handleChangeAgree}
								className="checkbox"
								id="join_agree01"/>
							<label
								htmlFor="join_agree01"
								className="checkbox_tit t2">
								<strong>
									개인정보 수집 및 이용에 대해 동의합니다.
								</strong>
							</label>
						</div>*/}
					</div>
					<div className="btn_inquiry_complete">
						<button
							className="btnTc"
							onClick={this.handleFormChk}>인증 완료
						</button>
					</div>
				</div>
			</section>
		);
	}
}

export default connect(
	(state) => ({
		authRequireId: state.base.get('authRequireId'),
		logged: state.base.get("logged"),
		loginInfo: state.base.get('loginInfo').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(AuthRequireEmail));
