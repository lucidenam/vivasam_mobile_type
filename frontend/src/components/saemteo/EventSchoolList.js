import React, { Component, Fragment } from 'react';

class School extends Component {
    shouldComponentUpdate(nextProps, nextStage) {
        return (nextProps.idx !== this.props.idx);
    }

    render() {
        const {code, tab, name, fkareacode, fkbranchcode, zip, addr, handleSelect} = this.props;
        const params = {
            schoolName: name, //학교명(sch_name_searchedv)
            schoolCode: code, //학교코드(sch_code_searchedv)
            schoolGrade: tab, //학교(등)급 E,M,H(sch_kind_sel_1)
            fkareaCode: fkareacode, //학교지역-시도코드(fkareacode)
            fkbranchCode: fkbranchcode,   //학교지역-시군구코드(fkbranchcode)
            zip: zip,
            addr: addr
        }

        let tabName = "";
        if(tab === 'E') tabName = "초등";
        else if(tab === 'M') tabName = "중학";
        else if(tab === 'H') tabName = "고등";

        return (
            <li className="result_item" onClick={() => {handleSelect(params);}}>
                <span className="result_ctg">{tabName}</span>
                <p className="result_sbj">{name}</p>
                <p className="result_desc">
                    {addr}
                </p>
            </li>
        );
    }
}

class EventSchoolList extends Component {
    render() {
        const {schools, totalElements, handleSelect} = this.props;
        if(parseInt(totalElements) <= 0) {
            return (<div className="empty_result_wrap">
                        <span className="integration_icon integration_icon_empty"></span>
                        <p className="empty_info_text1"><span className="highlight">검색되지 않은 학교입니다.<br/> 직접 입력을 통해 학교를 등록해 주세요.</span></p>
                    </div>);
        }
        //주소 리스트
        const schoolList = schools.map((school, index) => {
            return (<School {...school} key={index} handleSelect={handleSelect}/>);
        });

        return (
            <Fragment>
                <div className="guideline" />
                <div className="search_result">
                    <h2 className="blind">
                        학교명 검색 결과
                    </h2>
                    <ul className="result_list">
                        {schoolList}
                    </ul>
                </div>
            </Fragment>
        );
    }
}

export default EventSchoolList;
