import React, {Component} from 'react';

import './Event.css';
import {debounce} from "lodash";
import * as common from "../../../../lib/common";
import connect from "react-redux/lib/connect/connect";
import {bindActionCreators} from "redux";
import * as popupActions from "../../../../store/modules/popup";
import * as SaemteoActions from "../../../../store/modules/saemteo";
import * as myclassActions from "../../../../store/modules/myclass";
import * as baseActions from "../../../../store/modules/base";
import {withRouter} from "react-router-dom";

class EventApply extends Component {
	state = {
		eventContents: '',
		eventLength: 0,
	}
	constructor(props) {
		super(props);
		this.state = {
			eventContents: '',
			eventLength: 0,
		};
	}
	// 내용 입력
	setApplyContent = (e) => {
		if (e.target.value.length > 200) {
			return false;
		}
		this.setState({
			eventLength: e.target.value.length,
			eventContents: e.target.value
		});
	};

	eventApply = async () => {
        /*if (!await this.prerequisite()) {
            return;
        }*/

        try {
            // 신청 처리
            await this.insertApplyForm();
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    };

    insertApplyForm = async () => {
        const {event, history, SaemteoActions, BaseActions} = this.props;
		const { eventContents } = this.state;

        try {
            BaseActions.openLoading();

            var params = {
                eventId: 550,
                eventAnswerDesc: '',
				eventAnswerDesc2: eventContents,
            };

            let response = await SaemteoActions.insertEventApply(params);

            if (response.data.code === '1') {
                common.error("이미 신청 하셨습니다.");
            } else if (response.data.code === '0') {
                // 신청 완료..
                history.push('/saemteo/event/view/'+548);
            } else if (response.data.code === '5') {
                common.error("마일리지의 잔액이 모자랍니다. 다시 확인해주세요.");
            } else if (response.data.code === '6') {
                common.error("마일리지 적립/차감에 실패하였습니다.\n비바샘으로 문의해 주세요. (1544-7714)");
            } else {
                common.error("신청이 정상적으로 처리되지 못하였습니다.");
            }

        } catch (e) {
            console.log(e);
            common.info(e.message);
            history.push('/saemteo/event/view/'+548);
        } finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

	render() {

		return (
			<section className="vivasamter event548 evtReplayPopup">
				<h2 className="blind">
					미리보기
				</h2>
				<div className="applyDtl_top top_yell topStyle2">
					<div className="applyDtl_cell ta_c pick color2">
						<h3>후기 작성</h3>
					</div>
				</div>
				<div className="evtReplayBox">
					<strong>비바클래스 이용 후기 또는 업데이트 예정 기능에 대한 기대평을 작성해 보세요!</strong>
					<p>당첨자 선정에 추첨될 확률이 높아져요.</p>

					<div className="input_wrap">
						<textarea
							name="applyContent"
							id="ipt_textarea"
							cols="1"
							rows="10"
							maxLength="200"
							value={this.state.eventContents}
							onChange={this.setApplyContent}
							placeholder="비바클래스 이용 후기 또는 업데이트 예정 기능에 대한 기대평을 남겨주세요. (최대 200자)"
							className="ipt_textarea">
						</textarea>
					</div>
					<div className="count_wrap"><p className="count"><span>{this.state.eventLength}</span>/200</p></div>
					<button
						type="button"
						onClick={this.eventApply}
						className="btn_event_apply">작성 완료
					</button>
				</div>
			</section>

		);
	}
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event: state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(SaemteoActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(EventApply));