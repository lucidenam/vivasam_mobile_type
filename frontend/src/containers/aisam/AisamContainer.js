import React, {Component} from 'react';
import connect from 'react-redux/lib/connect/connect';
import {withRouter} from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from 'redux';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class AisamContainer extends Component {

	render(){
		return(
			<section className="aisamWrap">
				<div>
					<img src="/images/aisam/img1.jpg" alt=""/>
					<div className="blind">
						<h1>비바샘 AI 수업 체험관</h1>
						<p>2025년도부터 적용되는 AI 에듀테크 활용 수업, 비바샘이 해결할게요.</p>
					</div>
				</div>
				<div>
					<img src="/images/aisam/img2.jpg" alt=""/>
					<div className="blind">
						<h2>선생님의 고민은 비바샘에서 타파!</h2>
						<p>AI 및 에듀테크 활용 수업 준비를 위해<strong>선생님들이 미리 경험하고 준비하실 수 있도록 선별된 AI 서비스를 소개합니다.</strong></p>
					</div>
				</div>
				<div>
					<img src="/images/aisam/img3.jpg" alt=""/>
					<div className="blind">
						<h2>앞으로도 계속되는 신규 서비스 오픈!</h2>
						<p><strong>미래를 바꿀 새로운 서비스</strong>가 선생님을 찾아갑니다. 기대 그 이상의 서비스를 준비하고 있으니 많은 관심 부탁드립니다.</p>
					</div>
				</div>
				<div>
					<img src="/images/aisam/img4.jpg" alt="자세한 서비스 및 이용 방법은 PC 사이트에서 확인해주세요!"/>
					<div className="btnWrap">
						<a onClick={onClickCallLinkingOpenUrl.bind(this, "https://e.vivasam.com/aiSam/info")} target="_blank">
							<img src="/images/aisam/btn_pc.jpg" alt="PC 버전 확인하기"/>
						</a>
					</div>
				</div>
			</section>
		);
	};
};

export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS()
	}),
	(dispatch) => ({
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(AisamContainer));