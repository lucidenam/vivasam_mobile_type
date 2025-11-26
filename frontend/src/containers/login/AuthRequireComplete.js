import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import {Link} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as api from 'lib/api';
import {isNotEmpty} from "../../lib/StringUtils";
import {initializeGtag} from "../../store/modules/gtag";

class AuthRequireComplete extends Component {
	state = {
		regDttm: '',
		attachFile: '',
		attachFileUrl: '',
		attachFile2: '',
		attachFile2Url: '',
		attachFile3: '',
		attachFile3Url: '',
		comment: '',
		answer: '',
		downDomain: ''
	}

	constructor(props) {
		super(props);
	}

	componentDidMount = async () => {
		const {BaseActions} = this.props;
		let targetUrl = '';
		BaseActions.openLoading();
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		try {
			// 서류인증 신청내용 조회
			targetUrl = await this.checkEpkStatusInfo();
			if(targetUrl != ''){
				window.location.hash = targetUrl;
				window.viewerClose();
			}
			gtag('config', 'G-MZNXNH8PXM', {
				'page_path': '/login/requireComplete',
				'page_title': '교사 인증 대기 안내｜비바샘'
			});
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
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
				this.setState({
					regDttm: epkStatusInfo.REG_DATE,
					attachFile: epkStatusInfo.ATTACH_FILE,
					attachFile2: epkStatusInfo.ATTACH_FILE2,
					attachFile3: epkStatusInfo.ATTACH_FILE3,
					comment: epkStatusInfo.COMMENT,
					answer: epkStatusInfo.ANSWER
				});
			}
		}else{
			targetUrl = '/';
		}
		return targetUrl;
	}

	fileDownLink = async(fileName) => {
		const {BaseActions} = this.props;
		BaseActions.openLoading();
		try {
			await api.download('/api/download/verifyfileDown?fileName='+fileName, fileName);
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}
	}

	setReRegister = () => {
		const {BaseActions} = this.props;

		BaseActions.pushValues({type: "reRegister", object: true});
	}

	render() {
		const {regDttm, attachFile, attachFile2, attachFile3, comment, answer} = this.state;
		return (
			<section className="login">
				<h2 className="blind">비바샘 교사 인증</h2>
				<div className="tcWrap">
					<div className="tcTit">
						<h3>선생님께서는 <span className="tcPoint">‘인증 대기’</span> 상태입니다.</h3>
						<ol className="stepList">
							<li>접수<br />대기</li>
							<li>인증<br />심사중</li>
							<li className="on">답변<br />완료</li>
						</ol>
					</div>
					<div className="tcCont">
						<div className="answerChkWrap">
							<div className="answerItem">
								<span className="tit">접수일</span>
								<div className="cont">
									<p>{regDttm}</p>
								</div>
							</div>
							<div className="answerItem">
								<span className="tit">접수 내용</span>
								<div className="cont">
									<div className="fileList">
										<span className="fileItem certify_upload_name" style={{display: isNotEmpty(attachFile)? 'block' : 'none'}}><button onClick={() => this.fileDownLink(attachFile)}>{attachFile}</button></span>
										<span className="fileItem certify_upload_name" style={{display: isNotEmpty(attachFile2)? 'block' : 'none'}}><button onClick={() => this.fileDownLink(attachFile2)}>{attachFile2}</button></span>
										<span className="fileItem certify_upload_name" style={{display: isNotEmpty(attachFile3)? 'block' : 'none'}}><button onClick={() => this.fileDownLink(attachFile3)}>{attachFile3}</button></span>
									</div>
									{
										isNotEmpty(comment) &&
										<br/>
									}
									<p dangerouslySetInnerHTML = {{__html: isNotEmpty(comment)? comment.replace(/(?:\r\n|\r|\n)/g, '<br/>') : ''}}></p>
								</div>
							</div>
							<div className="answerItem">
								<span className="tit">답변</span>
								<div className="cont">
									<p dangerouslySetInnerHTML = {{__html: isNotEmpty(answer)? answer.replace(/(?:\r\n|\r|\n)/g, '<br/>') : ''}}></p>
								</div>
							</div>
						</div>
						<div className="btnWrap">
							<Link to="/login/require" className="btnTc" onClick={this.setReRegister}>재신청하기</Link>
						</div>
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
		loginInfo: state.base.get('loginInfo').toJS(),
		reRegister: state.base.get("reRegister")
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(AuthRequireComplete);