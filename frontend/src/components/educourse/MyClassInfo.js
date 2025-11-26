import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

class MyClassInfo extends Component {

    handleSetup() {
        const { schoolLvlCd } = this.props;
        console.log(`schoolLvlCd : ${schoolLvlCd}`);
        if (schoolLvlCd == 'ES') {
            alert('초등 선생님은 초등 비바샘을 이용해 주세요.');
            return false;
        }

        if (schoolLvlCd != 'MS' && schoolLvlCd != 'HS') {
            alert('초중고 학교 선생님만 설정이 가능합니다. 회원정보수정 페이지에서 소속을 수정하시거나, 소속 변경이 안되시면 고객센터로 문의바랍니다.');
            return false;
        }
        this.props.history.push('/educourse/myclassSetup');
    }

    render() {
        const { schoolLvlCd, mainSubjectName, secondSubjectName } = this.props;
        let schoolLvlNm = "";
        let markerClazz = "";
        let isElementary = false;
        switch(schoolLvlCd) {
            case 'MS':
                schoolLvlNm = '중학';
                markerClazz = "myclass_marker_type1";
                break;
            case 'HS':
                schoolLvlNm = '고등';
                markerClazz = "myclass_marker_type1_3";
                break;
            default:
                isElementary = true;
                schoolLvlNm = '';
        }
        return (
            <div className="myclass_top_header">
                <h3 className="myclass_top_tit">
                    <em className={markerClazz}>{schoolLvlNm}</em> {mainSubjectName ? mainSubjectName : '교과 미설정'}{secondSubjectName ? ', '+secondSubjectName : ''}
                </h3>
                <a onClick={() => this.handleSetup()} className="myclass_top_link">관리</a>
            </div>
        );
    }
}

export default connect(
    (state) => ({
    }),
    (dispatch) => ({
    })
)(withRouter(MyClassInfo));