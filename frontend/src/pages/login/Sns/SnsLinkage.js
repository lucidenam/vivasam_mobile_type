import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as popupActions from 'store/modules/popup';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import queryString from 'query-string';
import * as api from "../../../lib/api";
import {findRenderedComponentWithType} from "react-dom/test-utils";
import {initializeGtag} from "../../../store/modules/gtag";
class VerificationResult extends Component {

	constructor(props) {
		super(props);
	}

	state = {
		memberId: '',
		memberList:[],
		query: {},
		result: {},
		loading: true
	}

	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/verification/result',
			'page_title': '본인 인증｜비바샘'
		});
		if (this.props.logged) this.props.replace('/');

		const {location} = this.props;
		let query = queryString.parse(location.search);
		this.setState({
			query: query
		});

		let encodeUuid = encodeURIComponent(query.uuid);
		this.getMemberList();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	// 회원 연동
	onLink = (e) =>{
		const {BaseActions} = this.props;
		const {memberId} = this.state;
		BaseActions.openLoading();
		let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));

		if (snsLoginParameter == null) {
			window.location.href = "/#/login";
		}
		else {
			//선택한 아이디가 없는경우
			if(memberId == '') {
				alert('연동할 아이디를 선택해주세요.');
				setTimeout(() => {
					BaseActions.closeLoading();
				}, 500);//의도적 지연.
				return;
			}
			this.updateMemberId(snsLoginParameter);
		}
	}

	updateMemberId = async (snsLoginParameter) => {
		const {memberId} = this.state;
		const {BaseActions, info} = this.props;
		snsLoginParameter.memberId = memberId;
		if (info.isIpin == '') {
			snsLoginParameter.ipinCi = 'IPIN_CI_SNS_' + memberId;
		}
		else {
			snsLoginParameter.ipinCi = info.isIpin;
		}
		if (info.telephone != '') {
			snsLoginParameter.phoneNumber = info.telephone;
		}
		const response = await api.updateMemberId(snsLoginParameter);

		if (response.data.code != null && response.data.code == "success") {
			alert('성공적으로 계정연동이 완료되었습니다.');
			sessionStorage.removeItem("snsObject");
			window.location.href="/#/login";
		}
		else {
			alert('계정연동에 실패하였습니다. 다시 시도해주세요.');
		}

		setTimeout(() => {
			BaseActions.closeLoading();
		}, 500);//의도적 지연.
	}

	getMemberList = async () =>{
		let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));
		snsLoginParameter.phoneNumber = this.getUserPhoneNumber();
		const response = await api.getMappingIdList(snsLoginParameter);
		this.setState({
			memberList : response.data
		});
	}

	selectMemberId = (e) => {
		this.setState({
			memberId : e.target.value
		})
	}

	getUserPhoneNumber = () => {
		const {info} = this.props;
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo.phoneNumber == null) {
			if (info.telephone == null) {
				return '';
			} else {
				return info.telephone;
			}
		}
		return snsLoginInfo.phoneNumber;
	}

	getTypeText = () => {
		let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginParameter == null) {
			window.location.href = "/#/"
		}
		if (snsLoginParameter.type == 'KAKAO') {
			return '카카오계정'
		}
		else if (snsLoginParameter.type == 'NAVER') {
			return '네이버계정'
		}
		else if (snsLoginParameter.type == 'FACEBOOK') {
			return '페이스북계정'
		}
		else if (snsLoginParameter.type == 'GOOGLE') {
			return '구글계정'
		}
		else if (snsLoginParameter.type == 'APPLE') {
			return '애플계정'
		}
		else if(snsLoginParameter.type == 'WHALESPACE'){
			return '웨일 스페이스'
		}
	}

	render() {
		const {loading, result, memberList} = this.state;

		return (
			<section id="pop_content">
				<Fragment>
					{/* <!-- 본인인증 성공 -->
					{result.result != -1 && result.result != -2 && (*/}
						<div className="link_sns_wrap">
							<div className="link_sns">
								<h3 className="mb20">가입된 회원정보가 있습니다.</h3>
								<p className="sns_type mb25">선택한 계정을 연동하시면,<br/>
									<span id="snsType">{this.getTypeText()}</span>{' '}계정으로도 로그인이
									가능합니다.</p>
								<div className="account_list_wrap">
									<div id="dataList" className="account_list">
										<ul>
											{memberList.map((value, i) => (
												<React.Fragment key={i}>
													<li className="pt10">
														<input type="radio"
														       name="account"
														       checked={this.state.memberId === value}
														       onClick={this.selectMemberId}
														       value={value}
														       id={value}/>
														<label htmlFor={value}>{value}</label>
													</li>
												</React.Fragment>
											))}
										</ul>
									</div>
								</div>
								<div className="link_sns_btn_wrap mb25">
									<button
										className="link_sns_btn" tabIndex="3"
									    value="연동하기"
									    onClick={this.onLink}>연동하기</button>
								</div>
								<p className="call">아이디 문의 : 1544-7714</p>
							</div>
						</div>
					{/* )}
					<!-- //본인인증 성공 --> */}
				</Fragment>
			</section>
		);
	}
}

export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		info: state.join.get('info').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(VerificationResult));
