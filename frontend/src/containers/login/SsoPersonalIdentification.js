import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as api from 'lib/api';

class PersonalIdentification extends Component {

	constructor(props) {
		super(props);
	}

	state = {
		sEncData: ''
	}


	componentDidMount() {
		let scroll = document.getElementById('teacher_certify');

		scroll.scrollTop = 0;
	}


	//핸드폰 인증
	handleCellVerification = async (e) => {
		const {type, agree, check, memberId, history} = this.props;

		const response = await api.getNiceEncData({TYPE: 'NICE_SSO', ...type, ...agree, ...check, memberId: memberId});

		this.setState({
			sEncData: response.data.sEncData
		});
		document.form_chk.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
		document.form_chk.submit();
	}


	//아이핀 인증
	handleIpinVerification = async (e) => {
		const {type, agree, check, memberId, history} = this.props;
		const response = await api.getNiceEncData({TYPE: 'IPIN_SSO', ...type, ...agree, ...check, memberId: memberId});
		// alert("========== >>>>> TEST : response : " + response);
		this.setState({
			sEncData: response.data.sEncData
		});
		document.form_ipin.action = "https://cert.vno.co.kr/ipin.cb";
		document.form_ipin.submit();
		// }
	}

	render() {
		const {sEncData} = this.state;
		const {isJoin} = this.props;

		return (

			<Fragment>

				{/* <!-- CASE : 가입 여부 확인 후 기 가입이력 없을 경우 본인인증 페이지 --> */}
				<div className="teacher_certify" id="teacher_certify">
					<div className="certify_box_wrap">
						<ul className="certify_box">
							<li className="certify_box_list">
								<form name="form_chk" method="post">
									<input type="hidden" name="m" value="checkplusSerivce"/>
									<input type="hidden" name="EncodeData" value={sEncData}/>
								</form>
								<button type="button" className="btn_certify_box phone"
								        onClick={this.handleCellVerification}>
									<span>휴대폰으로 인증하기</span>
								</button>
							</li>
							<li className="certify_box_list">
								<form name="form_ipin" method="post">
									<input type="hidden" name="m" value="pubmain"/>
									<input type="hidden" name="enc_data" value={sEncData}/>
								</form>
								<button type="button" className="btn_certify_box ipin"
								        onClick={this.handleIpinVerification}>
									<span>아이핀으로 인증하기</span>
								</button>
							</li>
						</ul>
					</div>

					<p className="footnote">※ 본인 인증 시 제공되는 정보는 해당 인증기관에서 직접 수집하며, 인증 이외의 용도로 이용되지 않습니다. </p>
				</div>

				<div className="guideline"></div>
				<div className="join_info">
					<span className="icon_noti_type3">본인 인증이 안되실 경우</span>
					인증기관에 선생님의 개인 정보가 등록되어 있지 않거나 또는 다른 이유로 실패할 수 있습니다. <br/>본인 인증 실패 관련하여서는 인증기관에 문의해 주세요.
					<div className="line_box top">
						<p className="line_box_tit">나이스평가정보</p>
						<em className="line_box_num type2">1600-1522</em>
						<a href="tel:1600-1522" className="ico_tel_type3"><span className="blind">전화걸기</span></a>
					</div>
					<div className="line_box">
						<p className="line_box_tit">비바샘 선생님 전용 고객센터</p>
						<em className="guide_box_num">1544-7714</em>
						<a href="tel:1544-7714" className="ico_tel"><span className="blind">전화걸기</span></a>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		type: state.join.get('type').toJS(),
		agree: state.conversion.get('agree').toJS(),
		check: state.join.get('check').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(PersonalIdentification));
