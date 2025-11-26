import React, {Component} from 'react';

import './Event.css';

import connect from "react-redux/lib/connect/connect";
import {bindActionCreators} from "redux";
import * as SaemteoActions from 'store/modules/saemteo';
import {withRouter} from "react-router-dom";

class EventDetail extends Component {

	componentDidMount = async () => {
		const {eventAnswer} = this.props;
		console.log(eventAnswer.url);
	};

	render() {
		const {eventAnswer} = this.props;
		return (
			<section className="vivasamter event240809 evtDetail">
				<h2 className="blind">
					미리보기
				</h2>
				<div className="evtItemWrap">
					<video src={eventAnswer.url} controls></video>
				</div>
			</section>

		);
	}
}

export default connect(
	(state) => ({
		logged: state.base.get('logged'),
		loginInfo: state.base.get('loginInfo').toJS(),
		eventAnswer: state.saemteo.get('eventAnswer').toJS()
	}),
	(dispatch) => ({
		SaemteoActions: bindActionCreators(SaemteoActions, dispatch)
	})
)(withRouter(EventDetail));