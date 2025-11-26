import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import queryString from 'query-string';
import {initializeGtag} from "../../../store/modules/gtag";

class JoinTeacher extends Component {

	state = {
		file: null,
		fileName: '없음',
		fileUrl: null,
		visible: false,
		query: {}
	}

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/teacher',
			'page_title': '가입 완료 및 교사 인증 | 회원가입｜비바샘'
		});
		const {history, location, JoinActions} = this.props;
		let query = queryString.parse(location.search);
		this.setState({
			query: query
		});
		if (this.props.test) {
			query.userId = 'gatemail12';
		}
		if (!query.userId || typeof query.userId === 'undefined') {
			history.go(-1);
		}
		JoinActions.defaultStore();
	}

	closeButtonClick = () => {
		const {history} = this.props;
		history.push('/');
	}

	isUserInfoCheck = () => {
		const snsLoginInfo = JSON.parse(sessionStorage.getItem("snsObject"));
		if (snsLoginInfo.phoneNumber == null) {
			return true;
		}
		return false;
	}

	render() {
		// const _isUserInfoCheck = this.isUserInfoCheck();
		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">가입 완료 및 교사 인증</h2>
					<div className="step_num_box">
						<span className="step_num">1</span>
						<span className="step_num">2</span>
						<span className="step_num active"><span className="blind">현재페이지</span>3</span>
					</div>
				</div>
				<section className="join">
					<div className="join_info">
						<div className="c_black">
							가입이 완료되었습니다.
						</div>
						<div className="certify_document">
							<p className="certify_txt">아래의 안내에 따라 서류인증을 완료하여 주세요.</p>
							<p className="c_gray_soft mb25">(PC에서 로그인을 하시면 EPKI/GPKI 인증을 진행하실 수 있습니다.)</p>
						</div>
						<div className="tcWrap">
							<div className="tcCont">
								<ul className="tcSelList">
									<li>
										<span className="listTit">EPKI/GPKI 인증</span>
										<div className="listCont">
											<p>EPKI 또는 GPKI는 인증서로 인증 후<br />기간 연장 없이 바로 이용이 가능합니다.</p>
											<span className="c_o">* PC 비바샘에서 인증 가능합니다.</span>
										</div>
									</li>
									<li>
										<span className="listTit">서류 인증</span>
										<div className="listCont">
											<p>최근 6개월 이내 발급 및 학교 날인이 있는<br />재직증명서로 교사인증 신청을 해주세요</p>
											<div className="btnWrap">
												<Link to="/login/requireAdd" className="btnTc">서류 인증</Link>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div>
							<a onClick={this.closeButtonClick} className="btn_round_off">서류 인증 나중에 하기<span className="c_gray_txt">(메인으로 이동)</span></a>
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
		agree: state.join.get('agree').toJS(),
		isApp: state.base.get('isApp')
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch),
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinTeacher));
