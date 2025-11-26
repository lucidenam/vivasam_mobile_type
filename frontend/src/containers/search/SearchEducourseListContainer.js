import React, { Component } from 'react';
import * as api from 'lib/api';
import { SearchEducourseList } from 'components/search';
import ReactDOM from 'react-dom';

class SearchEducourseListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            educourseCount : 0,
            educourseList : [],
            offset : 0,
            //DEFAULT, REG_DTTM, VIEW_CNT
            educourseSorting : "DEFAULT",
            detailSearch : false,
            isSuggest : false,
            suggestRelations: [],
            suggestQuery : '',
            //ES : 초등, MS : 중등, HS : 고등
            //1110001 : 수업자료, 1110002 : 평가자료, 1110003 : 멀티미디어자료, 1110005 : 이미지자료, 1110004 : 음원자료, 302 : 특화자료
            //"hwp", "ppt", "pdf", "jpg", "mp4", "mp3", "etc"
            //SC401 국어, SC402 영어, SC403 수학, SC404 사회, SC405 역사, SC406 도덕, SC407 과학, SC408 한문, SC409 기술/가정, SC410 정보, SC411 음악, SC412 미술, SC413 체육, SC415 진로와 직업
            codeLists : [
                {type : 'schoolLevel', text: '중학', value: 'MS', checked : true},
                {type : 'schoolLevel', text: '고등', value: 'HS', checked : true},
                {type : 'eduYear', text: '2015', value: '2015', checked : true},
                {type : 'eduYear', text: '2022', value: '2022', checked : true},
                {type : 'educourseType', text: '수업자료', value: '1110001', checked : true},
                {type : 'educourseType', text: '평가자료', value: '1110002', checked : true},
                {type : 'educourseType', text: '멀티미디어자료', value: '1110003', checked : true},
                {type : 'educourseType', text: '이미지자료', value: '1110005', checked : true},
                {type : 'educourseType', text: '음원자료', value: '1110004', checked : true},
                {type : 'educourseType', text: '특화자료', value: '302', checked : true},
                {type : 'educourseType', text: '스마트 교수자료', value: '5020001', checked : true},
                {type : 'extName', text: 'hwp', value: 'hwp', checked : true},
                {type : 'extName', text: 'ppt', value: 'ppt', checked : true},
                {type : 'extName', text: 'pdf', value: 'pdf', checked : true},
                {type : 'extName', text: 'mp4', value: 'mp4', checked : true},
                {type : 'extName', text: 'mp3', value: 'mp3', checked : true},
                {type : 'extName', text: 'jpeg/png', value: 'jpg', checked : true},
                {type : 'extName', text: 'etc', value: 'etc', checked : true},
                {type : 'subjectCode', text: '전체', value: 'ALL', checked : true},
                {type : 'subjectCode', text: '국어', value: 'SC401', checked : true},
                {type : 'subjectCode', text: '영어', value: 'SC402', checked : true},
                {type : 'subjectCode', text: '수학', value: 'SC403', checked : true},
                {type : 'subjectCode', text: '사회', value: 'SC404', checked : true},
                {type : 'subjectCode', text: '역사', value: 'SC405', checked : true},
                {type : 'subjectCode', text: '도덕', value: 'SC406', checked : true},
                {type : 'subjectCode', text: '윤리', value: 'SC418', checked : true},
                {type : 'subjectCode', text: '과학', value: 'SC407', checked : true},
                {type : 'subjectCode', text: '한문', value: 'SC408', checked : true},
                {type : 'subjectCode', text: '기술·가정', value: 'SC409', checked : true},
                {type : 'subjectCode', text: '정보', value: 'SC410', checked : true},
                {type : 'subjectCode', text: '음악', value: 'SC411', checked : true},
                {type : 'subjectCode', text: '미술', value: 'SC412', checked : true},
                {type : 'subjectCode', text: '체육', value: 'SC413', checked : true},
                {type : 'subjectCode', text: '진로와 직업', value: 'SC415', checked : true},
                {type : 'subjectCode', text: '교양', value: 'SC417', checked : true}
            ],
            noResultKeyword : ''
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    resetDetailSearch = (e) => {
        const vm = this;
        let codeLists = this.state.codeLists;
        for(var i = 0; i < codeLists.length; i++) {
            codeLists[i].checked = true;
        }

        this.setState({
            detailSearch : false,
            codeLists : codeLists
        })

        setTimeout(function(){
            vm.getEducourseLists()
        }, 10);
    }

    render() {
        const {
            searchKeyword, educourseCount, educourseList, educourseCodeList, noResultSearch, noResultKeyword, offset, isSuggest, suggestRelations, suggestQuery, 
            detailSearch, sorting,
            changeSearchKeyword, changeSorting, detailSearchOnOff, clcikMoreBtn, clickSuggestLink, changeKeywordSearch,
            getEducourseLists, resetDetailSearch, changeCodeLists, isLoading, handleViewer
        } = this.props;

        return <SearchEducourseList searchKeyword={searchKeyword}
                                    educourseCount={educourseCount}
                                    educourseList={educourseList}
                                    offset={offset}
                                    detailSearch={detailSearch}
                                    isSuggest={isSuggest}
                                    suggestRelations={suggestRelations}
                                    suggestQuery={suggestQuery}
                                    educourseCodeList={educourseCodeList}
                                    noResultSearch={noResultSearch}
                                    noResultKeyword={noResultKeyword}
                                    sorting={sorting}
                                    changeSearchKeyword={changeSearchKeyword}
                                    changeSorting={changeSorting}
                                    detailSearchOnOff={detailSearchOnOff}
                                    clcikMoreBtn={clcikMoreBtn}
                                    clickSuggestLink={clickSuggestLink}
                                    changeKeywordSearch={changeKeywordSearch}
                                    getEducourseLists={getEducourseLists}
                                    resetDetailSearch={resetDetailSearch}
                                    changeCodeLists={changeCodeLists}
                                    isLoading={isLoading}
                                    handleViewer={handleViewer}></SearchEducourseList>
    }
}

export default SearchEducourseListContainer;