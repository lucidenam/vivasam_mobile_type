import React, {Component} from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import * as popupActions from 'store/modules/popup';

class GradeChoicePopup extends Component {
    state = {
        grade: '3'
    }

    handleClick = (e) => {
        if(e.target.value === this.state.grade) {
            return;
        }
        this.setState({
            grade: e.target.value
        })
    }

    handleChoiceGrade = (e) => {
        const { handleChoiceGrade, PopupActions } = this.props;
        handleChoiceGrade(this.state.grade);
        PopupActions.closePopup();
    }

    render() {
        const { grade, handleChoiceGrade } = this.state;
        return (
            <section id="pop_content">
                <div className="popup_content setting_grade">
                    <div className="setting_myclass_top">
                        <p className="setting_myclass_ment">원하시는 학년을 선택해 주세요.</p>
                    </div>

                    <div className="setting_myclass_list">
                        {
                            ["3","4","5","6"].map(s => (
                                <button key={s}
                                    type="button"
                                    className={"setting_myclass_link" + (grade === s ? " on" : "")}
                                    value={s}
                                    onClick={this.handleClick}
                                >{s}학년</button>
                            ))
                        }
                    </div>
                </div>

                <button
                    type="button"
                    className="btn_floating"
                    onClick={this.handleChoiceGrade}
                >확인</button>
            </section>
        );
    }
}

export default connect(
    null,
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(GradeChoicePopup);