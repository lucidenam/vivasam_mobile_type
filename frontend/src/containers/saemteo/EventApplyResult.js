import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import {bindActionCreators} from 'redux';
import SurveyBanner from 'components/saemteo/SurveyBanner';

class EventApplyResult extends Component {

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    handleClick = async(e) => {
        e.preventDefault();
        const { eventId, PopupActions, history } = this.props;
        await PopupActions.closePopup();
        if (eventId == 515) {
            window.location.href = 'https://www.vivasam.com/aiSam/info';
            // window.open = 'https://www.vivasam.com/aiSam/info';
        } else if (eventId == 520 || eventId == 521) {
            window.location.href = "https://e.vivasam.com/visangTextbook/2022/story";
        } else {
            history.push('/saemteo/event/view/' + eventId);
        }
    }

    handleSurveyClick = async(e) => {
        e.preventDefault();
        const { history,PopupActions } = this.props;
        await PopupActions.closePopup();
        history.push('/saemteo/survey');
    }

    render() {
        let handleEventApplyResultClose;
        const {eventId, surveyList, handleClose} = this.props;
        // handleClose callback 함수 전달시 해당함수 실행, 그렇지 않을 경우 this.handleClick 함수실행, eventId 331 이후 부터 적용

        if (eventId == 515 || eventId == 520 || eventId == 521) {
            handleEventApplyResultClose = this.handleClick
        } else if (eventId >= '331') {
            handleEventApplyResultClose = handleClose
        } else {
            handleEventApplyResultClose = this.handleClick;
        }

        return (
            <section id="pop_content">
                <div className="vivasam_event">
                    {eventId == '524' ? (
                      <div className="join_complete_txt mt40">
                          <strong className="join_complete_tit">
                              교과서 신청이 완료되었습니다.
                          </strong>
                      </div>
                    ) : (
                      <div className="join_complete_txt mt40">
                          <strong className="join_complete_tit">
                              이벤트에 <span className="join_complete_marker">정상 참여</span> 되셨습니다.
                          </strong>
                          <p className="join_complete_desc mt5">감사합니다.</p>
                        </div>
                    )}
                    <div className="join_complete_btn mt25">
                        <a
                            href=""
                            onClick={handleEventApplyResultClose}
                            className="btn_full_on">확인</a>
                    </div>
                </div>
                {/*
				<div className="vivasam_event">
					<div className="join_complete_txt mt40">
						<strong className="join_complete_tit">
							이벤트에 <span className="join_complete_marker">정상 참여</span> 되셨습니다.
						</strong>
						<p className="join_complete_desc mt5">감사합니다.</p>
					</div>
					<div className="join_complete_btn mt25">
						<a
							href=""
							onClick={handleEventApplyResultClose}
							className="btn_full_on">확인</a>
					</div>
				</div>
				*/}
            </section>
        )
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(EventApplyResult));
