import React, {Component} from 'react';
import { connect } from "react-redux";
import {eduSubjectList} from "../../lib/api";

class MySubjectTab extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props !== nextProps) return true;
        if(this.props.activeSubjectCd !== nextProps.activeSubjectCd) return true;

        return false;
    }

    render() {
        const {cafeSubjectCd, subjectNm, isMySubject, activeSubjectCd, handleTabClick, courseCd, schoolLvlCd, schoolLvl} = this.props;

        let myClazz = "";
        if(isMySubject) {
            myClazz = " mySelected"
        }
        let aciveClazz = "";

        if(activeSubjectCd === cafeSubjectCd) {
            aciveClazz = " active";
        }

        if (activeSubjectCd === 'SC116' && schoolLvl === 'MS') {
            if (cafeSubjectCd === 'SC100') {
                aciveClazz = " active";
                handleTabClick(cafeSubjectCd,courseCd)
            }
        }

        return (
            <li className={"tab_item"+aciveClazz}>
                <a
                    onClick={() => { handleTabClick(cafeSubjectCd, courseCd); }}
                    className={"tab_link"+myClazz}
                >
                    {/*<span>{schoolLvl === 'HS' && subjectNm === '도덕' ? '윤리' : subjectNm}</span>*/}
                    <span>{schoolLvl === 'HS' && subjectNm === '도덕' ? '윤리' : schoolLvl === 'MS' && subjectNm === '윤리' ? '도덕' : subjectNm}</span>
                    {activeSubjectCd === cafeSubjectCd ? (<span className="blind">현재페이지</span>) : ''}
                </a>
            </li>
        );
    }
}

class MySubjectTabs extends Component {
    getSubjectList = async (schoolLvlCd) => {
        const { mainSubject , secondSubject} = this.props.myClassInfo;
        const response = await eduSubjectList(schoolLvlCd !== '' ? schoolLvlCd : 'MS');
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

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.schoolLvlCd !== nextProps.schoolLvlCd || this.props.schoolLvl !== nextProps.schoolLvl) {
            this.getSubjectList(nextProps.schoolLvlCd === '' ? nextProps.schoolLvl : nextProps.schoolLvlCd);
            return true;
        }
        if(this.props.activeSubjectCd !== nextProps.activeSubjectCd) {
            return true;
        }
        if(this.props.subjects !== nextProps.subjects) {
            return true;
        }
        if(this.props.myClassInfo !== nextProps.myClassInfo) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        this.setState({
            schoolLvl : this.props.schoolLvl
        })
    }

    state = {
        schoolLvl : 'MS'
    }

    render() {
        const { activeSubjectCd, handleTabClick, subjects, mySubjects, schoolLvlCd,schoolLvl } = this.props;
        let subjectList = [...mySubjects, ...subjects];
        subjectList = subjectList.map(s => (<MySubjectTab {...s} key={s.cafeSubjectCd} schoolLvl={schoolLvl} schoolLvlCd={schoolLvlCd} activeSubjectCd={activeSubjectCd} handleTabClick={handleTabClick} />))
        if (schoolLvl === 'MS') {
            subjectList.length = subjectList.length -1;
        }
        return (
            <div className="tab_inner">
                <ul className="tab tabClass">
                    {subjectList}
                </ul>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        myClassInfo: state.myclass.get('myClassInfo')
    })
)(MySubjectTabs);