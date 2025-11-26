import React, {Component, Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import * as joinActions from 'store/modules/join';
import * as baseActions from 'store/modules/base';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SsoPersonalIdentification from './SsoPersonalIdentification';
import {initializeGtag} from "../../store/modules/gtag";

class JoinVerification extends Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		initializeGtag();
		function gtag(){
			window.dataLayer.push(arguments);
		}
		gtag('config', 'G-MZNXNH8PXM', {
			'page_path': '/join/verify',
			'page_title': '본인 인증 | 회원가입｜비바샘'
		});
		const {type, agree, check, history} = this.props;


		this.update = this.update.bind(this);
	}

	update(uuid) {
		this.props.history.push({
			pathname: '/conversion/verifyResult',
			search: '?uuid=' + uuid
		});
	}

	render() {
		let container = <SsoPersonalIdentification callback={this.update} isJoin={true}/>;

		return (
			<Fragment>
				<div id="sticky" className="step_wrap">
					<h2 className="step_tit">본인 인증</h2>
					<div className="step_num_box">
						<span className="step_num">1</span>
						<span className="step_num active"><span className="blind">현재페이지</span>2</span>
						<span className="step_num">3</span>
						<span className="step_num">4</span>
						<span className="step_num">5</span>
					</div>
				</div>
				<section className="join">
					{container}
				</section>
			</Fragment>
		);
	}
}

export default connect(
	(state) => ({
		type: state.join.get('type').toJS(),
		agree: state.conversion.get('agree').toJS(),
		check: state.join.get('check').toJS(),
		info: state.join.get('info').toJS()
	}),
	(dispatch) => ({
		JoinActions: bindActionCreators(joinActions, dispatch),
		BaseActions: bindActionCreators(baseActions, dispatch)
	})
)(withRouter(JoinVerification));
