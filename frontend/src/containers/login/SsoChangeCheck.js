import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import * as conversionActions from 'store/modules/conversion';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as common from 'lib/common';
import {debounce} from 'lodash';
import RenderLoading from 'components/common/RenderLoading';
import {initializeGtag} from "../../store/modules/gtag";
import queryString from "query-string";

class SsoChangeCheck extends Component {

	constructor(props) {
		super(props);
		// Debounce
		this.nextButtonClick = debounce(this.nextButtonClick, 300);

		this.ssoId = React.createRef();
		this.tId = React.createRef();
		this.vUser = React.createRef();
		this.tUsers = React.createRef();

		// this.userId = React.createRef();
	}

	state = {
		loading: true,
		duplicateIdCheck: false,
		multipleResultCheck: false,
		multipleResultId: "",
		allTschIdUnusable: false,
	}

	componentDidMount() {
		initializeGtag();

		function gtag() {
			window.dataLayer.push(arguments);
		}

		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/conversion/check',
			'page_title': '아이디 확인 | 통합전환｜비바샘'
		});
		this._isMounted = true;
		const {logged, agree, history, ConversionActions, location} = this.props;

		//미로그인시 로그인페이지 이동
		if (!logged) {
			history.replace("/login");
			return;
		}

		//redux 값은 새로고침시 사라짐 / 처음부터 다시 입력하게 함
		if (!agree.thirdPrivacy) {
			const marketingYn = agree.thirdMarketing;

			if (marketingYn == null) {
				history.replace('/conversion/agree');
			} else {
				agree.special = true;
				agree.thirdPrivacy = true;
				agree.tschService = true;
				agree.tschPrivacy = true;
				agree.tschThirdParty = true;
				agree.thirdMarketing = marketingYn == 'true' ? true : false;
				agree.all = marketingYn == 'true' ? true : false;
				ConversionActions.pushValues({type: "agree", object: agree});
			}
		}

		//본인 소유 아이디 확인
		let query = queryString.parse(location.search);
		if (!this.props.test) {
			if (!query.uuid || typeof query.uuid === 'undefined') {
				this.getCheckConversionId("");
			} else {
				this.getCheckConversionId(query.uuid);
			}
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	checkAllTschIdUnusable = async () => {
		const {check} = this.props;
		const tschIdLen = check.isExistTsch ? check.tUsers.length : 0;
		let unusabletschIdLen = 0;
		if (tschIdLen < 1) return;

		check.tUsers.map((tuser, i) => {
			if (tuser.isusable == 'false') unusabletschIdLen++;
		});

		if (unusabletschIdLen === tschIdLen) {
			this.setState({
				allTschIdUnusable: true
			})
		}
	}

	setIdByCheckCase = async () => {
		const {check, info, ConversionActions} = this.props;

		if (check.tUsers.length > 1 || (check.isExistViva && check.isExistTsch)) {
			if (check.checkCase == '7') {
				check['ssoId'] = check.existMemberId;
			} else {
				this.setState({
					multipleResultCheck: true,
				})
			}
		} else {
			if (check.isExistViva) {
				if (!check.existMemberInActive) {
					check['ssoId'] = check.existMemberId;
				}
			} else if (check.isExistTsch) {
				check['ssoId'] = check.tUsers[0].tid;
			}

			ConversionActions.pushValues({type: 'check', object: check});
		}
	}

	getCheckConversionId = async (uuid) => {
		const {ConversionActions, BaseActions} = this.props;
		const encodeUuid = uuid === "" ? "" : encodeURIComponent(uuid);
		const param = {uuid: encodeUuid}
		try {

			const {check} = await ConversionActions.checkSsoConversionId(param);
			ConversionActions.pushValues({type: 'check', object: check});
			if (this._isMounted && this.props.check.vUser) {
				this.setState({loading: false});
			}
			window.scrollTo(0, 0)

			this.setIdByCheckCase();
			this.checkAllTschIdUnusable();

			console.log(this.props.check);
		} catch (e) {
			console.log(e);
		} finally {
			this.setState({loading: false});
		}

	}

	handleDefalutId = (ssoId) => {
		const {check, ConversionActions} = this.props;
		check['ssoId'] = ssoId;
		ConversionActions.pushValues({type: "check", object: check});
	}

	//통합 아이디 선택시
	handleChange = (e) => {
		const {check, ConversionActions} = this.props;
		check['ssoId'] = e.target.value;
		ConversionActions.pushValues({type: "check", object: check});
		this.setState({duplacateIdCheck: true});
	}


	//통합 신규 아이디 변경시 입력 체크
	handleChangeId = (e) => {
		const {check, ConversionActions} = this.props;
		check['ssoId'] = e.target.value;
		ConversionActions.pushValues({type: "check", object: check});

		this.setState({
			duplicateIdCheck: false
		});
	}

	//중복 아이디 체크
	duplicateIdClick = async (e) => {
		const {check, ConversionActions, BaseActions} = this.props;
		var idCheck = /^[a-z0-9]{3,12}$/g;
		if (!idCheck.test(check.ssoId)) {
			common.error("아이디는 영소문자로 시작하는 4~12자 영문자 또는 영문자+숫자이어야 합니다.");
			this.refs.userId.focus();
			return false;
		}
		try {
			// this.setState({loading: true});
			let code = await ConversionActions.checkSsoUserId(check.ssoId);
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
		} finally {
			// this.setState({loading: false});
		}
	}

	nextButtonClickSafe = (e) => {
		this.nextButtonClick(e.target);
	}

	nextButtonClick = async (target) => {
		const {check, info, history, BaseActions, ConversionActions} = this.props;
		const {multipleResultId, multipleResultCheck} = this.state;

		try {
			if (check.isExistTsch) {
				info['existTschoolId'] = check.tUsers[0].tid;
				ConversionActions.pushValues({type: 'info', object: info});
			}

			//신규 아이디 입력받는 경우
			if (check.checkCase == '2' || check.checkCase == '4' || check.checkCase == '6') {
				//아이디 중복 체크여부 확인.
				if (check.ssoId === "") {
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
				if (multipleResultCheck) {
					if (multipleResultId === "") {
						common.error('아이디를 선택해주세요.');
						return false;
					}
					check['ssoId'] = multipleResultId;
				}
			}

			ConversionActions.pushValues({type: 'check', object: check});

			//단독회원 이메일 승계
			//티스쿨 아이디 선택시
			if(check.tUsers.length > 0) {
				check.tUsers.map((data, index) => {
					if(data.tid === check.ssoId) info.email = data.email;
				});
			}
			//비바샘 아이디 선택시
			if(check.existMemberId === check.ssoId) info.email = check.existVivaEmail;

			ConversionActions.pushValues({type: 'info', object: info});

			console.log("info", info)

			BaseActions.openLoading();

			if (check.checkCase !== '0' && check.checkCase !== '8') { // checkCase가 1, 2, 5, 6, 7경우
				history.push('/conversion/info');
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

	//아이디가 다중선택일 경우
	handleChangeMultipleResult = (e) => {
		this.setState({
			multipleResultId: e.target.value,
		})
	};

	render() {

		const {check, info} = this.props;
		const {loading, multipleResultId, allTschIdUnusable} = this.state;

		if (loading) return <RenderLoading loadingType={"2"}/>;
		if (check.exception) {
			return (
					<Fragment>
						<section className="join">
							<div className="join_agree">
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
			if (check.sMessage != null && check.sMessage != '') {
				common.error(check.sMessage);
				this.props.history.replace('/');
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
			message = ['이미 비바샘 회원으로 가입되어 있습니다.', <br/>, '지금 통합회원으로 전환하세요.'];

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


		const ResultMsg = ({isNewId}) => {
			let clazz = isNewId ? 'footnote_line' : 'footnote';
			return (
					// <div className={clazz}>
					// 	{message.map((line, i) => {
					// 		return (
					// 			<Fragment key={i}>{line}</Fragment>
					// 		)
					// 	})}
					// </div>
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
			if ((check.tUsers.length === 1 && !check.isExistViva) || check.checkCase == '7') {
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
                                	이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br/>
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
										className={"checkbox_circle " + (tuser.isusable == 'true' ? "usable" : "unusable")}
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
                                	이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br/>
                                	신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
                                </span>
								}
							</div>
						</Fragment>
				);
			}
		});

		return (
				<Fragment>
					<div id="sticky" className="step_wrap">
						<h2 className="step_tit">본인 인증 결과</h2>
						<div className="step_num_box">
							<span className="step_num">1</span>
							<span className="step_num active"><span className="blind">현재페이지</span>2</span>
							<span className="step_num">3</span>
						</div>
					</div>

					<section className="join renew conversion renew07">
						<div className="join_agree">
							<div className="join_info">
								<ResultMsg/>
								<div className="result_box mt25">
									{/* <!-- CASE : 본인 인증 후 비바샘 회원인 경우 --> */}
									{(check.isExistViva && check.checkCase != '8') && (
											<Fragment>
												{(!check.isExistTsch || check.checkCase == '7') && (
														<Fragment>
                                <div className="result_id_box">
                                  <div className="result_nocheck">
                                    <span className="lb_txt">비바샘 ID</span>

                                    <p className={(check.existMemberInActive || check.checkCase == '2' || check.checkCase == '6') ? "usable" : "unusable"}>
                                      <strong className="user_id">
                                        {check.existMemberId}
                                      </strong>
                                    </p>
																		{check.existMemberInActive && <span>(사용 불가)</span>}
                                    {/*{(check.checkCase == '2')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
                                  </div>
                                </div>
                                {(check.checkCase == '2' || check.checkCase == '6' || !check.existIdUsable) &&
                                <span className="unusable">
                                    이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br/>
                                    신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
                                  </span>
                                }
														</Fragment>
												)}
												{(check.isExistTsch && check.checkCase != '7') && (
														<Fragment>
                                <div className="result_id_box">
                                  <div className="checkbox_circle_box">
                                    <input
                                        type="radio"
                                        id="resultIntegratedVivasamId"
                                        className={"checkbox_circle " + ((check.existMemberInActive || check.checkCase == '2' || check.checkCase == '6') ? "usable" : "unusable")}
                                        value={check.existMemberId}
                                        name="multipleResultId"
                                        checked={multipleResultId == check.existMemberId}
                                        onChange={this.handleChangeMultipleResult}
                                        disabled={check.existMemberInActive || !check.existIdUsable || check.checkCase == '2' || check.checkCase == '6'}
                                    />

                                    <label className="lb_txt" htmlFor="resultIntegratedVivasamId">비바샘 ID</label>
                                    <p>
                                      <strong className="user_id">
                                        {check.existMemberId}
                                      </strong>
                                    </p>
                                    {check.existMemberInActive && <span>(사용 불가)</span>}
                                    {/*{(check.checkCase == '2')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
                                  </div>
                                </div>
                                {(check.checkCase == '2' || check.checkCase == '6' || !check.existIdUsable) &&
                                <span className="unusable">
														이 아이디는 비바샘 연수원에서(비바샘에서) 이미 사용중입니다.<br/>
														신규 아이디를 입력하고 지금 바로 통합회원으로 전환하세요!
													</span>
                                }
														</Fragment>
												)}
											</Fragment>
									)}
									{/* <!-- //CASE : 본인 인증 후 비바샘 회원인 경우 --> */}

									{/* <!-- CASE : 본인 인증 후 티스쿨 회원인 경우 --> */}
									{(check.isExistTsch && check.checkCase != '8') && (
											<Fragment>
												<Fragment>
													<div className="result_id_box">
														{TuserList}
													</div>
													</Fragment>
												{/*{(check.checkCase == '4')&& <span className="unusable">새로운 아이디를 입력해 주세요.</span>}*/}
											</Fragment>
									)}
									{/* <!-- // CASE : 본인 인증 후 티스쿨 회원인 경우 --> */}

									{/* <!-- CASE : 이미 통합 회원인 경우 --> */}
									{check.checkCase == '8' && (
											<Fragment>
												<div className="result_id_box">
												<span className="lb_txt">통합회원 ID</span>
												<p className={(check.existMemberInActive || check.checkCase == '2' || check.checkCase == '6') ? "usable" : "unusable"}>
													<strong className="user_id">
														{check.existMemberId}
													</strong>
												</p>
												</div>
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
														value={check.ssoId}
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
							</div>
						</div>
					</section>
				</Fragment>
		);
	}
}

export default connect(
		(state) => ({
			logged: state.base.get("logged"),
			agree: state.conversion.get('agree').toJS(),
			info: state.conversion.get('info').toJS(),
			check: state.conversion.get('check').toJS(),
			loginInfo: state.base.get('loginInfo').toJS(),
		}),
		(dispatch) => ({
			ConversionActions: bindActionCreators(conversionActions, dispatch),
			BaseActions: bindActionCreators(baseActions, dispatch)
		})
)(withRouter(SsoChangeCheck));