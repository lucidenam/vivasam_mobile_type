import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {debounce} from 'lodash';
import {getSchoolArea, request} from 'lib/api';
import * as common from 'lib/common';
import {SchoolList} from 'components/login';
import Sticky from 'react-sticky-el';
import * as baseActions from 'store/modules/base';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

class SearchSchool extends Component {
    state = {
        schoolName: '',
        visible: false,
        schools: [],
        totalElements: '',
        loading: false,
        contentLoading: false,
        page: 0,
        filter: '',
    };

    constructor(props) {
      super(props);
      // Debounce
      this.handleSearchSchool = debounce(this.handleSearchSchool, 500);
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleClick = () => {
        if (this._isMounted) {
            this.setState({
                loading: true,
                visible: false,
                schools: []
            });
        }
        this.handleSearchSchool(true);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            this.handleClick();
        }
    }

    handleMoreButton = () => {
        if (this._isMounted) {
            this.setState({
                contentLoading: true
            });
        }
        this.handleSearchSchool(false);
    }

    handleSelect = (params) => {
        const { handleSetSchool } = this.props;
        handleSetSchool(params);
    }

    handleTabClick = (params) => {
        const {handleTabClick} = this.props;
        handleTabClick(params);
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    handleSearchSchool = async (reset) => {
        let page = this.state.page;
        let tab = this.state.filter;
        if (reset) {
            page = 0;
        }

        if(this.state.schoolName === null || this.state.schoolName === '' || this.state.schoolName.length === 0)  {
            common.error("소속명을 입력해주세요.");
            this.setState({loading: false});
            return;
        }
        let koreanPattern = /[가-힣]/;
        let englishPattern = /[a-zA-Z]/;
        if (koreanPattern.test(this.state.schoolName) && englishPattern.test(this.state.schoolName)) {

        } else if (koreanPattern.test(this.state.schoolName)) {

        } else if (englishPattern.test(this.state.schoolName)) {

        } else {
            common.error("소속명은 한글 혹은 영어로 입력해 주세요.");
            this.setState({loading: false});
            return;
        }
        try {
            if (this._isMounted && !this.state.contentLoading) {
                this.setState({loading: true});
            }
            const response = await request({

                url: '/api/school/searchSchool',
                method: 'get',
                params: {
                    schoolName: this.state.schoolName,
                    page: page,
                    size: 20,
                    tab: tab
                }
            });
            this.setState({
                page: (page + 1)
            });
            const totalElements = response.data.totalElements;
            const totalPages = response.data.totalPages;
            const number = response.data.number;
            let visible = false;

            if (totalElements > 0 && totalPages > number + 1) {
                visible = true;
            }
            this.setState({
                schools: [...this.state.schools, ...response.data.content],
                visible,
                totalElements
            });
          } catch (e) {
            console.log(e);
          }finally{
            if(this._isMounted){
              this.setState({
                loading : false,
                contentLoading : false
              });
            }
          }
    };

    onChangeFilterSelectBox = (e) => {
        this.setState({
            filter: e.target.value,
        });

        this.handleClick();
    }

    render() {
        const {schools, visible, totalElements, loading, contentLoading} = this.state;
        let container;
        if(loading){
            container = <RenderLoading />;
        }else{
            container = <SchoolList schools={schools} totalElements={totalElements} handleSelect={this.handleSelect} handleTabClick={this.handleTabClick} handleChageSelect={this.onChangeFilterSelectBox} filter={this.state.filter}/>
        }
        return (
            <Fragment>
                <div className="renew07 school_pop">
                    <div className="search_form">
                        <div className="search_section">
                            <input
                                type="search"
                                name="schoolName"
                                onChange={this.handleChange}
                                onKeyPress={this.handleKeyPress}
                                value={this.state.schoolName}
                                placeholder="소속명을 입력하세요."
                                className="input_sm" />
                            <button
                                type="button"
                                onClick={this.handleClick}
                                className="search_icon-type">
                                검색
                            </button>
                        </div>
                    </div>
                    <div className="guideline" />
                    {/*<div className="tit_wrap">
                        <div className="right_scrt">
                            <select className="ck_term" onChange={this.onChangeFilterSelectBox}>
                                <option value="">유형</option>
                                <option value="E">초등학교</option>
                                <option value="M">중학교</option>
                                <option value="H">고등학교</option>
                                <option value="C">대학교</option>
                                <option value="K">유치원</option>
                                <option value="O">교육기관</option>
                            </select>
                        </div>
                    </div>*/}
                    { container }
                    { schools.length > 0 && contentLoading ?
                        <ContentLoading />
                        :
                        <button
                            type="button"
                            onClick={this.handleMoreButton}
                            style={{display: visible ? 'block' : 'none'}}
                            className="btn_square_gray">더보기
                        </button>
                    }
                </div>
            </Fragment>
        );
    }
}



const SchoolArea = ({options, codeflag}) => {
    if(options === null || options.length === 0) return null;

    const SelectOption = ({code, codeName}) => {
        return <option value={code}>{codeName}</option>;
    };

    const optionList = options.map((area, index) => {
        return (<SelectOption code={codeflag === 'B'? area.fkcode : area.pkcode} codeName={area.codename}  key={index}/>);
    });
    return optionList;
};

class InputSchool extends Component {
    state = {
        schoolGrade: 'E',
        schoolName: '',
        schoolArea: [],
        schoolBranch : [],
        selectedArea: {
            code: '',
            name: ''
        },
        selectedBranch : {
            code: '',
            name: ''
        },
        directlyAgree : false,
        requestedTerm : ''
    }

