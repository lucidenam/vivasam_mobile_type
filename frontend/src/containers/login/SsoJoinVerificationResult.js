import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import queryString from 'query-string';
import {debounce} from 'lodash';
import RenderLoading from 'components/common/RenderLoading';

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
		// initializeGtag();
		// function gtag(){
		// 	window.dataLayer.push(arguments);
		// }
		// gtag('config', 'G-B7GPBXLL3E', {
		// 	'page_path': '/join/verifyResult',
		// 	'page_title': '본인 인증 결과 | 회원가입｜비바샘'
		// });

		const {location, agree} = this.props;
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
		const {check, info, history, BaseActions, JoinActions} = this.props;

		try {
			if (check.isExistTsch) {
				info['existTschoolId'] = check.tUsers[0].tid;
			}
			if (!check.isExistViva && check.isExistTsch && !check.isInActiveT && !check.isUsableT && check.isPossibleConversion) {
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
			} else if (check.isPossibleConversion && check.isUsableT) {
				info['existTschoolId'] = check.tUsers[0].tid;
				info['userId'] = check.tUsers[0].tid;
			}
			JoinActions.pushValues({type: 'info', object: info});

			BaseActions.openLoading();
			if (!this.props.test) {
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

	render() {
		let {check, info} = this.props;
		const {result, loading, query} = this.state;

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
				this.props.history.replace('/');
				if (query.uuid && typeof query.uuid !== 'undefined') {
					this.props.history.push('/conversion/check?uuid=' + query.uuid);
				} else {
					this.props.history.push('/conversion/check');
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

	/*	if (check.isExistViva) {
			// 연동화면으로 이동
			this.props.history.push('/#/sns/join/info');
		} else if (!check.isExistTsch) {
			// 정보입력화면으로 이동.
			this.props.history.push('/#/sns/linkage/link');
		}*/

		return (
			<Fragment>
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		test: state.join.get('test'),
		type: state.join.get('type').toJS(),
		agree: state.conversion.get('agree').toJS(),
		check: state.join.get('check').toJS(),
		info: state.join.get('info').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinVerificationResult));
