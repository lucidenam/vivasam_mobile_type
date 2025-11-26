import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import * as common from 'lib/common';
import {withRouter} from 'react-router-dom';
import * as api from 'lib/api';
import * as baseActions from 'store/modules/base';
import {initializeGtag} from "../../store/modules/gtag";
import InfoText from 'components/login/InfoText';
import {FooterCopyright} from "../../components/page";

class AuthRequireAdd extends Component {
	state = {
		file: null,
		fileName: '파일을 첨부해 주세요!',
		fileUrl: null,
		userId: '',
		visible: false,
		comment: '',
		commentLength: 0,
		privacy: false,
		type: ''
	}

	componentDidMount = () => {
		initializeGtag();
		function gtag(){
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
				common.info("epki인증 상태입니다.");
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

		const type = history.location.search
		if (type.indexOf("?type=") > -1) {
			this.setState({
				type : type.split("?type=")[1]
			})
		}
	}

	handleFiles = (e) => {
		const files = e.target.files;
		if (files) {
			/*
			window.URL = window.URL || window.webkitURL;
			let img = document.createElement("img");
			img.src = window.URL.createObjectURL(file);
			img.onload = function () {
				window.URL.revokeObjectURL(this.src);
			}
			*/
			let fileLength = files.length;
			let fileName = '';
			if(fileLength > 1){
				fileName = files[0].name + ' 외 ' + (fileLength-1) + '개';
			}else{
				fileName = files[0].name;
			}

			this.setState({
				file: files,
				fileName: files[0].name ? fileName : '없음',
				visible: true
			});
		}
	}

	setComment = (e) => {
		let comment = e.target.value;
		let commentLength = comment.length;

		if (commentLength > 300) {
			common.info("300자 이내로 입력해 주세요.");
		} else {
			this.setState({
				comment: comment,
				commentLength: commentLength
			});
		}
	};

	handleFormChk = async (e) => {
		const {BaseActions} = this.props;
		const {file, userId, comment, privacy, type} = this.state;
		let target = e.target;
		target.disabled = true;
		// 파일체크
		if (file) {
			if(file.length > 3){
				common.info("파일은 최대 3개까지만 등록됩니다.");
				target.disabled = false;
				return false;
			}
			if(!privacy){
				common.info("위 필수 내용에 동의 후 진행 가능합니다.");
				target.disabled = false;
				return false;
			}
			const formData = new FormData();
			for(let i=0; i<file.length; i++){
				formData.append('uploadfile', file[i]);
				formData.append('filename', file[i].name);
			}
			formData.append('userId', userId);
			formData.append('content', comment.trim());
			formData.append('type', type);

			BaseActions.openLoading();
			try{
				const response = await api.teacherCertifyUpload(formData);
				//로딩이미지 고려
				if (response.data.code && response.data.code === "0") {
					BaseActions.pushValues({type: "reRegister", object: false});
					common.info('서류인증 심사는 1~2일 정도 소요됩니다.(공휴일, 주말 제외)');
					window.location.href="/#/cs/qna";
					window.viewerClose();
				} else {
					common.error(response.data.msg);
					target.disabled = false;
				}
			} catch (e) {
				console.log(e);
			} finally {
				setTimeout(() => {
					BaseActions.closeLoading();
					target.disabled = false;
				}, 1000);//의도적 지연.
			}
		} else {
			common.error("인증서류 파일을 등록해 주세요.");
			target.disabled = false;
		}
	}

	handleChangeAgree = (e) => {
		this.setState({
			privacy: e.target.checked
		});
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


	render() {
		const { loginInfo } = this.props;
		const { fileName, comment } = this.state;
		return (
			<section className="login">
				<h2 className="blind">비바샘 교사 인증</h2>
				<div className="tcWrap renew07">
					<div className="titWrap">
						{this.state.type === 'teacher' ?
							<div className="infoWrap">
								<h2>일반 교사 / 기간제 교사 인증</h2>
								<p>최근 6개월 이내 발급된 학교 직인이 있는 재직증명서 또는 계약서로 확인합니다.</p>
								<p>첨부 파일은 jpg, gif, png, pdf로만 업로드 합니다. 그외 확장자는 업로드 되지 않습니다.</p>
							</div>
							: this.state.type === 'staff' ?
								<div className="infoWrap">
									<h2>교육 전문 직원 인증</h2>
									<p>교육청, 교육지원청 소속의 선생님으로 최근 6개월 이내의 학교명이 명시된
										재직증명서 또는 학교명이 명시된 급여명세서로 특정기간동안
										서류인증을 받을 수 있습니다.
									</p>
								</div>
								:
								<div className="infoWrap">
									<h2>교육 대학생 인증</h2>
									<p>사범대, 교대생 교육학 전공 대상으로 최근 6개월 이내의 학교 직인이 있는 재학증명서로 인증 가능합니다.</p>
									<p>일반대학 내 교직과정 설치 학과 학생은 학교 실습확인서를 제출할 경우 3개월 교사인증 가능합니다.</p>
								</div>
						}
					</div>
					<div className="tcCont">
						{/*<ul className="txtList certifyList">
							<li>
								최근 6개월 이내 발급 및 학교 날인이 있는 <span className="c_o">재직증명서</span>로<br />확인합니다.<br />
								(※급여명세서, 건강보험자격득실확인서 등 위 조건에 해당하지<br /> 않는 서류는 인정되지 않습니다.)
							</li>
							<li>
								<span className="c_o">기간제 교사의 경우</span> 반드시 재직기간이 기재된 근로계약서를<br />
								첨부해주세요!
							</li>
							<li>
								파일 형식은 jpg, gif, png, pdf를 권장합니다. 이외 확장자 또는<br />
								학교 발급이 아닌 수기 작성된 서류는 불가합니다.
							</li>
						</ul>*/}


						<div className="fileUploadWrap">
							<div className="fileWrap">
								{/* 첨부 서류 파일명 */}
								<input
									type="text"
									className="fileUpload"
									value={fileName}
									readOnly
								/>
								{/* 첨부 버튼 */}
								<div className="btnAdd"
									 ref={(div) => this.gallrayDiv = div}
									 onClick={(e) => {
										 if (this.gallrayDiv === e.target) {
											 this.gallaryRef.click();
										 }
									 }}
								>
									<input
										multiple="multiple"
										type="file"
										id="file_gallary"
										name="file_gallary[]"
										accept=".jpg, .gif, .png, .hwp, .doc, .ppt, .pdf"
										onChange={this.handleFiles}
										onClick={this.openPhoto}
										ref={input => this.gallaryRef = input}
										className="ipt_file"/>
									<label htmlFor="file_gallary"></label>
								</div>
							</div>
							{/*<div className="textareaWrap">
								<textarea
									id="applyContent"
									name="applyContent"
									value={comment}
									onChange={ this.setComment }
									maxLength="300"
									placeholder="서류 인증에 참고할 내용이 있다면 기입해 주세요."
								></textarea>
							</div>*/}

							{/*{loginInfo.mTypeCd == '2' ?
								<Fragment>
									<p className="fileUpload_txt mt10">교육대학생 인증 서류 기준을 확인해 주세요.</p>

									<ul className="mt10">
										<li>당해연도 발급한 재학증명서</li>
									</ul>

									<p className="info mt10">
										서류 인증에는 1~2일정도 소요될 수 있습니다.<br/>
										(주말, 공휴일 제외)
									</p>
									<p className="info mt10">
										교육대학생은 비바샘 일부 서비스 이용이 제한됩니다.
									</p>
								</Fragment>
								:
								<Fragment>
									<p className="fileUpload_txt mt10">교사인증 서류 기준을 확인해주세요.</p>

									<ul className="mt10">
										<li>최근 6개월 이내 발급</li>
										<li>학교장 직인 서류</li>
										<li>재직기간 명시</li>
									</ul>

									<p className="info mt10">
										서류 인증에는 1~2일정도 소요될 수 있습니다.<br/>
										(주말, 공휴일 제외)
									</p>
								</Fragment>
							}*/}
						</div>

						{<div className="sort_alert">
							<p className="txt_alert">
								※ 비바샘은 교사 인증 내용 확인 및 답변을 위해 회원가입 시 입력한<br/>
								선생님의 개인정보와 서류를 수집하고 있습니다.
							</p>
							<div className="indent_box required">
								<p>
									- 수집항목 : 성명, 아이디, 연락처(휴대폰 번호), 교사인증 서류
								</p>
								<p>
									- 개인정보 수집방법 : 비바샘 교사인증 페이지를 통한 수집
								</p>
								<p>
									- 개인정보의 보유 및 이용 기간 : 선생님의 개인정보는 교사인증<br/>
									서류 확인을 위해 서류 인증 내역에 보관됩니다.<br/>
									개인정보는 삭제를 요청하기 전까지 최대 1년간 보관됩니다.
								</p>
							</div>
						</div>}

						{<div className=" cs_check">
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
						</div>}
					</div>
					<div className="btn_inquiry_complete">
						<button
							className="btnTc"
							onClick={this.handleFormChk}>인증 완료
						</button>
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
		loginInfo: state.base.get('loginInfo').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(AuthRequireAdd));