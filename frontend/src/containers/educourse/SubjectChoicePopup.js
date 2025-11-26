import React, {Component} from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import * as popupActions from 'store/modules/popup';
import { eduSubjectList } from 'lib/api';

class SubjectChoicePopup extends Component {
    state = {
        subjects: [],
        activeCafeSubjectCd: ''
    }

    handleClick = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleChoiceSubject = (e) => {
        const { handleChoiceSubject, PopupActions } = this.props;
        handleChoiceSubject(this.state.activeCafeSubjectCd);
        PopupActions.closePopup();
    }

    getSubjectList = async () => {
        const response = await eduSubjectList(this.props.schoolLvlCd);
        this.setState({
            subjects : response.data
        })
    }

    componentDidMount() {
        this.getSubjectList();
    }

    render() {
        const { schoolLvlCd, handleChoiceSubject } = this.props;
        const { subjects, activeCafeSubjectCd } = this.state;

        if(subjects.length === 0) return false;

        const selectedCafeSubjectCd = activeCafeSubjectCd ? activeCafeSubjectCd : subjects[0].cafeSubjectCd;

        return (
            <section id="pop_content">
                <div className="popup_content setting_class">
                    <div className="setting_myclass_top">
                        <p className="setting_myclass_ment">교과를 선택해 주세요.</p>
                    </div>

                    <div className="setting_myclass_list">
                        {
                            subjects.map(s => (
                                    <button
                                        type="button"
                                        name={"activeCafeSubjectCd"}
                                        key={s.subjectCd}
                                        value={s.cafeSubjectCd}
                                        className={"setting_myclass_link"+ (selectedCafeSubjectCd === s.cafeSubjectCd ? " on" : "")}
                                        onClick={this.handleClick}
                                    >{s.subjectNm}</button>
                                )
                            )
                        }
                    </div>
                </div>

                <button
                    type="button"
                    className="btn_floating"
                    onClick={this.handleChoiceSubject}
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
)(SubjectChoicePopup);