import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as popupActions from 'store/modules/popup';
import { Link } from 'react-router-dom';
import {initializeGtag} from "../../store/modules/gtag";

class AuthRequireConfirm extends Component {
	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/login/requireConfirm',
			'page_title': '교사 인증 대기 안내｜비바샘'
		});
	}

	render() {
		return (
			<section className="login">
				<h2 className="blind">비바샘 교사 인증</h2>
				<div className="tcWrap">
					<div className="tcTit">
						<h3>인증 신청 서류가 접수되었습니다.</h3>
						<ol className="stepList">
							<li>접수<br />대기</li>
							<li className="on">인증<br />심사중</li>
							<li>답변<br />완료</li>
						</ol>
					</div>
					<div className="tcCont">
						<p className="confirmTxt">서류 인증에는 1~2일정도 소요될 수 있습니다.(주말, 공휴일 제외) <br/>서류 인증 재신청이 필요한 경우 해당 페이지를 통해 답변을 드리오니 <br/>확인 부탁드립니다.</p>
						<div className="btnWrap">
							<Link to="/"
								  className="btnTc"
							>비바샘 메인으로</Link>
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
		loginInfo: state.base.get('loginInfo').toJS()
	}),
	(dispatch) => ({
		PopupActions: bindActionCreators(popupActions, dispatch)
	})
)(AuthRequireConfirm);