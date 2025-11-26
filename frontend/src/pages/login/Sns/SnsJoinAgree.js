import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';
import TermsSpecialPopup from 'components/login/TermsSpecialPopup';
import TermsServicePopup from 'components/login/TermsServicePopup';
import TermsPrivacyAgreePopup from 'components/login/TermsPrivacyAgreePopup';
import TermsMarketingPopup from 'components/login/TermsMarketingPopup';
import TermsThirdPrivacyPopup from 'components/login/TermsThirdPrivacyPopup';
import TermsTschServicePopup from 'components/login/TermsTschServicePopup';
import TermsTschPrivacyPopup from 'components/login/TermsTschPrivacyPopup';
import TermsThirdMarketingPopup from 'components/login/TermsThirdMarketingPopup';
import {initializeGtag} from "../../../store/modules/gtag";
import PersonalIdentification from "../../../components/login/PersonalIdentification";

class JoinAgree extends Component {

	constructor(props) {
		super(props);
		this.all = React.createRef();
	}

	state = {
		checkGoNext: false
	}

	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/sns/join/agree',
			'page_title': '약관 동의 | 회원가입｜비바샘'
		});

		const {  agree, JoinActions } = this.props;

		agree.mTypeCd = '0';
		agree.special = false;
		agree.service = false;
		agree.privacy = false;
		agree.marketing = false;
		agree.tschService = false;
		agree.tschPrivacy = false;
		agree.thirdMarketing = false;
		agree.all = false;
		JoinActions.pushValues({type: "agree", object: agree});

		this.checkPossibleGoNext();
		this.setUseMember();
	}

	setUseMember = async () => {
		let {info, history} = this.props;
		let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginParameter == null || info.telephone == '') return;
		const response = await api.isSnsMemberCheck(info.telephone, snsLoginParameter.email);
		if (response.data)  {
			window.location.href = "/#/sns/linkage/link";
		}
	}

	handleChange = (e) => {
		const {type, agree, JoinActions} = this.props;
		if (e.target.name === "all") {
			for (var key in agree) {
				if (key === 'mTypeCd') {
					continue;
				}
				agree[key] = e.target.checked;
			}
			agree.thirdPrivacy = true;

		} else if(e.target.name === "mTypeCd") {
			agree[e.target.name] = e.target.value;
		} else {
			// 부분 클릭시
			agree.all = false;
			agree[e.target.name] = e.target.checked;

			agree.thirdPrivacy = true;
		}

		//console.log('handleChange AGREE (default) :: ' + agree);
		JoinActions.pushValues({type: "agree", object: agree});

		this.checkPossibleGoNext();
	}

	checkPossibleGoNext = () => {
		let checkNext = false;
		// 일반 회원가입
		if (this.props.agree.all || (this.props.agree.service && this.props.agree.privacy)) {
			checkNext = true;
		}
		this.setState({checkGoNext: checkNext});
	}

	/*nextButtonClickSafe = (e) => {
		this.nextButtonClick(e.target);
	}*/

	/*nextButtonClick = (target) => {
		const {BaseActions, history, type, agree} = this.props;
		try {
			// SNS로그인에서는 통합회원가입이 안됨
			type.ssoMember = false;
			target.disabled = true;
			let checkFlag = false;
			if (agree.all || (agree.service && agree.privacy)) {
				checkFlag = true;
			}

			if (checkFlag) {
				BaseActions.openLoading();
				history.push('/sns/join/info');
			} else {
				// common.error("위 필수 내용에 모두 동의 후 진행 가능합니다.");
				target.disabled = false;
				this.refs.all.focus();
			}
		} catch (e) {
			target.disabled = false;
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	}*/

	openPopupTerms = (e) => {
		e.preventDefault();
		const {PopupActions} = this.props;
		let container;
		let title;
		switch (e.target.name) {
			case 'special':
				container = <TermsSpecialPopup/>;
				title = '비상교육 선생님 통합회원 서비스 특별약관';
				break;
			case 'service':
				container = <TermsServicePopup/>;
				title = <Fragment>서비스 이용약관</Fragment>;
				break;
			case 'privacy':
				container = <TermsPrivacyAgreePopup/>;
				title = <Fragment>개인정보 수집 및 이용 동의</Fragment>
				break;
			case 'marketing':
				container = <TermsMarketingPopup/>;
				title = <Fragment>마케팅 및 광고 활용 동의</Fragment>;
				break;
			case 'thirdPrivacy':
				container = <TermsThirdPrivacyPopup/>;
				title = <Fragment>개인정보 제3자 제공에 대한 동의</Fragment>;
				break;
			case 'tschService':
				container = <TermsTschServicePopup/>;
				title = <Fragment><span>(비바샘 연수원)</span> 서비스 이용약관</Fragment>;
				break;
			case 'tschPrivacy':
				container = <TermsTschPrivacyPopup/>;
				title = <Fragment><span>(비바샘 연수원)</span> 개인정보 수집 및 이용 동의</Fragment>;
				break;
			case 'thirdMarketing':
				container = <TermsThirdMarketingPopup/>;
				title = <Fragment><span>(비바샘 연수원)</span> 교육청 위탁연수 정보 및 마케팅 정보 활용 동의</Fragment>;
				break;
			default:
				break;
		}
		PopupActions.openPopup({title: title, componet: container, wrapClassName:"auto_content"});
	}

	checkSession = async () => {
		const {history} = this.props;
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo == null || typeof snsLoginInfo == 'undefined') {
			history.replace('/#/join/select');
			return false;
		}
	}

	/*isUserInfoCheck = () => {
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo.phoneNumber == null) {
			return true;
		}
		return false;
	}*/

	render() {
		const {type, agree, info} = this.props;
		this.checkSession();

		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">약관 동의 및 본인인증</h2>
					<div className="step_num_box">
						<span className="step_num active"><span className="blind">현재페이지</span>1</span>
						<span className="step_num">2</span>
						<span className="step_num">3</span>
					</div>
				</div>
				<section className="join renew07">
					<div className="join_agree">
						<div className="join_info">
							<h2>회원 유형</h2>
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
							</ul>
						</div>
						<div className="join_info agree">
							{/*<h2>약관동의</h2>*/}
							{/*/!* <!-- // 통합 회원 가입시에만 - 통합회원 특별 약관 --> *!/*/}
							{/*<h3 className="join_check_title">비상교육 비바샘</h3>*/}

							{/*{type.ssoMember === true && (*/}
							{/*	<Fragment>*/}
							{/*		<h3 className="join_check_title">통합회원 특별 약관</h3>*/}
							{/*		<ul>*/}
							{/*			<li className="join_check_list">*/}
							{/*				<div className="join_check_box">*/}
							{/*					<input type="checkbox" className="checkbox_circle"*/}
							{/*						   id="special"*/}
							{/*						   checked={agree.special}*/}
							{/*						   onChange={this.handleChange}*/}
							{/*						   ref="special"*/}
							{/*						   name="special"/>*/}
							{/*					<label htmlFor="special">*/}
							{/*						<strong className="join_check_tit">비상교육 선생님 통합회원 서비스 특별 약관 <span*/}
							{/*							className="marker">(필수)</span></strong>*/}
							{/*					</label>*/}
							{/*				</div>*/}
							{/*				<a className="join_btn_arrow"*/}
							{/*				   name="special"*/}
							{/*				   onClick={this.openPopupTerms}>약관페이지 이동</a>*/}
							{/*			</li>*/}
							{/*		</ul>*/}
							{/*	</Fragment>*/}
							{/*)}*/}
							{/* <!-- // 통합 회원 가입시에만 - 통합회원 특별 약관 --> */}
							<h3 className="join_check_title">약관동의</h3>
							<ul>
								<li className="join_check_list">
									<div className="join_check_box">
										<input type="checkbox" className="checkbox_circle"
											   id="service"
											   checked={agree.service}
											   onChange={this.handleChange}
											   ref="service"
											   name="service"/>
										<label htmlFor="service">
											<strong className="join_check_tit">서비스 이용약관 동의 <span
												className="marker">(필수)</span></strong>
										</label>
									</div>
									<a className="join_btn_arrow"
									   name="service"
									   onClick={this.openPopupTerms}>약관페이지 이동</a>
								</li>
								<li className="join_check_list">
									<div className="join_check_box">
										<input type="checkbox" className="checkbox_circle"
											   id="privacy"
											   checked={agree.privacy}
											   onChange={this.handleChange}
											   ref="privacy"
											   name="privacy"/>
										<label htmlFor="privacy">
											<strong className="join_check_tit">개인정보 수집 및 이용 동의 <span
												className="marker">(필수)</span></strong>
										</label>
									</div>
									<a className="join_btn_arrow"
									   name="privacy"
									   onClick={this.openPopupTerms}>약관페이지 이동</a>
								</li>
								<li className="join_check_list">
									<div className="join_check_box">
										<input type="checkbox" className="checkbox_circle"
											   id="marketing"
											   checked={agree.marketing}
											   onChange={this.handleChange}
											   ref="marketing"
											   name="marketing"/>
										<label htmlFor="marketing">
											<strong className="join_check_tit">마케팅 및 광고 활용 동의 <span
												className="txt_note">(선택)</span></strong>
										</label>
									</div>
									<a className="join_btn_arrow"
									   name="marketing"
									   onClick={this.openPopupTerms}>약관페이지 이동</a>
								</li>
							</ul>
							{/* <!-- 통합 회원 가입시에만 - 티스쿨원격교육연수원 약관 --> */}
							{/*{type.ssoMember === true && (*/}
							{/*	<Fragment>*/}
							{/*		<h3 className="join_check_title">비바샘 원격교육연수원</h3>*/}
							{/*		<ul>*/}
							{/*			<li className="join_check_list">*/}
							{/*				<div className="join_check_box">*/}
							{/*					<input type="checkbox" className="checkbox_circle"*/}
							{/*						   id="tschService"*/}
							{/*						   checked={agree.tschService}*/}
							{/*						   onChange={this.handleChange}*/}
							{/*						   ref="tschService"*/}
							{/*						   name="tschService"/>*/}
							{/*					<label htmlFor="tschService">*/}
							{/*						<strong className="join_check_tit">서비스 이용약관 동의 <span*/}
							{/*							className="marker">(필수)</span></strong>*/}
							{/*					</label>*/}
							{/*				</div>*/}
							{/*				<a className="join_btn_arrow"*/}
							{/*				   name="tschService"*/}
							{/*				   onClick={this.openPopupTerms}>약관페이지 이동</a>*/}
							{/*			</li>*/}
							{/*			<li className="join_check_list">*/}
							{/*				<div className="join_check_box">*/}
							{/*					<input type="checkbox" className="checkbox_circle"*/}
							{/*						   id="tschPrivacy"*/}
							{/*						   checked={agree.tschPrivacy}*/}
							{/*						   onChange={this.handleChange}*/}
							{/*						   ref="tschPrivacy"*/}
							{/*						   name="tschPrivacy"/>*/}
							{/*					<label htmlFor="tschPrivacy">*/}
							{/*						<strong className="join_check_tit">개인정보 수집 및 이용 동의 <span*/}
							{/*							className="marker">(필수)</span></strong>*/}
							{/*					</label>*/}
							{/*				</div>*/}
							{/*				<a className="join_btn_arrow"*/}
							{/*				   name="tschPrivacy"*/}
							{/*				   onClick={this.openPopupTerms}>약관페이지 이동</a>*/}
							{/*			</li>*/}
							{/*			<li className="join_check_list">*/}
							{/*				<div className="join_check_box">*/}
							{/*					<input type="checkbox" className="checkbox_circle"*/}
							{/*						   id="thirdMarketing"*/}
							{/*						   checked={agree.thirdMarketing}*/}
							{/*						   onChange={this.handleChange}*/}
							{/*						   ref="thirdMarketing"*/}
							{/*						   name="thirdMarketing"/>*/}
							{/*					<label htmlFor="thirdMarketing">*/}
							{/*						<strong className="join_check_tit">교육청 위탁연수 정보 및 마케팅 활용 동의 <span*/}
							{/*							className="txt_note">(선택)</span></strong>*/}
							{/*					</label>*/}
							{/*				</div>*/}
							{/*				<a className="join_btn_arrow"*/}
							{/*				   name="thirdMarketing"*/}
							{/*				   onClick={this.openPopupTerms}>약관페이지 이동</a>*/}
							{/*			</li>*/}
							{/*		</ul>*/}
							{/*	</Fragment>*/}
							{/*)}*/}
							<ul>
								<li className="join_check_list all">
									<div className="join_check_box">{/* <!-- 전체 동의 클래스 all 추가 --> */}
										<input type="checkbox" className="checkbox_circle"
											   id="all"
											   checked={agree.all}
											   onChange={this.handleChange}
											   ref="all"
											   name="all"/>
										<label htmlFor="all">
											<strong className="join_check_tit">전체동의</strong>
											<span className="join_check_txt">(약관에 모두 동의합니다)</span>
										</label>
									</div>
								</li>
							</ul>
						</div>

						<PersonalIdentification callback={this.update} isJoin={true} disabled={!this.state.checkGoNext} verificationType={'SNS'}/>

					</div>
				</section>
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		info: state.join.get('info').toJS(),
		type: state.join.get('type').toJS(),
		agree: state.join.get('agree').toJS(),
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinAgree));
