import React, { Component, Fragment} from 'react';
import { fromJS } from 'immutable';
import TabMenu from 'components/menu/TabMenu';
import Sticky from "react-sticky-el";
import * as api from 'lib/api';
import { ScrollMenu } from 'components/common';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

class TabMenuContainer extends Component {
    state = {
        tabMenus: [],
        blindName: '',
        logged: false,
        translate: 0,
        liveScrollMenu: '',
        inFlexible:false,
        isLoginType : false
    }

    constructor(props) {
        super(props);
        this.liveScrollMenu = React.createRef();
    }

    shouldComponentUpdate(nextProps, nextStage) {
        if(this.props.tabName !== nextProps.tabName) {
            this.getTabMenu(nextProps.tabName);
            return true;
        }
        return (nextStage !== this.state);
    }

    componentDidMount() {
        this._isMounted = true;
        this.getTabMenu(this.props.tabName);
        if (this.props.logged) {
            this.setLoginType();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getTabMenu = (tabName) => {
        let tabMenus;
        if(tabName === 'library' || tabName === 'saemteo' || tabName === 'educourse' || tabName === 'liveLesson'){
            tabMenus = [{tabName:'educourse',text:'교과서 자료',link:'/educourse',isActive:false},
                {tabName:'liveLesson',text:'창체·수업연구',link:'/liveLesson/aidtNewcurriculum',isActive:false},
                {tabName:'saemteo',text:'비바샘터',link:'/saemteo/index',isActive:false}];
        } else if (tabName === 'myInfo' || tabName === 'password'){
            tabMenus = [{tabName:'myInfo',text:'회원정보 수정',link:'/myInfo',isActive:false},{tabName:'password',text:'비밀번호 변경',link:'/myInfo/password',isActive:false}];
        } else if (tabName === 'visualThinking' || tabName === 'middleClassAppraisalList' || tabName === 'classLiveQuestion' || tabName === 'OnlineClassSurvivalSecret' || tabName === 'MonthContainer'){
            tabMenus = [{tabName:'aidtNewcurriculum',text:'2022 개정 교육과정',link:'/liveLesson/aidtNewcurriculum',isActive:false},
                {tabName:'fastMusicLibrary',text:'바로바로 음악 자료실',link:'/liveLesson/fastMusicLibrary',isActive:false},
                {tabName:'visualThinking',text:'비주얼 싱킹',link:'/liveLesson/visualThinking',isActive:false},
                {tabName:'middleClassAppraisalList',text:'중등 수업 평가 혁신',link:'/liveLesson/middleClassAppraisalList',isActive:false},
                {tabName:'classLiveQuestion',text:'질문이 살아있는 수업',link:'/liveLesson/classLiveQuestion',isActive:false},
                {tabName:'MonthContainer',text:'계기 수업 자료',link:'/liveLesson/MonthContainer',isActive:false},
                {tabName:'OnlineClassSurvivalSecret',text:'온라인 교실 생존비법',link:'/liveLesson/OnlineClassSurvivalSecret',isActive:false}];
        } else {
            //
        }

        if(tabMenus){
            tabMenus = fromJS(tabMenus);
            tabMenus = tabMenus.update(
                tabMenus.findIndex(function(item) {
                    if (tabName === 'library') tabName = 'liveLesson'
                    return item.get("tabName") === tabName;
                }), function(item) {
                    return item.set("isActive", true);
                }
            );
            if(this._isMounted){
                this.setState({
                    tabMenus : tabMenus.toJS()
                });
            }
        }

        let translate;
        let inFlexible;

        //library가 최초 로딩될시에만 translate가 작동함. 전체 탭사이즈 미리 계산 필요
        // 20190528 질문이 살아있는 수업 추가 ( 행이 추가 될시 이렇게 해야 탭 위치가 지정됨 .
        if (tabName === 'visualThinking' || tabName === 'middleClassAppraisalList' || tabName === 'classLiveQuestion' || tabName === 'OnlineClassSurvivalSecret' || tabName === 'MonthContainer'){
            inFlexible = true;
        }
        this.setState({
            translate: translate,
            inFlexible: inFlexible
        });
    }

    setLoginType = async () => {
        const loginType = await api.getLoginType();
        if (loginType != null) {
            if (loginType.data != 'LOGIN') {
                this.setState({
                    isLoginType : true
                })
            }
        }
    }

    render() {
        const { tabName, logged } = this.props;
        const { tabMenus, translate, inFlexible, isLoginType} = this.state;
        const tabMenuList = tabMenus.map(
            (tabMenu, index) => {
                const {tabName, text, link, isActive} = tabMenu;

                if (text == '비밀번호 변경' && isLoginType) {
                    return;
                }

                return (
                    <TabMenu
                        key={tabName}
                        text={text}
                        link={link}
                        logged={logged}
                        isActive={isActive}
                    />
                )
            }
        );
        let iconstyle;

        if(tabName === 'myInfo' || tabName === 'password' || tabName === 'educourse'){
            let addClass = tabName === 'educourse' ? ' naviTopMain' : '';

            return (
                <Sticky className={'tab_wrap'}>
                    <div className="guideline new251"></div>
                    <div className={"tab_wrap"+addClass} style={iconstyle}>
                        <ul className="tab tabMulti">
                            {inFlexible ? <ScrollMenu
                                    ref="liveScrollMenu"
                                    data={tabMenuList}
                                    translate={translate}
                                    innerWrapperClass={'liveScrollMenu'}
                                />
                                : tabMenuList}
                        </ul>
                    </div>
                </Sticky>
            );
        }else{
            let addClass = tabName === 'library' || tabName === 'saemteo' || tabName === 'educourse' || tabName === 'liveLesson' ? ' naviTopMain' : '';

            return (
                <Fragment>
                <div className="guideline new251"></div>
                <div className={"tab_wrap"+addClass} style={iconstyle}>
                    <ul className="tab tabMulti">
                        {inFlexible ? <ScrollMenu
                                ref="liveScrollMenu"
                                data={tabMenuList}
                                translate={translate}
                                innerWrapperClass={'liveScrollMenu'}
                            />
                            : tabMenuList}
                    </ul>
                </div>
                </Fragment>
            );
        }
    }
}


export default connect(
    (state) => ({
        logged: state.base.get('logged'),
    })
)(withRouter(TabMenuContainer));