    constructor(props) {
        super(props);
        // Debounce
        this.handleSubmit = debounce(this.handleSubmit, 300);
    }

    handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleChecked = (e) => {
        this.setState({
            directlyAgree: !this.state.directlyAgree
        });
    }

    handleSubmitSafe = (e) => {
        this.handleSubmit(e.target);
    }

    handleSubmit = async(target) => {
        const { handleSetSchool, BaseActions } = this.props;
        try {
            target.disabled = true;
            const { schoolGrade, schoolName, selectedArea, selectedBranch, directlyAgree, requestedTerm } = this.state;
            let schoolCode = '99997';
            if(schoolGrade === "E"){
                schoolCode = "99997";
            }else if(schoolGrade === "M"){
                schoolCode = "99998";
            }else if(schoolGrade === "H"){
                schoolCode = "99999";
            }else if(schoolGrade === "C"){
                schoolCode = "99992";
            }else if(schoolGrade === "K"){
                schoolCode = "99991";
            }else if(schoolGrade === "O"){
                schoolCode = "99993";
            }
            if(schoolName === '' || schoolName === '') {
                common.error('소속명을 입력해주세요.');
                target.disabled = false;
                return;
            }
            let koreanPattern = /[가-힣]/;
            let englishPattern = /[a-zA-Z]/;
            if (koreanPattern.test(schoolName) && englishPattern.test(schoolName)) {

            } else if (koreanPattern.test(schoolName)) {

            } else if (englishPattern.test(schoolName)) {

            } else {
                common.error("소속명은 한글 혹은 영어로 입력해 주세요.");
                target.disabled = false;
                return;
            }
            if(selectedArea.code === '' || selectedBranch.code === '') {
                common.error('소재지를 입력해주세요.');
                target.disabled = false;
                return;
            }
            if(!directlyAgree) {
                common.error('입력한 소속으로 회원 정보 변경에 동의해주세요');
                target.disabled = false;
                return;
            }

            const params = {
                schoolName, //학교명(sch_name_searchedv)
                schoolCode, //학교코드(sch_code_searchedv)
                schoolGrade, //학교(등)급 E,M,H(sch_kind_sel_1)
                registTypeCode: '1',//검색:0, 직접입력:1(sch_kind_directley)
                fkareaCode: selectedArea.code, //학교지역-시도코드(fkareacode)
                fkareaName: selectedArea.name, //학교지역-시도명
                fkbranchCode: selectedBranch.code,   //학교지역-시군구코드(fkbranchcode)
                fkbranchName: selectedBranch.name,   //학교지역-시군구명
                directlyAgree,   //학교변경 동의여부(directly_agree)
                requestedTerm,  //직접입력 별도 요청사항(requestedTerm)
                isSelect: false
            }
            BaseActions.openLoading();
            await handleSetSchool(params);
            target.disabled = false;
        } catch (e) {
            target.disabled = false;
            console.log(e);
        }finally {
            setTimeout(()=>{
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }
    }

    setSchoolArea = async (areaName, codeflag, fkcode) => {
        try {
            const response = await getSchoolArea(codeflag, fkcode);

            this.setState({
                [areaName] : response.data
            });
        }catch(e) {
            console.log(e);
        }
    }

    handleSchoolArea = (event) => {
        const {value, options, selectedIndex} = event.target;
        const text = options[selectedIndex].text;
        this.setSchoolArea("schoolBranch","S", value);
        this.setState({
            selectedArea: {
                code: value,
                name: text
            }
        });
    }

    handleSchoolAreaDetail = (event) => {
        const {value, options, selectedIndex} = event.target;
        const text = options[selectedIndex].text;
        this.setState({
            selectedBranch: {
                code: value,
                name: text
            }
        });
    }

    componentDidMount() {
        const { school } = this.props;
        this.setSchoolArea("schoolArea","B");

        if(school.fkareaCode && school.fkbranchCode && school.schoolGrade && school.schoolName && school.directlyAgree){
            this.setSchoolArea("schoolBranch","S", school.fkareaCode);
            this.setState({
                selectedArea: {
                    code: school.fkareaCode,
                    name: school.fkareaName
                },
                selectedBranch: {
                    code: school.fkbranchCode,
                    name: school.fkbranchName
                },
                schoolGrade: school.schoolGrade,
                schoolName: school.schoolName,
                directlyAgree: school.directlyAgree,
                requestedTerm: school.requestedTerm
            });
        }
    }

    render() {
        const {schoolGrade, schoolArea, schoolBranch, directlyAgree} = this.state;
        return (
            <Fragment>
                <div className="renew07 school_pop">
                    <div className="school_search">
                        <h2 className="info_tit mt25">
                            <label htmlFor="school_name">소속명</label>
                        </h2>
                        <div className="input_wrap">
                            <input
                                type="search"
                                name="schoolName"
                                id="school_name"
                                value={this.state.schoolName}
                                placeholder="소속명을 입력하세요."
                                className="input_sm"
                                onChange={this.handleInput}
                            />
                            {/*<button className="input_in_btn btn_gray">중복확인</button>*/}
                        </div>

                        <h2 className="info_tit mt30">유형</h2>
                        <div className="radio_rect radio_rect-color fl-radio">
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="elementary"
                                    value="E"
                                    checked={schoolGrade === 'E'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="elementary">초등학교</label>
                            </span>
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="middle"
                                    value="M"
                                    checked={schoolGrade === 'M'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="middle">중학교</label>
                            </span>
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="high"
                                    value="H"
                                    checked={schoolGrade === 'H'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="high">고등학교</label>
                            </span>
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="uni"
                                    value="C"
                                    checked={schoolGrade === 'C'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="uni">대학교</label>
                            </span>
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="kids"
                                    value="K"
                                    checked={schoolGrade === 'K'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="kids">유치원</label>
                            </span>
                            <span className="radio_rect_item">
                                <input
                                    type="radio"
                                    name="schoolGrade"
                                    id="organ"
                                    value="O"
                                    checked={schoolGrade === 'O'}
                                    onChange={this.handleInput}
                                />
                                <label htmlFor="organ">교육기관</label>
                            </span>
                        </div>

                        <h2 className="info_tit mt25">
                            <label htmlFor="school_area">소재지</label>
                        </h2>
                        <div className="select_wrap">
                            <div className="selectbox select_sm">
                                <select name="school_area"
                                        id="school_area"
                                        value={this.state.selectedArea.code}
                                        onChange={this.handleSchoolArea}>
                                    <option value="">시/도</option>
                                    <SchoolArea options={schoolArea} codeflag="B"/>
                                </select>
                            </div>
                            <div className="selectbox select_sm">
                                <select name="school_area_detail"
                                        value={this.state.selectedBranch.code}
                                        onChange={this.handleSchoolAreaDetail}>
                                    <option value="">구/군</option>
                                    <SchoolArea options={schoolBranch} codeflag="S"/>
                                </select>
                            </div>
                        </div>

                        <h2 className="info_tit mt25">
                            <label htmlFor="school_etc">기타</label>
                        </h2>
                        <textarea
                            name="requestedTerm"
                            id="school_etc"
                            value={this.state.requestedTerm}
                            placeholder="소속 홈페이지 주소를 입력해 주세요. &#13;&#10;보다 빠르게 등록을 도와드리겠습니다."
                            className="input_sm"
                            onChange={this.handleInput}
                        ></textarea>
                        <div className="school_confirm mt15">
                            <input
                                type="checkbox"
                                name="directlyAgree"
                                id="school_confirm"
                                checked={directlyAgree}
                                className="checkbox_circle"
                                onChange={this.handleChecked}
                            />
                            <label htmlFor="school_confirm">
                                입력한 소속으로 회원 정보 변경에 동의합니다.
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={this.handleSubmitSafe}
                        className="btn_full_on">
                        등록 요청하기
                    </button>
                </div>
            </Fragment>
        );
    }
}

class FindSchool extends Component {
    state = {
        tabName: 'search'
    }
    componentDidMount() {
        const { school } = this.props;
        if(school.directlyAgree){
            this.setState({
                tabName: 'input'
            });
        }
    }

    shouldComponentUpdate(nexProps, nextState) {
        return this.state !== nextState;
    }

    handleTabClick = (tabName) => {
        this.setState({
            tabName
        });
    }

    handleSetSchool = (params) => {
        const { handleSetSchool } = this.props;
        handleSetSchool(params);
    }

    render() {
        const { tabName } = this.state;
        const { school, BaseActions } = this.props;
        return (
            <section id="pop_content">
                <Sticky>
                <div className="tab_wrap">
                    <ul className="tab tab-col2">
                        <li className={'tab_item ta_r ' + (tabName==='search' ? 'active' : '')}>
                            <a
                                onClick={() => {this.handleTabClick('search')}}
                                className="tab_link">
                                <span>검색하기</span>
                                <span className="blind">현재페이지</span>
                            </a>
                        </li>
                        <li className={'tab_item ta_l ' + (tabName==='input' ? 'active' : '')}>
                            <a
                                onClick={() => {this.handleTabClick('input')}}
                                className="tab_link">
                                <span>직접입력</span>
                            </a>
                        </li>
                    </ul>
                </div>
                </Sticky>
                {tabName === 'input' ?
                    <InputSchool school={school} handleSetSchool={this.handleSetSchool} BaseActions={BaseActions}/> :
                    <SearchSchool handleSetSchool={this.handleSetSchool} handleTabClick={this.handleTabClick}/>}
            </section>
        );
    }
}

export default connect(
    (state) => ({
        school : state.join.get('school').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(FindSchool);
