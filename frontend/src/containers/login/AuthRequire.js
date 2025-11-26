import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import {Link} from 'react-router-dom';
import * as api from 'lib/api';
import {initializeGtag} from "../../store/modules/gtag";
import {FooterCopyright} from "../../components/page";
import * as baseActions from 'store/modules/base';

class AuthRequire extends Component {
	state = {
		EPK_STATUS : ''
	};
    /*
	2021-11-08 서류인증 개선(기존 서류 추가하기 팝업)
	handleOpenCertifyPopup = () => {
		const {PopupActions, authRequireId, logged, loginInfo} = this.props;
		if (logged) {
			PopupActions.openPopup({title: "비바샘 교사 인증(서류)", component: <TeacherCertify userId={loginInfo.memberId}/>});
		} else {
			PopupActions.openPopup({title: "비바샘 교사 인증(서류)", component: <TeacherCertify userId={authRequireId}/>});
		}
	}
    */

	componentDidMount = async () => {
		const {reRegister} = this.props;

		if (!reRegister) {
			let targetUrl = await this.checkEpkStatusInfo();
			if (targetUrl != '') {
				window.location.hash = targetUrl;
				window.viewerClose();
			}
		}
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/login/require',
			'page_title': '교사 인증 대기 안내｜비바샘'
		});
	}

	checkEpkStatusInfo = async () => {
		const {logged} = this.props;
		let targetUrl = '';
		if (!logged) {
			targetUrl = '/';
			return targetUrl;
		}
		const response = await api.checkEpkStatusInfo();
		let ceritfyCheck = response.data.ceritfyCheck;
		if(ceritfyCheck == 'N' || (ceritfyCheck == 'Y' && response.data.renewYn == 'Y')){
			let epkStatusInfo = response.data.epkStatusInfo;
			if(epkStatusInfo){
				let EPK_STATUS_CD = epkStatusInfo.EPK_STATUS_CD;
				if(EPK_STATUS_CD == 'Y'){
					// 답변 완료 상태
					//targetUrl = '/login/requireComplete';
					this.setState({
						EPK_STATUS : 'SUCCESS'
					})
				}else{
					// 답변 대기 상태
					//targetUrl = '/login/requireConfirm';
					this.setState({
						EPK_STATUS : 'READY'
					})
				}
			}
		}else{
			targetUrl = '/';
		}
		return targetUrl;
	}

	handleLogin = (e) => {
		e.preventDefault();
		const {BaseActions, logged} = this.props;
		if (logged) {
			//로그아웃처리
			BaseActions.logout();
			window.location.href = "/";
		} else {
			//로그인 화면으로 이동
			window.location.href = "/login";
		}
	}

	checkEpkStatus = (e) => {
		alert('현재 심사중인 서류인증이 있습니다.');
	}

	render() {
		const { loginInfo } = this.props;

		return (
			<section className="login">
				<h2 className="blind">비바샘 교사 인증</h2>
				<div className="tcWrap renew07">
					<div className="tcTit_wrap">
						<div className="tcTit">
							<h3>비바샘은 <span className="tcPoint">초 · 중 · 고등학교에서<br/>정규 수업을 진행하시는<br/>학교 선생님 대상의 교수지원</span> 서비스입니다.</h3>
							{this.state.EPK_STATUS === 'SUCCESS' ?
								<div className="txt_progress">
									<p>교사인증 <span>답변 등록</span> 되었습니다.</p>
									<Link to="/cs/qna" className="btn_inquiry">내 문의함</Link>
								</div>
								: this.state.EPK_STATUS === 'READY' ?
									<div className="txt_progress">
										<p>교사인증 <span>심사중</span> 입니다.</p>
										<Link to="/cs/qna" className="btn_inquiry">내 문의함</Link>
									</div>
									: <div></div>
							}
						</div>
					</div>
					<div className="tcCont">
						<ul className="tcSelList">
							{loginInfo.mTypeCd == '0' ?
								<Fragment>
									{/*<li>
										<span className="listTit">EPKI/GPKI 인증</span>
										<div className="listCont">
											<p>EPKI 또는 GPKI는 인증서로 인증 후<br />기간 연장 없이 바로 이용이 가능합니다.</p>
											<span className="c_o">* PC 비바샘에서 인증 가능합니다.</span>
										</div>
									</li>*/}
									<li>
										<span className="listTit">교육청 소속 교사</span>
										<div className="listCont">
											<p>
												소속 교육청 또는 교육기관에 발급된 인증서 또는<br/>
												korea.kr/sen.go.kr로 받으신 메일로<br/>영구 인증을 받으실 수 있습니다.<br/>
												<span className="c_r">* EPKI/GPKI 인증은 PC에서만 가능합니다.</span>
											</p>
											<div className="btnWrap">
												{this.state.EPK_STATUS === 'READY' ?
													<div className="btnTc arrI" onClick={this.checkEpkStatus}>공직자 메일로 인증하기<i></i></div>
													: <Link to="/login/requireEmail" className="btnTc arrI">공직자 메일로 인증하기<i></i></Link>}
											</div>
										</div>
									</li>
								</Fragment>
								:
								""
							}
							<li>
								<span className="listTit">일반 교사 / 기간제 교사</span>
								<div className="listCont">
									<p>
										최근 6개월 이내 발급된 학교 직인이 있는<br/> 재직증명서 또는 계약서로 특정기간 동안<br/> 서류인증을 받을 수 있습니다.
									</p>
									<div className="btnWrap">
										{this.state.EPK_STATUS === 'READY' ?
											<div className="btnTc arrI" onClick={this.checkEpkStatus}>인증하기<i></i></div>
											: <Link to="/login/requireAdd?type=teacher" className="btnTc arrI">인증하기<i></i></Link>}
									</div>
								</div>
							</li>
							<li>
								<span className="listTit">교육 전문 직원</span>
								<div className="listCont">
									<p>
										교육청, 교육지원청 소속의 선생님으로<br/>최근 6개월 이내 학교명이 명시된 재직증명서<br/>
										학교명이 명시된 급여명세서로 특정기간동안<br/>서류인증을 받을 수 있습니다.
									</p>
									<div className="btnWrap">
										{this.state.EPK_STATUS === 'READY' ?
											<div className="btnTc arrI" onClick={this.checkEpkStatus}>인증하기<i></i></div>
											: <Link to="/login/requireAdd?type=staff" className="btnTc arrI">인증하기<i></i></Link>}
									</div>
								</div>
							</li>
							<li>
								<span className="listTit">교육 대학생</span>
								<div className="listCont">
									<p>
										사범대, 교대생 교육학 전공 대상으로<br/>최근 6개월 이내 직인이 있는 재학증명서<br/>
										일반대학 내 교직과정 설치 학과 학생은 학교<br/>실습확인서를 제출할 경우 3개월 교사인증 가능
									</p>
									<div className="btnWrap">
										{this.state.EPK_STATUS === 'READY' ?
											<div className="btnTc arrI" onClick={this.checkEpkStatus}>인증하기<i></i></div>
											: <Link to="/login/requireAdd?type=academic" className="btnTc arrI">인증하기<i></i></Link>}
									</div>
								</div>
							</li>
							<li className="cs">
								<span className="ico_cs"></span>
								<span className="listTit">고객문의</span>
								<div className="listCont">
									<p>
										위 케이스에 해당되지 않는 경우<br/>교사인증 여부 확인이 필요하오니<br/>고객센터로 문의 부탁드립니다.
									</p>
									<div className="btnWrap">
										<Link to="/cs/qna/new" className="btnTc arrI">1:1 문의</Link>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<FooterCopyright handleLogin={this.handleLogin}/>
			</section>
		);
	}
}

export default connect(
	(state) => ({
		authRequireId: state.base.get('authRequireId'),
		logged: state.base.get("logged"),
		loginInfo: state.base.get('loginInfo').toJS(),
		reRegister: state.base.get("reRegister")
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(AuthRequire);