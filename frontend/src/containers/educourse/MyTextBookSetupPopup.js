import React, {Component, Fragment} from 'react';
import Sticky from 'react-sticky-el';
import { connect } from "react-redux";
import { eduSubjectList } from 'lib/api';
import { MySubjectTabs, MyTextBooks } from 'containers/educourse';
import { RenderLoading } from "../../components/common";
import { SubTabMenuContainer} from 'containers/menu';

class MyTextBookSetupPopup extends Component {
    state = {
        subjects: [],
        mySubjects: [],
        activeSubjectCd: '',
        activeCourseCd: '',
        textbooks: [],
        mdValue: '전체'
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
        const { mainSubject , secondSubject, schoolLvlCd} = this.props.myClassInfo;
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

    componentDidMount() {
        this.getSubjectList();
        document.getElementById("pop_header").classList.remove("sticky");
    }

    render() {
        const { myClassInfo } = this.props;
        let { subjects, mySubjects, activeSubjectCd, activeCourseCd, mdValue } = this.state;
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
            <Fragment>
                <div className="subjectTab_container">
                    <Sticky>
                        <div className="tab_wrap subjectTab">
                            <MySubjectTabs schoolLvlCd={myClassInfo.schoolLvlCd} schoolLvl={myClassInfo.schoolLvlCd} activeSubjectCd={activeSubjectCd} subjects={subjects} mySubjects={mySubjects} handleTabClick={this.handleTabClick}/>
                        </div>
                    </Sticky>
                    <SubTabMenuContainer tabName='educourse_subject' schoolLvlCd={myClassInfo.schoolLvlCd} activeSubjectCd={activeSubjectCd} subjects={subjects} mySubjects={mySubjects} handleTabClick={this.handleTabClick} subTabName={mdValue} />
                </div>

                <section id="pop_content">
                    <div className="popup_content">
                        <ul className="sub_tit_description">
                            <li className="sub_tit_txt"><i className="wish"><span className="blind">교과서 추가</span></i>를 눌러 내 교과서를 추가/해제 하실 수 있습니다.</li>
                        </ul>
                        <MyTextBooks activeCourseCd={activeCourseCd} mdValue={mdValue}/>
                    </div>
                </section>
            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        myClassInfo: state.myclass.get('myClassInfo')
    })
)(MyTextBookSetupPopup);