import React, {Component} from 'react';
import Sticky from 'react-sticky-el';
import {getCourseBaseClassInfoList, getTextBookInfo} from 'lib/api';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import * as baseActions from 'store/modules/base';
import {withRouter} from "react-router-dom";
import {
    CommonDataDetail,
    LectureDataDetail,
    SpecialDataDetail,
    TextBookDataList,
    TextBookDetail
} from 'containers/educourse';
import RenderLoading from 'components/common/RenderLoading';
import * as popupActions from 'store/modules/popup';
import * as myclassActions from 'store/modules/myclass';
import EduCoursePopupContainer from "../main/EduCoursePopupContainer";


class TextBookContainer extends Component {
    state = {
        textbookInfo: {},
        textbookDvdCnt: '',
        periodCheck: '',
        gubunCd: 'L', //L(단원), C(공통), S(특화), T(유형)
        class1Cd: '',
        class1Nm: '',
        class2Cd: '',
        class2Nm: '',
        lectureList: [],
        commonList: [],
        SpecialList: [],
        allList: null,
        newIcon: '',
        smartTextbookInfo: '',
        textbookUrlInfo: ''
    }

    getTextBookInfo = async () => {
        const { textbookCd, BaseActions } = this.props;
        try {
            const response = await getTextBookInfo(textbookCd);

            if(this._isMounted) {
                this.setState({
                    textbookInfo: response.data.textbookInfo,
                    textbookDvdCnt: response.data.textbookDvdCnt,
                    periodCheck: response.data.periodCheck,
                    smartTextbookInfo : response.data.textbookSmartInfo,
                    textbookUrlInfo : response.data.textbookUrlInfo
                });
            }

            const textbookNm = response.data.textbookInfo.textbookNm;
            let classNm = textbookNm.substring(0,textbookNm.lastIndexOf("(")).trim(); //과목명
            let teacherNm = textbookNm.substring(textbookNm.lastIndexOf("(")).trim(); //담당자명

            BaseActions.pushValues({type: "title", object: classNm + " " + teacherNm});

        }catch (e) {
            console.log(e);
        }
    }

    getCourseBaseClassInfoList = async () => {
        const { textbookCd } = this.props;
        try {
            const response = await getCourseBaseClassInfoList(textbookCd, null);

            const allList = response.data;
            const lectureList = response.data.filter(d => d.gubunCd === 'L');
            const commonList = response.data.filter(d => d.gubunCd === 'C');
            const SpecialList = response.data.filter(d => d.gubunCd === 'S');

            SpecialList.forEach(list => {
                if (list.newIcon.indexOf("newIcon") > -1) {
                    this.setState({newIcon: " newIcon"});
                }
            });

            if(this._isMounted) {
                this.setState({
                    lectureList,
                    commonList,
                    SpecialList,
                    allList
                });
            }

            if (lectureList.length <= 0) {
                this.setState({
                    gubunCd : "C"
                })
            }
        } catch (e) {
            console.log(e);
        }
    }

    handleTabClick = (gubunCd) => {
        this.setState({
            gubunCd,
            class1Cd: ''
        })
    }

    handleShowDetail = (data) => {
        const { class1Cd, class1Nm, class2Cd, class2Nm, gubunCd } = data;
        this.setState({
            class1Cd,
            class1Nm: gubunCd==='L' ? data.unitNum + '. ' + data.class1Nm : class1Nm,
            class2Cd,
            class2Nm
        });
    }


    componentDidMount() {
        this._isMounted = true;
        this.getTextBookInfo();
        this.getCourseBaseClassInfoList();
    }

