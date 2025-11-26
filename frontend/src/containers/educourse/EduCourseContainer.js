import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import * as myclassActions from 'store/modules/myclass';
import * as popupActions from 'store/modules/popup';
import { eduSubjectList } from 'lib/api';
import { TextBookList, SubjectChoicePopup} from "containers/educourse";
import Myclass from "store/modules/myclass";

class EduCourseContainer extends Component {
    state = {
        subjects: [],
        activeCafeSubjectCd: '',
        popupOpen: false,
        initialize: false,
        counter : 0,
        myTextbookList : [],
        subjectTypeCd : ''
    }

    handleChangeSubject = (e) => {
        const { MyclassActions } = this.props;

        MyclassActions.pushValues({type:"subjectTypeCd", object:e.target.value});
        this.setState({
            subjectTypeCd: e.target.value
        });
    }

    handleChoiceSubject = (activeCafeSubjectCd) => {
        const { MyclassActions, myClassInfo } = this.props;

        if(myClassInfo.schoolLvlCd === 'ES') {
            MyclassActions.pushValues({type:"myDefaultCafeSubjectCd", object:activeCafeSubjectCd});
        }

        MyclassActions.pushValues({type:"lastCafeSubjectCd", object:activeCafeSubjectCd});

        this.setState({
            activeCafeSubjectCd,
            popupOpen: false
        });
    }

    getSubjectList = async (schoolLvlCd) => {
        try{
            const response = await eduSubjectList(schoolLvlCd);
            if(this._isMounted) {
                this.setState({
                    subjects : response.data
                })
            }
        }catch(e) {
            console.error(e);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.schoolLvlCd !== nextProps.schoolLvlCd) {
            this.getSubjectList(nextProps.schoolLvlCd);
            return false;
        }
        return (this.props !== nextProps || this.state !== nextState);
    }

    componentDidMount() {
        this._isMounted = true;
        const { schoolLvlCd, activeSubjectCd, logged, MyclassActions } = this.props;
        this.getSubjectList(schoolLvlCd);
        if(logged) {
            this.getMyTextBookInfoList();
        }
        this.setState({
            activeCafeSubjectCd : activeSubjectCd
        });
    }

    componentDidUpdate() {
        const { PopupActions, schoolLvlCd, activeSubjectCd, loginInfo } = this.props;
        const { popupOpen, initialize } = this.state;

        if(popupOpen && !initialize && loginInfo.schoolLvlCd !== 'ES') {
            PopupActions.openPopup({title:"교과 선택", componet:<SubjectChoicePopup schoolLvlCd={schoolLvlCd} handleChoiceSubject={this.handleChoiceSubject}/>});
            this.setState({
                popupOpen: false,
                initialize: true
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    static getDerivedStateFromProps(nextProps, nextState) {
        const { myClassInfo, logged, myDefaultCafeSubjectCd, MyclassActions, lastCafeSubjectCd, history } = nextProps;
        const { activeCafeSubjectCd } = nextState;

        let st = null;

        if(!activeCafeSubjectCd) {
            if(history.action === 'POP' && lastCafeSubjectCd) {
                return {
                    activeCafeSubjectCd: lastCafeSubjectCd
                }
            }

            //로그인, 계정정보가 있을 경우
            if(logged) {
                // && !popupOpen && !
                if(myClassInfo.memberId) {
                    //내 학교급과 다른 경우 팝업
                    if(myClassInfo.schoolLvlCd === 'ES') {
                        if(myDefaultCafeSubjectCd) {
                            st = {
                                activeCafeSubjectCd: myDefaultCafeSubjectCd
                            };
                        }else {
                            st = {
                                popupOpen: true
                            };
                        }
                    } else{
                        //메인 교과를 default로 설정
                        st = {
                            activeCafeSubjectCd: myClassInfo.mainSubject
                        };
                    }
                }

                if(st && st.activeCafeSubjectCd) {
                    MyclassActions.pushValues({type: "lastCafeSubjectCd", object: st.activeCafeSubjectCd});
                }
            }
        }

        return st ? st : nextState;
    }

    handleChildCount = (childCount) => {
        this.setState({
            counter : childCount
        });
    }

    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;
        try {
            const response = await MyclassActions.myTextBooks();

            this.setState({
                myTextbookList : response.data
            })
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { schoolLvlCd,mdValue, activeSubjectCd, history, logged } = this.props;
        const { subjects, activeCafeSubjectCd, counter,subjectTypeCd } = this.state;

        if(subjects.length === 0) return false;

        let schoolLvlNm = '';
        switch(schoolLvlCd) {
            case 'MS':
                schoolLvlNm = '중등';
                break;
            case 'HS':
                schoolLvlNm = '고등';
                break;
            default:
                schoolLvlNm = '';
        }

        let activeSubject = subjects.find(s => s.cafeSubjectCd === (activeSubjectCd !== '' ?  activeSubjectCd : activeCafeSubjectCd));
        if (!activeSubject && activeSubjectCd === 'SC117') {
            activeSubject = subjects.find(s => s.cafeSubjectCd === 'SC107');
        }
        else if (!activeSubject) activeSubject = subjects[0];

        //cafeSubjectCd
        return (
            <Fragment>
                <div className="guideline"></div>

                <section className="class middleClassWrap">
                    <h2 className="blind">{schoolLvlNm}</h2>

                    <div className="eleClass_top">
                        <h2 className="blind">{activeSubject.subjectNm}</h2>
                        <div className="counter">총 {counter}개</div>
                        { schoolLvlNm === '고등' ? <div className="selectbox selTypeC ele_top_selbox">
                            <select value={this.state.subjectTypeCd} name="subjectTypeCd" onChange={this.handleChangeSubject}>
                                <option value="">전체</option>
                                <option value="1">공통 선택</option>
                                <option value="2">일반 선택</option>
                                <option value="3">진로 선택</option>
                                <option value="4">융합 선택</option>
                                {/*{
                                    subjects.map(s => (<option value={s.cafeSubjectCd} key={s.subjectCd}>{s.subjectNm}</option>))
                                }*/}
                            </select>
                        </div>: ''}
                    </div>

                    <TextBookList schoolLvlCd={schoolLvlCd} subjectCdStr={activeSubject.subjectCd} mdValue={mdValue} sendDataToParent={this.handleChildCount} myTextbookList={this.state.myTextbookList} getMyTextBookInfoList={this.getMyTextBookInfoList} history={history} logged={logged} subjectTypeCd={subjectTypeCd} />
                </section>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo'),
        myDefaultCafeSubjectCd: state.myclass.get('myDefaultCafeSubjectCd'),
        lastCafeSubjectCd: state.myclass.get('lastCafeSubjectCd'),
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(EduCourseContainer));