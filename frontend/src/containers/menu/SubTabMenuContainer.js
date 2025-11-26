import React, {Component, Fragment} from 'react';
import {fromJS} from 'immutable';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {ScrollMenu} from 'components/common';
import {SubTabMenu} from 'components/menu';

class SubTabMenuContainer extends Component {
    state = {
        tabMenus: [],
        blindName: '',
        logged: false,
        translate: 0,
        ScrollMenu: '',
        inFlexible:false
    }

    constructor(props) {
        super(props);
        this.ScrollMenu = React.createRef();
    }

    componentDidMount() {
       this._isMounted = true;
    }
    componentWillUnmount() {
       this._isMounted = false;
    }

    shouldComponentUpdate(nextProps, nextStage) {
        if(nextProps.subTabName === this.props.subTabName) {
            return false
        }
        return (nextStage !== this.state || nextProps !== this.props);
    }

    static getDerivedStateFromProps(props, state) {
        if( ! (props.tabName === 'saemteo' || props.tabName === 'educourse' || props.tabName === 'educourse_subject' || props.tabName === 'liveLesson' || props.tabName === 'library') ){
            if(props.logged === state.logged) return null;
        }

        const {tabName, logged, loginInfo, match} = props;
        let subTabName = props.subTabName;
        let tabMenus;
        let blindName;
        let translate;
        let inFlexible;
        if(tabName === 'liveLesson' || tabName === 'library'){
            tabMenus = [{tabName:'aidtNewcurriculum',text:'2022 개정 교육과정',link:'/liveLesson/aidtNewcurriculum',isActive:false},
                        {tabName:'fastMusicLibrary',text:'바로바로 음악 자료실',link:'/liveLesson/fastMusicLibrary',isActive:false},
                        {tabName:'visualThinking',text:'비주얼 싱킹',link:'/liveLesson/visualThinking',isActive:false},
                        /*{tabName:'middleClassAppraisalList',text:'중등 수업 평가 혁신',link:'/liveLesson/middleClassAppraisalList',isActive:false},*/
                        {tabName:'classLiveQuestion',text:'질문이 살아있는 수업',link:'/liveLesson/classLiveQuestion',isActive:false},
                        {tabName:'MonthContainer',text:'계기 수업 자료',link:'/liveLesson/MonthContainer',isActive:false},
                        {tabName:'OnlineClassSurvivalSecret',text:'온라인 교실 생존비법',link:'/liveLesson/OnlineClassSurvivalSecret',isActive:false},
                        {tabName:'library',text:'라이브러리',link:'/library/image',isActive:false}
                        ];
            blindName = '창체·수업연구';
        }else if(tabName === 'saemteo'){
            tabMenus = [{tabName:'index',text:'비바샘터 홈',link:'/saemteo/index',isActive:false}
                        ,{tabName:'event',text:'이벤트',link:'/saemteo/event',isActive:false}
                        ,{tabName:'program',text:'교사문화 프로그램',link:'/saemteo/program',isActive:false}
                        // ,{tabName:'program',text:'교사문화 프로그램',link: '/saemteo/event/view/458',isActive:false}
                        // ,{tabName:'seminar',text:'오프라인 세미나',link:'/saemteo/seminar',isActive:false}
                        ,{tabName:'survey',text:'비바샘 설문조사',link:'/saemteo/survey',isActive:false}
                        ,{tabName:'vivasamGo',text:'비바샘이 간다',link:'/saemteo/vivasam/go',isActive:false}];
            blindName = '비바샘터';
        }else if(tabName === 'educourse'){
            tabMenus = [
                {
                    tabName:'middle',
                    text: "중학",
                    link: '/educourse/middle',
                    isActive:false
                },
                {
                    tabName:'high',
                    text: "고등",
                    link: '/educourse/high',
                    isActive:false
                }
            ];

            /*subTabName = match.params.name ? match.params.name : (logged ? "myclass" : "middle");
            let showMyClass = false;
            //if(logged && ( loginInfo.schoolLvlCd === 'MS' || loginInfo.schoolLvlCd === 'HS') ) {
            if(logged) {
                tabMenus = [{
                    tabName:'myclass',
                    text: "내 교과서",
                    link: '/educourse/myclass',
                    isActive:false
                },...tabMenus];
                showMyClass = true;
            }

            if(!match.params.name) {
                subTabName = showMyClass ? "myclass" : "middle";
            }*/

            blindName = '교과서 자료실';
        } else if(tabName === 'educourse_subject'){
            tabMenus = [{tabName:'all',text:'전체',link:'/educourse/middle',isActive:false}
            ,{tabName:'y22',text:'22 개정',link:'/educourse/middle',isActive:false}
            ,{tabName:'y15',text:'15 개정',link:'/educourse/middle',isActive:false}];

            blindName = '교과서 자료실';
        }
        if(tabMenus){
            tabMenus = fromJS(tabMenus);
            tabMenus = tabMenus.update(
                tabMenus.findIndex(function(item) {
                    return tabName === 'educourse_subject' ? item.get("text") === subTabName : item.get("tabName") === subTabName;
                }), function(item) {
                    return item.set("isActive", true);
                }
            );
            const selected = tabMenus.toJS().findIndex(el => el.isActive === true);
            //library가 최초 로딩될시에만 translate가 작동함. 전체 탭사이즈 미리 계산 필요
            if(tabName === 'saemteo'){
                if(selected > 2){
                    translate = window.innerWidth - 560;
                }else{
                    translate = -5;
                }
                inFlexible = true;
            }
            return {
                tabMenus : tabMenus.toJS(),
                blindName : blindName,
                translate : translate,
                inFlexible : inFlexible
            };
        }

        return null;
    }

    render() {
        const { tabMenus, translate, inFlexible, blindName } = this.state;
        const { tabName, activeSubjectCd, handleTabClick, subjects, mySubjects } = this.props;
        const tabMenuList = tabMenus.map(
            (tabMenu, index) => {
                const {text, link, isActive} = tabMenu;
                return (
                    <SubTabMenu
                        key={index}
                        text={text}
                        link={link}
                        isActive={isActive}
                        blindName={blindName}
                        tabName={tabName}
                        activeSubjectCd={activeSubjectCd}
                        handleTabClick={handleTabClick}
                        subjects={subjects}
                        mySubjects={mySubjects}
                    />
                )
            }
        );
        let addClass = this.props.tabName === 'educourse' ? ' naviTopMain' : '';

        return (
            <Fragment>
            <div className={"subTab"+addClass}>
                <ul className="subTab_list">
                    {inFlexible ? <ScrollMenu
                                        ref="ScrollMenu"
                                        data={tabMenuList}
                                        translate={translate}
                                        innerWrapperClass={'scrollmenu'}
                                    />
                                : tabMenuList}
                </ul>
            </div>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    })
)(withRouter(SubTabMenuContainer));