    componentWillUnmount() {
        this._isMounted = false;
        const {title} = this.props;
        const {textbookInfo} = this.state;
        if(textbookInfo && textbookInfo.textbookNm === title) {
            this.props.BaseActions.pushValues({type: "title", object: ''});
        }
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;

        try {
            let result = await MyclassActions.myClassInfo();
            return result.data;
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { textbookInfo, textbookDvdCnt, gubunCd, class1Cd, class1Nm, class2Cd, class2Nm, periodCheck , commonList, lectureList, SpecialList, newIcon, smartTextbookInfo, textbookUrlInfo} = this.state;
        const { textbookCd } = this.props;
        if(!textbookInfo.textbookCd || this.state.allList === null) {
            return <RenderLoading loadingType={"1"}/>;
        }

        let container;

        if(gubunCd === 'C') {
            container = <CommonDataDetail textbookCd={textbookCd}
                                          types={commonList}
            />
        }else if(class1Cd) {
            if(gubunCd === 'L') {
                container = <LectureDataDetail textbookCd={textbookCd}
                                               gubunCd={gubunCd}
                                               class1Cd={class1Cd}
                                               class1Nm={class1Nm}
                                               class2Cd={class2Cd}
                                               class2Nm={class2Nm}
                                               periodCheck={periodCheck}/>
            }else if(gubunCd === 'S') {
                container = <SpecialDataDetail textbookCd={textbookCd}
                                               class2Cd={class2Cd}
                                               class2Nm={class2Nm}/>
            }
        }else {
            let dataList = [];
            if(gubunCd === 'L') {
                dataList = lectureList;
            }else if(gubunCd === 'S') {
                dataList =  SpecialList;
            }

            container = <TextBookDataList textbookInfo={textbookInfo} textbookCd={textbookCd} gubunCd={gubunCd} dataList={dataList} handleShowDetail={this.handleShowDetail}/>;
        }

        function gtag(){
            window.dataLayer.push(arguments);
        }

        return (
            <section className="classbytimes">
                <h2 className="blind">{textbookInfo.textbookNm}</h2>

                <TextBookDetail {...textbookInfo} textbookDvdCnt={textbookDvdCnt} smartTextbookInfo = {smartTextbookInfo} textbookUrlInfo = {textbookUrlInfo}/>

                {/*배너영역*/}
                <div className="banner_area type1" hidden={true}>
                    <a href="https://google.com" className="banner_area_in">
                        <img
                            src="https://www.vivasam.com/images/logo/logo_default.jpg"
                            alt=""
                            className="banner_area_img"/>
                    </a>
                </div>
                {/*//배너영역*/}

                <Sticky>
                    <div className="tab_wrap tabType02">
                        <ul className={"tab" + (lectureList.length > 0 ? " tab-col3" : " tab-col2")}>
                            <li className={"tab_item"+ (gubunCd === 'C' ? " active" : "")} style={{textAlign: "center"}}>
                                <a
                                    onClick={()=> {
                                        this.handleTabClick('C');
                                        gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '연간 공통 자료', 'parameter_url': window.location.href});
                                    }}
                                    name="gubunCd"
                                    value="C"
                                    className="tab_link"
                                >
                                    <span>연간 공통 자료</span>
                                </a>
                            </li>
                            <li className={"tab_item"+ (gubunCd === 'L' ? " active" : "")} style={{display: lectureList.length > 0 ? "" : "none"}}>
                                <a
                                    onClick={()=> {
                                        if (lectureList.length > 0) {
                                            this.handleTabClick('L');
                                        }
                                        gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '단원별 자료', 'parameter_url': window.location.href});
                                    }}
                                    className="tab_link"
                                    name="gubunCd"
                                    value="L"
                                >
                                    <span style={{color: lectureList.length > 0 ? "" : "#b6b4b4"}}>단원별 자료</span>
                                </a>
                            </li>
                            <li className={"tab_item"+ (gubunCd === 'S' ? " active" : "")} style={{textAlign: "center"}}>
                                <a
                                    onClick={()=> {
                                        if(SpecialList.length > 0) {
                                            this.handleTabClick('S');
                                        }
                                        gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '특화 자료', 'parameter_url': window.location.href});
                                    }}
                                    className={"tab_link" + (newIcon)}
                                    name="gubunCd"
                                    value="S"
                                >
                                    <span style={{color: SpecialList.length > 0 ? "" : "#b6b4b4"}}>특화 자료</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </Sticky>
                <EduCoursePopupContainer textbookCd={textbookCd}/>

                {container}

            </section>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        title: state.base.get('title'),
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch),
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(TextBookContainer));