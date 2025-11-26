import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as api from 'lib/api';
import PageTemplate from 'components/page/PageTemplate';
import SoobakcDetailContainer from 'containers/soobakc/SoobakcDetailContainer'

class SoobakcDetailPage extends Component{
    constructor(props) {
        super(props);
        this.state = {
            soobakcInfo : {},
            soobakcList: [],
            lpIdx: null,
            isLoading : false
        }
    }

    componentDidMount = () => {
        const {logged, loginInfo, history} = this.props;

        if(!logged) {
            history.replace("/login");
        } else {
            //TODO get url info
            var lectureCd = '';
            var sjcode = '';
            var lpIdx = '';
            var leccnt = 0;
            var type = '';
            var grade = '';

            var params = window.location.href.split("?");
            for(var i = 0; i < params[1].split("&").length; i++) {
                if(params[1].split("&")[i].split("=")[0] === 'lectureCd') lectureCd = params[1].split("&")[i].split("=")[1];
                if(params[1].split("&")[i].split("=")[0] === 'sjcode') sjcode = params[1].split("&")[i].split("=")[1];
                if(params[1].split("&")[i].split("=")[0] === 'lpIdx') lpIdx = params[1].split("&")[i].split("=")[1];
                if(params[1].split("&")[i].split("=")[0] === 'leccnt') leccnt = params[1].split("&")[i].split("=")[1];
                if(params[1].split("&")[i].split("=")[0] === 'type') type = params[1].split("&")[i].split("=")[1];
                if(params[1].split("&")[i].split("=")[0] === 'grade') grade = params[1].split("&")[i].split("=")[1];
            }

            if(sjcode === '') sjcode = null;

            var vm = this;
            setTimeout(function(){
                vm.getSoobakcInfo(lectureCd, lpIdx, type, grade, sjcode, leccnt, loginInfo.memberId);
                vm.setState({
                    isLoading : true,
                    lpIdx: lpIdx
                })
            }, 100)
        }
    }

    componentWillUpdate = () => {

    }
    
    getSoobakcInfo = async(lectureCd, lpIdx, type, grade, sjcode, leccnt, memberId) => {
        try {
            // grade가 Null인 경우 grade를 0으로 만듬 ( 초등시에만 grade 사용 )
            if(grade.value == null) grade = 0;
            const response = await api.getSoobakcInfo(lectureCd, lpIdx, type, grade);
            this.setState({
                soobakcInfo : response.data
            })

            const response2 = await api.getSoobakcDetail(lectureCd, sjcode, lpIdx, leccnt, memberId);
            this.setState({
                soobakcList: response2.data,
                isLoading : false
            })
        } catch (e) {
            console.log(e);
        }
    }

    getSoobakcDetails = async(lectureCd, sjcode, lpIdx, leccnt, memberId) => {
        try {
            const response = await api.getSoobakcDetail(lectureCd, sjcode, lpIdx, leccnt, memberId);
            this.setState({
                soobakcList: response.data,
                isLoading : false
            })
        } catch (e) {
            console.log(e);
            this.setState({ isLoading : false });
        }
    }

    render () {
        const {soobakcInfo, soobakcList, lpIdx, isLoading} = this.state;
        
        return (
            <PageTemplate title='온리원 추천 강의'>
                <div className="lectDtl_sticky">
                    <div className="lectDtl_cell">  
                        <span className="subject"><span>{soobakcInfo.SUBJECTNAME}</span></span>
                    </div>
                    <div className="lectDtl_cell">
                        <strong className="course">{soobakcInfo.LECTURENAME}</strong>
                        <span className="book">교재 : {soobakcInfo.BOOKNAME}</span>
                        <span className="c_num">{soobakcInfo.LP_TOT_LEC2}강</span> <span className="c_txt">{soobakcInfo.TEACHER}</span>
                    </div>
                </div>
                <SoobakcDetailContainer soobakcList={soobakcList} lpIdx={lpIdx} isLoading={isLoading}></SoobakcDetailContainer>
            </PageTemplate>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        myClassInfo: state.myclass.get('myClassInfo')
    })
)(withRouter(SoobakcDetailPage));