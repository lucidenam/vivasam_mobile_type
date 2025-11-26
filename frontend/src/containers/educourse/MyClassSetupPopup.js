import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as popupActions from 'store/modules/popup';
import * as myclassActions from 'store/modules/myclass';
import { eduSubjectList, changeMySubject } from 'lib/api';
import {bindActionCreators} from 'redux';
import * as common from "../../lib/common";

class Subject extends Component {
    render() {
        const {cafeSubjectCd, subjectNm, handleSubjectClick, selectedSubjectCd} = this.props;
        const isOn = (selectedSubjectCd === cafeSubjectCd);

        return (
            <button
                type="button"
                onClick={() => {
                    handleSubjectClick(cafeSubjectCd, !isOn);
                }}
                className={"setting_myclass_link"+ (isOn ? ' on' : '')}
            >{subjectNm}</button>
        );
    }
}

class MyClassSetupPopup extends Component {
    state = {
        subjects : [],
        selectedMainSubjectCd: '',
        selectedSecondSubjectCd: ''
    }

    getSubjectList = async (schoolLvlCd) => {
        const response = await eduSubjectList(schoolLvlCd);
        this.setState({
            subjects : response.data
        })
    }

    handleSubjectClick = (subjectCd, isOn) => {
        const { subjectType } = this.props;
        const { selectedMainSubjectCd, selectedSecondSubjectCd } = this.state;
        subjectCd = isOn ? subjectCd : '';

        if(subjectType==='main' && selectedSecondSubjectCd !== subjectCd) {
            if(!subjectCd) return;

            this.setState({
                selectedMainSubjectCd: subjectCd
            });
        }else if(subjectType==='second' && selectedMainSubjectCd !== subjectCd) {
            this.setState({
                selectedSecondSubjectCd: subjectCd
            });
        }
    };

    handleSave = async (e) => {
        e.preventDefault();
        const { subjectType, MyclassActions, PopupActions } = this.props;
        const { selectedMainSubjectCd, selectedSecondSubjectCd } = this.state;
        if(subjectType === 'main' && !selectedMainSubjectCd) {
            common.error("대표교과를 선택해주세요.");
            return;
        }
        if(selectedMainSubjectCd === selectedSecondSubjectCd) {
            common.error("같은 (대표/추가)교과를 선택하실 수 없습니다.");
            return;
        }

        const response = await changeMySubject(selectedMainSubjectCd, selectedSecondSubjectCd);
        if(response.data === "SUCCESS") {
            await MyclassActions.myClassInfo();
            common.info("저장하였습니다.");
            PopupActions.closePopup();
        }
    }

    componentDidMount() {
        const { logged, myClassInfo, history } = this.props;

        if( !logged ) {
            history.replace("/login");
            return;
        }

        if(myClassInfo && myClassInfo.memberId) {
            if(myClassInfo.schoolLvlCd) {
                this.getSubjectList(myClassInfo.schoolLvlCd);
            }
            this.setState({
                selectedMainSubjectCd: myClassInfo.mainSubject,
                selectedSecondSubjectCd: myClassInfo.secondSubject
            })
        }
    }

    render() {
        const { myClassInfo, subjectType } = this.props;
        const { subjects } = this.state;

        if(!myClassInfo || !myClassInfo.schoolLvlCd || subjects.length === 0) {
            return false;
        }

        let schoolLvlNm = "";
        let markerClazz = "";
        switch(myClassInfo.schoolLvlCd) {
            case 'ES':
                schoolLvlNm = '초등';
                markerClazz = 'myclass_marker_type1_2';
                break;
            case 'MS':
                schoolLvlNm = '중학';
                markerClazz = 'myclass_marker_type1';
                break;
            case 'HS':
                schoolLvlNm = '고등';
                markerClazz = 'myclass_marker_type1_3';
                break;
            default:
                schoolLvlNm = '';
        }

        let selectedSubjectCd = "";
        let subjectTypeName = "";
        if(subjectType === 'main') {
            selectedSubjectCd = this.state.selectedMainSubjectCd;
            subjectTypeName = "대표";
        }else if(subjectType === 'second') {
            selectedSubjectCd = this.state.selectedSecondSubjectCd;
            subjectTypeName = "추가";
        }

        const subjectList = subjects.map(s => {
            return <Subject {...s} key={s.cafeSubjectCd} selectedSubjectCd={selectedSubjectCd} handleSubjectClick={this.handleSubjectClick}/>;
        });

        return (
            <section id="pop_content">
                <div className="popup_content setting_myclass">
                    <div className="setting_myclass_top">
                        <em className={markerClazz}>{schoolLvlNm}</em>
                        <p className="setting_myclass_ment">{subjectTypeName}교과를 선택해 주세요.</p>
                    </div>

                    <div className="setting_myclass_list">
                        {subjectList}
                    </div>
                </div>

                <button
                    onClick={this.handleSave}
                    type="button"
                    className="btn_floating">설정</button>
            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get("logged"),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch),
    })
)(withRouter(MyClassSetupPopup));