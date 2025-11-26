import React, {Component, Fragment} from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import * as popupActions from 'store/modules/popup';
import * as myclassActions from 'store/modules/myclass';
import {MyClassSetupPopup} from 'containers/educourse';
import {withRouter} from 'react-router-dom';
import * as common from "../../lib/common";
import {changeMySubject} from 'lib/api';
import {initializeGtag} from "../../store/modules/gtag";

class MyClassSetup extends Component {

    handleOpenSetupPopup = (subjectType) => {
        const { myClassInfo, PopupActions} = this.props;

        if(!subjectType) {
            const { mainSubject, secondSubject } = myClassInfo;
            subjectType = !mainSubject ? "main" : (!secondSubject ? "second" : subjectType);
            if(!subjectType) {
                common.error("내 교과 설정은 2개까지만 가능합니다.");
                return;
            }
        }

        PopupActions.openPopup({title:"내 교과서", componet:<MyClassSetupPopup subjectType={subjectType}/>});
    }

    handleDeleteSecondSubject = async (e) => {
        e.preventDefault();
        const { myClassInfo, MyclassActions } = this.props;

        const response = await changeMySubject(myClassInfo.mainSubject, null);
        if(response.data === 'SUCCESS') {
            common.info("삭제하였습니다.");
            await MyclassActions.myClassInfo();
        }
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/educourse/myclassSetup',
            'page_title': '내 교과서｜비바샘'
        });
        const { logged,  MyclassActions, history, location } = this.props;

        if( !logged ) {
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
            return;
        }

        MyclassActions.myClassInfo();
    }


    render() {
        if(!this.props.myClassInfo || !this.props.myClassInfo.memberId) {
            return false;
        }

        const { schoolLvlCd, mainSubject,mainSubjectName, secondSubject, secondSubjectName } = this.props.myClassInfo;
        let schoolLvlNm = ""
        let markerClazz = "";
        switch(schoolLvlCd) {
            case 'ES':
                schoolLvlNm = '초등';
                markerClazz = "myclass_marker_type1_2";
                break;
            case 'MS':
                schoolLvlNm = '중학';
                markerClazz = "myclass_marker_type1";
                break;
            case 'HS':
                schoolLvlNm = '고등';
                markerClazz = "myclass_marker_type1_3";
                break;
            default:
                schoolLvlNm = '';
        }

        let showAddSubject = !mainSubject || !secondSubject;
        let isEmptySubject = !mainSubject && !secondSubject;

        return (
            <Fragment>
                <div className="guideline new251"></div>
                <section className="set_myclass">
                    <h2 className="blind">내 교과 설정</h2>

                    <div className="set_myclass_top">
                        <div hidden={!showAddSubject}>
                            <button
                                onClick={() => {this.handleOpenSetupPopup();}}
                                className="btn_add_class"><span>내 교과 설정</span></button>
                        </div>
                        <p className="set_myclass_guide">
                            설정하신 교과목을 기준으로<br/>맞춤형 자료 서비스가 제공됩니다.<br/>
                            <em className="set_myclass_marker">(2개까지 가능)</em>
                        </p>
                    </div>

                    <div className="set_myclass_box" hidden={isEmptySubject}>
                        <ul>
                            <li className="set_myclass_list on">
                                <h3 className="myclass_top_tit">
                                    <em className={markerClazz}>{schoolLvlNm}</em> {mainSubjectName}
                                </h3>
                                <a
                                    onClick={() => {this.handleOpenSetupPopup('main');}}
                                    className="myclass_top_edit ico_edit">
                                    <span className="blind">변경</span>
                                </a>
                            </li>
                            <li className="set_myclass_list" hidden={!secondSubject}>
                                <h3 className="myclass_top_tit">
                                    <em className={markerClazz}>{schoolLvlNm}</em> {secondSubjectName}
                                </h3>
                                <a
                                    onClick={() => {this.handleOpenSetupPopup('second');}}
                                    className="myclass_top_edit ico_edit">
                                    <span className="blind">변경</span>
                                </a>
                                <a
                                    onClick={(e) => {
                                        if (window.confirm('삭제하시겠습니까?')) {
                                            this.handleDeleteSecondSubject(e);
                                        }
                                    }}
                                    className="myclass_top_del ico_del">
                                    <span className="blind">리스트에서 삭제</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="guideline"></div>

                    <div className="empty_guide">
                        <span className="icon_noti">학교급에 대한 변경은 [개인정보 수정] 에서 가능합니다.</span>
                        <button className="btn_square_type3" onClick={() => {
                            this.props.history.push("/myInfo/myInfo");
                        }}>개인정보 수정</button>
                    </div>
                </section>
            </Fragment>
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
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(MyClassSetup));
