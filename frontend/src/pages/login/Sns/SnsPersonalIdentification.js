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
	handleCellVerification = async(e) => {

		const { type, agree, check, memberId, history } = this.props;
		const response = await api.getNiceEncData({TYPE:'NICE_SNS', ...type, ...agree, ...check, memberId:memberId});

		this.setState({
			sEncData : response.data.sEncData
		});

		// if (window.__isApp) {
		//     api.appConfirm('선생님, 비바샘 앱 업데이트 하셨나요? \n' + '\n' + '개선된 기능을 이용하시려면\n' + '앱 업데이트를 먼저 해 주세요.\n' + '\n' + '\'예\'를 누르시면 스토어로 이동합니다.\n'
		//     + '업데이트가 완료되었다면 \n' + '\'아니오\' 버튼을 눌러 주세요.').then((val) => {
		//         if (val === true) {
		//             if(isAndroid) {
		//                 document.location.href="market://details?id=com.visang.vivasam.mobile";
		//             }else if(isIOS) {
		//                 document.location.href="itms-apps://itunes.apple.com/app/apple-store/id1445530612";
		//             }
		//             history.push("/");
		//         } else {
		//             document.form_chk.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
		//             document.form_chk.submit();
		//         }
		//     });
		// } else {
		//TODO 현재는 팝업식으로 되어 있으나 팝업 오픈 소스를 주석으로 막으면 내부 창으로 열립니다. 어떻게 진행할지는 윤용훈 CP 님하고 결정하여서 처리 되어야 합니다.
		// window.open('', 'popupChk', 'width=500, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no');
		// document.form_chk.target = "popupChk";
		document.form_chk.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb";
		document.form_chk.submit();

		//TODO /api/member/getNiceVerificationData 에서는 정상 데이터를 수신 후 window.close 만 보내고 있습니다.
		//opener 에게 정상 수신이 되었다는 것을 알려줄 방법이 필요합니다.
		// }

	}


	//아이핀 인증
	handleIpinVerification = async (e) => {
		const {type, agree, check, memberId, history} = this.props;
		const response = await api.getNiceEncData({TYPE: 'IPIN_SNS', ...type, ...agree, ...check, memberId: memberId});
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
					{/* <!-- 신규 가입 본인인증시 문구 --> */}
					{isJoin && (
						<p className="info_txt_top">회원가입을 위해 원하는 본인 인증 방법을 선택해 주세요.</p>
					)}
					{/* <!-- 로그인 회원 본인인증시 문구 --> */}
					{!isJoin && (
						<p className="info_txt_top">
							안전한 비바샘 회원 계정 관리를 위해, 먼저 본인 인증을 해 주세요. <br/>
							아래의 2가지 방식 중 선택하여 인증하실 수 있으며, 1회 인증만 해 주시면 비바샘 정상 이용이 가능합니다. <br/>
							본인 인증을 하지 않으실 경우 비바샘 교수지원 서비스의 이용이 제한됩니다.
						</p>
					)}

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
				{/* <!-- //CASE : 가입 여부 확인 후 기 가입이력 없을 경우 본인인증 페이지 --> */}
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		type: state.join.get('type').toJS(),
		agree: state.join.get('agree').toJS(),
		check: state.join.get('check').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(PersonalIdentification));
