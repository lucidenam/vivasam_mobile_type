import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import queryString from 'query-string';
import {debounce} from 'lodash';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../../store/modules/gtag";
import * as api from "../../../lib/api";

class JoinVerificationResult extends Component {

	test = true;

	constructor(props) {
		super(props);
		// Debounce
		this.nextButtonClick = debounce(this.nextButtonClick, 300);
	}

	state = {
		query: {},
		result: {},
		duplicateIdCheck: false,
		loading: true
	}

	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/verifyResult',
			'page_title': '본인 인증 결과 | 회원가입｜비바샘'
		});

		const {location} = this.props;
		let query = queryString.parse(location.search);
		this.setState({
			query: query
		});

		if (!this.props.test) {
			if (!query.uuid || typeof query.uuid === 'undefined') {
				this.props.history.go(-1);
			}
		}
		this.getIdentificationData(query.uuid);
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	checkAllTschIdUnusable =  async() => {
		const {check} = this.props;
		const tschIdLen = check.isExistTsch ? check.tUsers.length : 0;
		let unusabletschIdLen = 0;
		if(tschIdLen < 1) return;

		check.tUsers.map((tuser, i) => {
			if(tuser.isusable == 'false') unusabletschIdLen++;
		});

		if(unusabletschIdLen === tschIdLen) {
			this.setState({
				allTschIdUnusable : true
			})
		}
	}

	setIdByCheckCase = async() => {
		const {check, info, JoinActions} = this.props;

		this.getExistEmail(check.existMemberId);

		if(check.tUsers.length > 1 || (check.isExistViva && check.isExistTsch)) {
			if(check.checkCase == '7') {
				info['userId'] = check.existMemberId;
			} else {
				this.setState({
					multipleResultCheck : true,
				})
			}
		} else {
			if(check.isExistViva) {
				if(!check.existMemberInActive) {
					info['userId'] = check.existMemberId;
				}
			} else if(check.isExistTsch) {
				info['userId'] = check.tUsers[0].tid;
			}

			JoinActions.pushValues({type: 'info', object: info});
		}
	}

	//기존 통합회원이 있고 다시 통합회원 가입 시도시 기존 통합회원의 회원유형을 변경하면 문제가 있다 판단하여 주석처리
	// updateMemberMTypeCd = async() => {
	// 	const {check, agree} = this.props;
	//
	// 	if(check.checkCase == '8' && check.isExistViva && agree.mTypeCd != '') {
	// 		const response = await api.updateMemberMTypeCd(check.existMemberId, agree.mTypeCd);
	// 	}
	// }

	checkSnsLinkAge = async() => {
		const {check, history} = this.props;

		if(check.checkCase == '8' && check.isExistViva) {
			let snsLoginParameter = JSON.parse(sessionStorage.getItem("snsObject"));
			snsLoginParameter.phoneNumber = this.getUserPhoneNumber();
			const response = await api.getMappingIdList(snsLoginParameter);
			if(response.data.length > 0) {
				history.replace('/');
				history.push('/sns/linkage/link');
			}

		}
	}

	// memberId를 통해 info에 email insert
	getExistEmail = async (existMemberId) => {
		const {info, JoinActions} = this.props;
		const response = await api.getMemberInfoByMemberId(existMemberId);

		info.email = response.data.email;
		info.validYN = response.data.validYn;

		JoinActions.pushValues({type: 'info', object: info});
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

	getIdentificationData = async (uuid) => {

		const {JoinActions} = this.props;
		let encodeUuid = encodeURIComponent(uuid);

		try {
			const {check, info} = await JoinActions.identificationData(encodeUuid);
			//TODO 인증정보 못불러온 경우 인증안내 화면으로 가야...
			console.log(this.props.check);

			if (this._isMounted && this.props.info.isIpin) {
				this.setState({loading: false});
			}
			window.scrollTo(0, 0);

			this.setIdByCheckCase();
			this.checkAllTschIdUnusable();
			this.checkSnsLinkAge();
			// this.updateMemberMTypeCd();
		} catch (e) {
			console.log(e);
		} finally {
			setTimeout(() => {
				this.setState({loading: false});
			}, 700);
		}

	}


	nextButtonClickSafe = (e) => {
		this.nextButtonClick(e.target);
	}

	nextButtonClick = async (target) => {
		const {check, info, history, sso, BaseActions, JoinActions} = this.props;
		const {query, multipleResultId, multipleResultCheck} = this.state;

		try {
			if (check.isExistTsch) {
				info['existTschoolId'] = check.tUsers[0].tid;
			}

			//신규 아이디 입력받는 경우
			if(check.checkCase == '2' || check.checkCase == '4' || check.checkCase == '6') {
				//아이디 중복 체크여부 확인.
				if (info.userId === "") {
					common.error('아이디를 입력해주세요.');
					target.disabled = false;
					this.refs.userId.focus();
					return false;
				} else if (!this.state.duplicateIdCheck || info.duplicateId) {
					common.error('아이디 중복확인 버튼을 눌러주세요.');
					target.disabled = false;
					this.refs.userId.focus();
					return false;
				}
			} else {
				if(multipleResultCheck) {
					if(multipleResultId === "") {
						common.error('아이디를 선택해주세요.');
						return false;
					}
					info['userId'] = multipleResultId;
				}
			}

			JoinActions.pushValues({type: 'info', object: info});

			BaseActions.openLoading();

			//통합회원이 아닐 경우 바로 통합회원으로 전환
			if(check.checkCase !== '0' && check.checkCase !== '8') { // checkCase가 1, 2, 5, 6, 7경우
				sso['uuid'] = query.uuid;
				sso['vUserId'] = check.existMemberId;
				sso['tschUserId'] = check.isExistTsch ? check.tUsers[0].tid : '';
				sso['newUserId'] = info.userId;
				JoinActions.pushValues({type: 'sso', object: sso});

				info['tschUserId'] = check.isExistTsch ? check.tUsers[0].tid : '';

				//단독회원 이메일 승계

				//티스쿨 아이디 선택시
				if(check.tUsers.length > 0) {
					check.tUsers.map((data, index) => {
						if(data.tid === info.userId) info.email = data.email;
					});
				}
				//비바샘 아이디 선택시
				if(check.existMemberId === info.userId) info.email = check.existVivaEmail;

				JoinActions.pushValues({type: 'info', object: info});
			}

			if (!this.props.test) {
				history.replace('/');
				history.push('/sns/join/info');
			}
		} catch (e) {
			target.disabled = false;
			console.log(e);
		} finally {
			setTimeout(() => {
				BaseActions.closeLoading();
			}, 1000);//의도적 지연.
		}

	}

	handleChangeId = (e) => {
		const {info, JoinActions} = this.props;
		info['userId'] = e.target.value;
		JoinActions.pushValues({type: "info", object: info});

		this.setState({
			duplicateIdCheck: false
		});
	}

	//중복 아이디 체크
	duplicateIdClick = async (e) => {
		const {info, JoinActions} = this.props;
		var idCheck = /^[a-z0-9]{3,12}$/g;
		if (!idCheck.test(info.userId)) {
			common.error("아이디는 영소문자로 시작하는 4~12자 영문자 또는 영문자+숫자이어야 합니다.");
			this.refs.userId.focus();
			return false;
		}
		try {
			let code = await JoinActions.checkSsoUserId(info.userId);
			if (!code.data) {
				common.error("이미 사용중인 아이디 입니다.");
				this.refs.userId.focus();
			} else {
				common.info("사용할 수 있는 아이디입니다.");
				this.setState({
					duplicateIdCheck: true
				});
			}
		} catch (e) {
			console.log(e);
		}
	}

	//아이디가 다중선택일 경우
	handleChangeMultipleResult = (e) => {
		this.setState({
			multipleResultId : e.target.value,
		})
	};

	render() {

		let {check, info, JoinActions} = this.props;
		const {result, loading, multipleResultId, allTschIdUnusable} = this.state;

		if (loading) return <RenderLoading loadingType={"2"}/>;
		if (check.exception) {
			return (
				<Fragment>
					<section className="join">
						<div className="join_use">
							<div className="join_info">
								<div className="info_txt_top">
									일시적으로 정보를 불러오지 못했습니다. 나중에 다시 시도해주세요.<br/> (code:{check.exception})
								</div>
							</div>
						</div>
					</section>
				</Fragment>
			);
		}
		if (!this.props.test) {
			if(check.sMessage != null && check.sMessage != '') {
				common.error(check.sMessage);
				this.props.history.replace('/');
			} else {
				if (!check.isExistViva && !check.isExistTsch) {
					//비바샘, 티스쿨 아이디 없는 경우 정보 입력 폼으로 이동
					this.props.history.replace('/');
					this.props.history.push('/sns/join/info');
				}
			}
		} else {
			/**/
			check = {
				isExistViva: true,
				isExistTsch: true,
				tUsers: [{
					isusable: 'true',
					inactive: 'true',
					tid: 'test1234'
				}],
				existMemberId: 'test',
				existMemberInActive: true
			}
		}

		//통합 가입 진행 가능 여부.
		let isPossibleJoin = !check.isExistViva && !check.isInActiveT && !check.isDupleT;

		let message = [];
		//비바샘 회원 O && 연수원 가입 X && 연수원에 동일 아이디 X
		if (check.checkCase == '1') {
			message = ['이미 비바샘 회원으로 가입되어 있습니다.', <br/>, '아래의 아이디로 통합회원 전환하시겠습니까?'];

			//비바샘 회원 O && 연수원 회원 X && 연수원에 동일 아이디 O
		} else if (check.checkCase == '2') {
			message = ['이미 비바샘 회원으로 가입되어 있습니다.', <br/>, '해당 아이디는 비바샘 연수원에서 사용 중이므로, 통합회원 전환을 위해 새로운 아이디를 입력해 주세요.'];

			//비바샘 회원 X && 연수원 회원 O && 비바샘에 동일 아이디 X
		} else if (check.checkCase == '3') {
			message = ['이미 비바샘 연수원 회원으로 가입되어 있습니다.', <br/>, '아래의 아이디로 통합회원 전환하시겠습니까?'];

			//비바샘 회원 X && 연수원 회원 O && 비바샘에 동일 아이디 O
		} else if (check.checkCase == '4') {
			message = ['이미 비바샘 연수원 회원으로 가입되어 있습니다.', <br/>, '해당 아이디는 비바샘에서 사용 중이므로, 통합회원 전환을 위해 새로운 아이디를 입력해 주세요.'];

			//비바샘 회원 O && 연수원 회원 O && 기존 아이디 사용 가능​
		} else if (check.checkCase == '5') {
			message = ['이미 비바샘과 비바샘 연수원 회원으로 가입되어 있습니다.', <br/>, '통합회원 전환을 위해 사용하시려는 아이디를 선택해 주세요.'];

			//비바샘 회원 O && 연수원 회원 O && 기존 아이디 사용 불가
		} else if (check.checkCase == '6') {
			message = ['이미 비바샘과 비바샘 연수원 회원으로 가입되어 있습니다.', <br/>, '해당 아이디들은 다른 선생님이 사용 중이므로, 통합회원 전환을 위해 새로운 아이디를 입력해 주세요.'];

			//비바샘 회원 O && 연수원 가입 O && 기존 아이디 동일
		} else if (check.checkCase == '7') {
			message = ['이미 비바샘과 비바샘 연수원 회원으로 가입되어 있습니다.', <br/>, '아래의 아이디로 통합회원 전환하시겠습니까?'];

			//이미 비바샘 통합회원
		} else if (check.checkCase == '8') {
			message = ['이미 비바샘 통합회원으로 가입되어 있습니다.', <br/>, '아래의 아이디로 로그인 해주세요.'];
		}

		const ResultMsg = () => {
			return (
				<div className="info_txt_top">
					{message.map((line, i) => {
						return (
							<Fragment key={i}>
								{i == 0 &&
								<span className="message_first">{line}</span>
								}
								{i != 0 &&
								line
								}

							</Fragment>
						)
					})}
				</div>
			)
		}

		//티스쿨 아이디 목록
		const TuserList = check.tUsers.map((tuser, i) => {
			if((check.tUsers.length === 1 && !check.isExistViva) || check.checkCase == '7') {
				return (
					<Fragment>
						<div className={"result_nocheck"}>
							<span className="lb_txt">비바샘 연수원 ID</span>

							<p className={tuser.isusable == 'true' ? "usable" : "unusable"} key={i}>
								<strong className="user_id">{tuser.tid}</strong>
							</p>

							{tuser.isusable == 'true' ? <Fragment></Fragment> : tuser.inactive == 'true' ?
								<span>휴면 상태</span> :
								<span className="unusable">
                                	이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br />
                                	신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
                                </span>}
						</div>
					</Fragment>
				);
			} else {
				return (
					<Fragment>
						<div className="checkbox_circle_box">
							<input
								type="radio"
								id={"resultIntegratedId" + i}
								className={ "checkbox_circle " + (tuser.isusable == 'true' ? "usable" : "unusable")}
								value={tuser.tid}
								name="multipleResultId"
								checked={multipleResultId == tuser.tid}
								onChange={this.handleChangeMultipleResult}
								disabled={tuser.isusable != 'true'}
								key={i}
							/>

							<label className="lb_txt" htmlFor={"resultIntegratedId" + i}>비바샘 연수원 ID</label>
							<p>
								<strong className="user_id">{tuser.tid}</strong>
							</p>
							{tuser.isusable == 'true' ? <span></span> : tuser.inactive == 'true' ?
								<span>휴면 상태</span> :
								<span className="unusable">
                                	이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br />
                                	신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
                                </span>
							}
						</div>
					</Fragment>
				);
			}
		});

		//티스쿨 아이디 목록
		const DupleTuserList = check.tUsers.map((tuser, index) => {
			let isLast = check.tUsers.length - 1 > index;
			return (
				<Fragment>
					{tuser.tid}{isLast && (<Fragment>, </Fragment>)}
				</Fragment>
			);
		});

		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">아이디 확인</h2>
					<div className="step_num_box">
						<span className="step_num">1</span>
						<span className="step_num active"><span className="blind">현재페이지</span>2</span>
						<span className="step_num">3</span>
					</div>
				</div>
				<section className="join renew renew07">
					<div className="join_info ">
						<ResultMsg/>
						<div className="result_box mt25">
							{/* <!-- CASE : 본인 인증 후 비바샘 회원인 경우 --> */}
							{(check.isExistViva && check.checkCase != '8') && (
								<Fragment>
									{(!check.isExistTsch || check.checkCase == '7') && (
										<Fragment>
											<div className="result_nocheck">
												<span className="lb_txt">비바샘 ID</span>

												<p className={(check.existMemberInActive || check.checkCase == '2' ||  check.checkCase == '6') ? "usable" : "unusable"}>
													<strong className="user_id">
														{check.existMemberId}
													</strong>
												</p>
												{check.existMemberInActive && <span>(사용 불가)</span>}
												{(check.checkCase == '2' ||  check.checkCase == '6' || !check.existIdUsable)&&
												<span className="unusable">
														이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br />
														신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
													</span>
												}
												{/*{(check.checkCase == '2')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
											</div>
										</Fragment>
									)}
									{(check.isExistTsch && check.checkCase != '7') && (
										<Fragment>
											<div className="checkbox_circle_box">
												<input
													type="radio"
													id="resultIntegratedVivasamId"
													className={ "checkbox_circle " + ((check.existMemberInActive || check.checkCase == '2' ||  check.checkCase == '6') ? "usable" : "unusable")}
													value={check.existMemberId}
													name="multipleResultId"
													checked={multipleResultId == check.existMemberId}
													onChange={this.handleChangeMultipleResult}
													disabled={check.existMemberInActive || !check.existIdUsable || check.checkCase == '2' ||  check.checkCase == '6'}
												/>

												<label className="lb_txt" htmlFor="resultIntegratedVivasamId">비바샘 ID</label>
												<p>
													<strong className="user_id">
														{check.existMemberId}
													</strong>
												</p>
												{check.existMemberInActive && <span>(사용 불가)</span>}
												{(check.checkCase == '2' ||  check.checkCase == '6'|| !check.existIdUsable)&&
												<span className="unusable">
														이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br />
														신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
													</span>
												}
												{/*{(check.checkCase == '2')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
											</div>
										</Fragment>
									)}
								</Fragment>
							)}
							{/* <!-- //CASE : 본인 인증 후 비바샘 회원인 경우 --> */}

							{/* <!-- CASE : 본인 인증 후 티스쿨 회원인 경우 --> */}
							{(check.isExistTsch && check.checkCase != '8') && (
								<Fragment>
									<Fragment>{TuserList}</Fragment>
									{/*{(check.checkCase == '4')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
								</Fragment>
							)}
							{/* <!-- // CASE : 본인 인증 후 티스쿨 회원인 경우 --> */}

							{/* <!-- CASE : 이미 통합 회원인 경우 --> */}
							{check.checkCase == '8' && (
								<Fragment>
									<span className="lb_txt">통합회원 ID</span>
									<p className={(check.existMemberInActive || check.checkCase == '2' ||  check.checkCase == '6') ? "usable" : "unusable"}>
										<strong className="user_id">
											{check.existMemberId}
										</strong>
									</p>
								</Fragment>
							)}
							{/* <!-- //  CASE : 이미 통합 회원인 경우 --> */}
						</div>

						{/* <!-- CASE : 본인 인증 후 비바샘 or 티스쿨 아이디를 사용할 수 없는 경우 --> */}
						{(check.checkCase == '2' || check.checkCase == '4' || (check.checkCase == '6' && allTschIdUnusable && !check.existIdUsable)) && (
							<Fragment>
								<h2 className="info_tit mt20"><label htmlFor="lbNewID">신규 통합
									ID</label></h2>
								<div className="input_wrap has_btn">
									<input
										type="text"
										name="userId"
										ref="userId"
										autoCapitalize="none"
										placeholder="4~12자 영문 또는 영문, 숫자 조합"
										id="ipt_id"
										onChange={this.handleChangeId}
										value={info.userId}
										className="input_sm"/>
									<button
										type="button"
										onClick={this.duplicateIdClick}
										className="input_in_btn btn_gray">중복확인
									</button>
								</div>
							</Fragment>
						)}
						{/* <!-- // CASE : 본인 인증 후 비바샘 or 티스쿨 아이디를 사용할 수 없는 경우 --> */}

						{/* <!-- CASE : 통합회원대상 --> */}
						{check.checkCase != '8' && (
							<button
								onClick={this.nextButtonClickSafe}
								className="btn_full_on">통합회원 전환하기
							</button>
						)}
						{/* <!-- // CASE : 통합회원대상 --> */}

						{/* <!-- CASE : 이미 통합회원 --> */}
						{check.checkCase == '8' && (
							<div className="mt15 case5">
								<Link to="/login" className="btn_full_on mt15">로그인</Link>
								<Link to="/find/pw" className="btn_full_off mt10">비밀번호 찾기</Link>
							</div>
						)}
						{/* <!-- //  CASE : 이미 통합회원 --> */}

						<div className="info_tell">
							<div className="tell_box type02">
								<div className="line_box">
									<p className="line_box_tit">비바샘 선생님 전용 고객센터</p>
									<a href="tel:1544-7714" className="ico_tel">
										<img src="../images/member/tell2.png" alt="비바샘 선생님 전용 고객센터"/>
										<span className="blind">1544-7714</span>
									</a>
								</div>
								<div className="line_box">
									<p className="line_box_tit">비바샘 연수원 고객센터</p>
									<a href="tel:1544-9044" className="ico_tel">
										<img src="../images/member/tell3.png" alt="비바샘 연수원 고객센터"/>
										<span className="blind">1544-9044</span>
									</a>
								</div>
							</div>
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
		type: state.join.get('type').toJS(),
		agree: state.join.get('agree').toJS(),
		check: state.join.get('check').toJS(),
		info: state.join.get('info').toJS(),
		sso: state.join.get('sso').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinVerificationResult));
