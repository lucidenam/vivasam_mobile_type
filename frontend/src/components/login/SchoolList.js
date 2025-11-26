import React, { Component, Fragment } from 'react';
import * as common from "../../lib/common";
import {request} from "../../lib/api";
import {debounce} from "lodash";

class School extends Component {
    shouldComponentUpdate(nextProps, nextStage) {
        return (nextProps.idx !== this.props.idx);
    }

    render() {
        const {code, tab, name, fkareacode, fkbranchcode, addr, handleSelect} = this.props;
        const params = {
            schoolName: name, //학교명(sch_name_searchedv)
            schoolCode: code, //학교코드(sch_code_searchedv)
            schoolGrade: tab, //학교(등)급 E,M,H(sch_kind_sel_1)
            registTypeCode: '0',//검색:0, 직접입력:1(sch_kind_directley)
            fkareaCode: fkareacode, //학교지역-시도코드(fkareacode)
            fkbranchCode: fkbranchcode,   //학교지역-시군구코드(fkbranchcode)
            directlyAgree: false,   //학교변경 동의여부(directly_agree)
            requestedTerm: '',   //직접입력 별도 요청사항(requestedTerm)
            isSelect : true     //학교직접선택여부
        }

        let tabName = "";
        if(tab === 'E') tabName = "초등";
        else if(tab === 'M') tabName = "중학";
        else if(tab === 'H') tabName = "고등";
        else if (tab === 'C') tabName = "대학";
        else if (tab === 'K') tabName = "유치원";
        else if (tab === 'O') tabName = "교육기관";

        return (
            <li className="result_item" onClick={() => {handleSelect(params);}}>
                <p className="result_sbj"><span className="result_ctg">{tabName}</span>{name}</p>
                <p className="result_desc">
                    {addr}
                </p>
            </li>
        );
    }
}

class SchoolList extends Component {
    render() {
        const {schools, totalElements, handleSelect, handleTabClick, handleChageSelect, filter} = this.props;
        console.log(filter);

        if (parseInt(totalElements) <= 0) {
            return (
                <div className="empty_result_wrap search_result">
                    <div className="tit_wrap">
                        <div className="right_scrt">
                            <select className="ck_term" onChange={this.props.handleChageSelect} value={this.props.filter}>
                                <option value="">유형</option>
                                <option value="E">초등학교</option>
                                <option value="M">중학교</option>
                                <option value="H">고등학교</option>
                                <option value="C">대학교</option>
                                <option value="K">유치원</option>
                                <option value="O">교육기관</option>
                            </select>
                        </div>
                    </div>
                    <span className="integration_icon integration_icon_empty"></span>
                    <p className="empty_info_text1">검색 결과가 없습니다.<br/>소속 등록을 요청해 주세요.</p>
                    <a href="javascript:void(0)" className="btn_request"
                       onClick={() => {handleTabClick('input')}}>소속 등록 요청하기<i></i></a>
                </div>
            );
        }else if(parseInt(totalElements) > 0){
            //주소 리스트
            const schoolList = schools.map((school, index) => {
                return (<School {...school} key={index} handleSelect={handleSelect}/>);
            });
            return (
                <div className="search_result">
                    <h2 className="blind">
                        소속명 검색 결과
                    </h2>
                    <div className="tit_wrap">
                        <div className="right_scrt">
                            <select className="ck_term" onChange={this.props.handleChageSelect} value={this.props.filter}>
                                <option value="">유형</option>
                                <option value="E">초등학교</option>
                                <option value="M">중학교</option>
                                <option value="H">고등학교</option>
                                <option value="C">대학교</option>
                                <option value="K">유치원</option>
                                <option value="O">교육기관</option>
                            </select>
                        </div>
                    </div>
                    <ul className="result_list">
                        {schoolList}
                    </ul>
                </div>
            )
        }

        return (
            <Fragment>
                <div className="before_search_txt">
                    <p>소속명을 검색해주세요.</p>
                </div>
            </Fragment>
        );
    }
}

export default SchoolList;
