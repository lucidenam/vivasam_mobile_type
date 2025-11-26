import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { eduSubjectList } from 'lib/api';
import { MainHeaderPageTemplate } from 'components/page';
import {TabMenuContainer, SubTabMenuContainer} from 'containers/menu';
import {MyClassContainer, EduCourseContainer, ElementaryContainer, MySubjectTabs} from 'containers/educourse';
import * as myclassActions from 'store/modules/myclass';
import {NotFoundPage} from 'pages';
import { connect } from 'react-redux';
import Sticky from 'react-sticky-el';
import {bindActionCreators} from "redux";
import { RenderLoading } from "../../components/common";

class EducoursePage extends Component{
    state = {
        subjects: [],
        mySubjects: [],
        activeSubjectCd: '',
        activeCourseCd: '',
        textbooks: [],
        mdValue: '전체',
        schoolLvlCd: '',
    }

    handleTabClick = (activeSubjectCd, activeCourseCd, mdValue) => {
        //동일한 탭을 클릭했을 경우 패쓰!
        if(activeSubjectCd === this.state.activeSubjectCd) {
            return;
        }

        if (typeof mdValue === 'undefined') {
            mdValue = "전체";
        }

        if (typeof activeCourseCd === 'undefined') {
            activeCourseCd = this.state.activeCourseCd;
        }

        if (typeof activeSubjectCd === 'undefined') {
            activeSubjectCd = this.state.activeSubjectCd;
        }

        this.setState({
            activeSubjectCd : activeSubjectCd,
            activeCourseCd : activeCourseCd,
            mdValue : mdValue
        });
    }

    getSubjectList = async () => {
        const { mainSubject , secondSubject} = this.props.myClassInfo;
        let schoolLvlCd = 'HS';
        /*const {logged, loginInfo} = this.props;

        if (logged) {
            if (loginInfo.schoolLvlCd === 'HS') schoolLvlCd = loginInfo.schoolLvlCd;
            else schoolLvlCd = 'MS';
        } else {
            schoolLvlCd = 'MS';
        }*/
        const response = await eduSubjectList(schoolLvlCd);
        const subjects = response.data;
        const myMainSubject = subjects.find(s => s.cafeSubjectCd === mainSubject);
        const mySecondSubject = subjects.find(s => s.cafeSubjectCd === secondSubject);
        let mySubjects = [];
        if(myMainSubject) {
            mySubjects.push({...myMainSubject, isMySubject: true});
        }
        if(mySecondSubject) {
            mySubjects.push({...mySecondSubject, isMySubject: true});
        }
        this.setState({
            subjects: subjects.filter(s => s.cafeSubjectCd !== mainSubject && s.cafeSubjectCd !== secondSubject),
            mySubjects: mySubjects
        })
    }

    getMyClassInfo = async () => {
        const { MyclassActions } = this.props;

        try {
            await MyclassActions.myClassInfo();
        } catch (e) {
            console.log(e);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps !== this.nextProps);
    }

    componentDidMount() {
        const{ logged, myClassInfo, match } = this.props;
        if(logged) {
             this.getMyClassInfo();
        }
        if(myClassInfo){
            this.setState({
                schoolLvlCd : myClassInfo.schoolLvlCd
            })
            this.getSubjectList();
        }
    }

    render () {
        const { match, logged, myClassInfo, loginInfo } = this.props;
        const { schoolLvlCd } = this.state;
        const subTabName = match.params.name ? match.params.name : ((logged && loginInfo.schoolLvlCd == 'MS') ? "middle" : (logged && loginInfo.schoolLvlCd == 'HS') ? "high" : "middle");

        let tabName;
        let tabMenu;
        switch (subTabName) {
            case 'middle':
                tabMenu = 'educourse_subject';
                tabName = <EduCourseContainer schoolLvlCd={"MS"} handleTabClick={this.handleTabClick} mdValue={this.state.mdValue} activeSubjectCd={this.state.activeSubjectCd} />;
                break;
            case 'high':
                tabMenu = 'educourse_subject';
                tabName = <EduCourseContainer schoolLvlCd={"HS"} handleTabClick={this.handleTabClick} mdValue={this.state.mdValue} activeSubjectCd={this.state.activeSubjectCd} />;
                break;
            case 'myclass':
                tabMenu = 'educourse_myclass';
                tabName = <MyClassContainer schoolLvlCd={"MS"} handleTabClick={this.handleTabClick} mdValue={this.state.mdValue} activeSubjectCd={this.state.activeSubjectCd} />;
                break;
            default :
                tabName = <NotFoundPage/>;
        }

        let { subjects, mySubjects, activeSubjectCd, activeCourseCd,mdValue } = this.state;

        if(subjects.length === 0) {
            return <RenderLoading loadingType={"1"}/>;
        }

        if(!activeSubjectCd) {
            activeSubjectCd = myClassInfo.mainSubject ? myClassInfo.mainSubject : subjects[0].cafeSubjectCd
        }
        if(!activeCourseCd) {
            activeCourseCd = myClassInfo.mainCourseCd ? myClassInfo.mainCourseCd : subjects[0].courseCd;
        }

        return (
            <MainHeaderPageTemplate>
                <TabMenuContainer tabName='educourse' logged={logged}/>
                <Sticky>
                    <SubTabMenuContainer tabName='educourse' subTabName={subTabName}/>
                </Sticky>
                { tabMenu !== 'educourse_myclass' ? <div className="subjectTab_container">
                        <Sticky>
                            <div className="tab_wrap subjectTab2">
                                <MySubjectTabs schoolLvlCd={schoolLvlCd} schoolLvl={subTabName === 'high' ? 'HS' : 'MS'} activeSubjectCd={activeSubjectCd} subjects={subjects} mySubjects={mySubjects} handleTabClick={this.handleTabClick}/>
                            </div>
                        </Sticky>
                        <SubTabMenuContainer tabName='educourse_subject' schoolLvlCd={schoolLvlCd} activeSubjectCd={activeSubjectCd} subjects={subjects} mySubjects={mySubjects} handleTabClick={this.handleTabClick} subTabName={mdValue} />
                    </div> : ''
                }
                {tabName}
            </MainHeaderPageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    }),
    (dispatch) => ({
        MyclassActions: bindActionCreators(myclassActions, dispatch)
    })
)(withRouter(EducoursePage));