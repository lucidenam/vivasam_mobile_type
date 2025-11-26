import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from "redux";
import {withRouter} from "react-router-dom";
import * as myclassActions from 'store/modules/myclass';
import * as popupActions from 'store/modules/popup';
import { eduSubjectList } from 'lib/api';
import { TextBookList, GradeChoicePopup} from "containers/educourse";
import { RenderLoading } from 'components/common';

class ElementaryContainer extends Component {
    state = {
        grade: '',
        subjects: null,
        activeSubjectCd: '',
        popupOpen: false
    }

    handleChangeGrade = (e) => {
        const { MyclassActions, logged, myClassInfo } = this.props;
        if(logged && myClassInfo.schoolLvlCd !== 'ES') {
            MyclassActions.pushValues({type:"myDefaultElementaryGrade", object:e.target.value});
        }
        //최근 선택한 학년
        MyclassActions.pushValues({type:"lastElementaryGrade", object:e.target.value});
        if(this._isMounted) {
            // 20190701 학년이 바뀔 경우 5학년 실과 -> 3학년 실과의 경우
            // 3학년 / 4학년 실과가 없으므로 체육으로 대체
            if((e.target.value === '3' && this.state.activeSubjectCd  === "SC329")||
               (e.target.value === '4' && this.state.activeSubjectCd  === "SC329")){
                this.setState({
                    activeSubjectCd : "SC328",
                    grade: e.target.value
                });
            }else{
                this.setState({
                    grade: e.target.value
                });
            }

        }
    };

    handleTabClick = (e) => {
        const { MyclassActions } = this.props;
        //최근 선택한 과목
        MyclassActions.pushValues({type:"lastCafeSubjectCd", object:e.target.value});

        if(this._isMounted) {
            this.setState({
                activeSubjectCd: e.target.value
            });
        }
    }

    handleChoiceGrade = (grade) => {
        const { MyclassActions } = this.props;
        MyclassActions.pushValues({type:"myDefaultElementaryGrade", object:grade});
        if(this._isMounted) {
            this.setState({
                grade,
                popupOpen: false
            });
        }
    }

    getSubjectList = async (schoolLvlCd) => {
        const response = await eduSubjectList(schoolLvlCd);
        if(this._isMounted) {
            this.setState({
                subjects: response.data
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (this.props !== nextProps || this.state !== nextState);
    }

    componentDidMount() {
        this._isMounted = true;
        this.getSubjectList(this.props.schoolLvlCd);
    }

    componentDidUpdate() {
        const { PopupActions } = this.props;
        const { popupOpen } = this.state;

        if(popupOpen) {
            PopupActions.openPopup({title:"학년 선택", componet:<GradeChoicePopup handleChoiceGrade={this.handleChoiceGrade}/>});
            this.setState({
                popupOpen: false
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    static getDerivedStateFromProps(nextProps, nextState) {
        const { myClassInfo, logged, MyclassActions, myDefaultElementaryGrade, lastElementaryGrade, lastCafeSubjectCd, history } = nextProps;

        let st = null;

        if(!nextState.grade) {
            if(history.action === 'POP' && lastElementaryGrade) {
                return {
                    grade: lastElementaryGrade,
                    activeSubjectCd: lastCafeSubjectCd
                }
            }

            //로그인, 계정정보가 있을 경우
            if(logged) {
                if(myClassInfo.memberId) {
                    //학교급이 초등일 경우
                    if(myClassInfo.schoolLvlCd === 'ES') {
                        //1,2학년이면
                        st = {
                            grade: myClassInfo.myGrade < '3' ? '3' : myClassInfo.myGrade,
                            popupOpen: false
                        };
                    }else {
                        if(myDefaultElementaryGrade) {
                            st = {
                                grade: myDefaultElementaryGrade,
                            }
                        }else {
                            MyclassActions.pushValues({type:"myDefaultElementaryGrade", object:"3"});
                            st = {
                                grade: '3',
                                popupOpen: true
                            }
                        }
                    }
                }
            }else {
                //비로그인시 팝업은 보여주지말고 3학년으로 기본 세팅해 놓자(팝업보여주고 싶으면 여기서 true로 설정)
                st = {
                    grade: '3'
                }
            }

            if(st && st.grade) {
                MyclassActions.pushValues({type:"lastElementaryGrade", object:st.grade });
            }
        }

        return st ? st : nextState;
    }

    render() {
        const { grade, subjects, activeSubjectCd, popupOpen } = this.state;

        /*if(grade === '' || popupOpen || subjects.length === 0) {
            return false;
        }*/
        if(subjects === null) {
            return <RenderLoading loadingType={"3"}/>;
        }

        const subjectList = [{
            cafeSubjectCd: "",
            courseCd: "",
            newIconViewYn: "N",
            orderNo: 0,
            subjectCd: "",
            subjectNm: "전체"
        }, ...subjects];

        let activeSubjectCdStr = activeSubjectCd;
        if(!activeSubjectCdStr) {
            activeSubjectCdStr = subjects.map(subject => subject.subjectCd).join(",");
        }

        return (
            <Fragment>
                <div className="guideline"></div>

                <section className="class eleClassWrap">
                    <h2 className="blind">초등</h2>

                    <div className="eleClass_top">
                        <h2 className="ele_tit">{grade}학년</h2>
                        <div className="selectbox selTypeA ele_top_selbox">
                            <select value="" name="grade" onChange={this.handleChangeGrade}>
                                <option value="">다른 학년 보기</option>
                                <option value="3">3학년</option>
                                <option value="4">4학년</option>
                                <option value="5">5학년</option>
                                <option value="6">6학년</option>
                            </select>
                        </div>
                    </div>
                    <div className="tabType">
                        <ul className="tabType_wrap">
                            {
                                subjectList.map(subject => {
                                    const isActive = subject.subjectCd === activeSubjectCd;
                                    return (
                                        /* 3,4 학년 실과가 보이지 않게 수정 - 20190701 */
                                        (!((this.state.grade === '3' && subject.subjectCd === 'SC329') ||
                                           (this.state.grade === '4' && subject.subjectCd === 'SC329'))) &&
                                        <li className={"tabType_list" + (isActive ? " active" : "")} key={subject.subjectCd}>
                                            <button
                                                type="button"
                                                className="tabType_btn"
                                                onClick={this.handleTabClick}
                                                value={subject.subjectCd}
                                            >{subject.subjectNm}</button>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>

                    <TextBookList schoolLvlCd={"ES"} grade={grade} subjectCdStr={activeSubjectCdStr} />
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
        myDefaultElementaryGrade: state.myclass.get('myDefaultElementaryGrade'),
        lastCafeSubjectCd: state.myclass.get('lastCafeSubjectCd'),
        lastElementaryGrade: state.myclass.get('lastElementaryGrade'),
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(ElementaryContainer));