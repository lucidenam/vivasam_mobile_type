import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';
import Footer from "components/page/Footer";
import { SearchTotalListContainer, SearchEducourseListContainer, SearchLibraryListContainer, SearchCsListContainer } from 'containers/search';
import ReactDOM from 'react-dom';
import {getContentTarget} from "../../components/common/utils";
import {getContentInfo} from "lib/api";
import {initializeGtag} from "../../store/modules/gtag";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchKeyword: '',
            inputFocus : false,
            suggestCompletions: [],
            autocompletes : [],
            isAutocomplete : false,
            searchType: 'TOTAL',
            sorting : 'DEFAULT',
            header : null,
            sticky : null,
            tooltipActive: false,
            isHistory : false,
            isHistories : [],
            //검색 목록용
            educourseCount : 0,
            educourseList : [],
            libraryCount : 0,
            libraryList : [],
            csCount : 0,
            csList : [],
            offset : 0,
            isSuggest : false,
            suggestRelations: [],
            suggestQuery: '',
            noResultSearch: false,
            noResultKeyword : '',
            detailSearch: false,
            //ORDER BY
            educourseCodeList : [
                {type : 'schoolLevel', text: '중학', value: 'MS', checked : true},
                {type : 'schoolLevel', text: '고등', value: 'HS', checked : true},
                {type : 'eduYear', text: '2015', value: '2015', checked : true},
                {type : 'eduYear', text: '2022', value: '2022', checked : true},
                {type : 'educourseType', text: '수업 자료', value: '1110001', checked : true},
                {type : 'educourseType', text: '평가 자료', value: '1110002', checked : true},
                {type : 'educourseType', text: '멀티미디어 자료', value: '1110003', checked : true},
                {type : 'educourseType', text: '이미지 자료', value: '1110005', checked : true},
                {type : 'educourseType', text: '음원 자료', value: '1110004', checked : true},
                {type : 'educourseType', text: '특화 자료', value: '302', checked : true},
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
            libraryCodeList : [
                {type: 'fileType', value : 'FT201', text : '동영상', checked : true },
                {type: 'fileType', value : 'FT203', text : '이미지', checked : true},
                {type: 'libraryType', value : '304007', text : '인물' , checked : true},
                {type: 'libraryType', value : '304001', text : '인문' , checked : true},
                {type: 'libraryType', value : '304002', text : '사회', checked : true},
                {type: 'libraryType', value : '304003', text : '자연과학', checked : true},
                {type: 'libraryType', value : '304004', text : '문화/예술/스포츠', checked : true},
                {type: 'libraryType', value : '304005', text : '기술/공학', checked : true},
                {type: 'libraryType', value : '304006', text : '생활/가정', checked : true}
            ],
            isLoading : false,
            stickyToggle : true
        }
    }

    //after mount
    componentDidMount = () => {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/search',
            'page_title': '통합검색｜비바샘'
        });
        const { searchInfo } = this.props;
        var vm = this;

        var searchKeyword = '';
        var searchType = 'total';

        if(searchInfo != null) {
            searchKeyword = searchInfo.searchKeyword;
            searchType = searchInfo.searchType;
        }

        this.setState({
            searchKeyword : searchKeyword,
            searchType : searchType
        })
        
        var headerMount = document.getElementById("sticky"),
            stickyMount = headerMount ? headerMount.offsetTop : ''; 

        this.setState({
            header : headerMount,
            sticky : stickyMount
        })

        window.addEventListener('scroll', this.handleScroll);
        
        setTimeout(function(){
            //검색
            vm.doSearch();
            //연관검색어
            vm.getSuggestCompletion();
        }, 10)
    }

    //unmount
    componentWillUnmount = () => {
        
    }

    //
    componentWillUpdate = () => {
        
    }

    stateDataReset = () => {
        this.setState({
            suggestCompletions: [],
            autocompletes : [],
            isAutocomplete : false,
            sorting : 'DEFAULT',
            //검색 목록용
            educourseCount : 0,
            educourseList : [],
            libraryCount : 0,
            libraryList : [],
            csCount : 0,
            csList : [],
            offset : 0,
            isSuggest : false,
            suggestRelations: [],
            suggestQuery: '',
            noResultKeyword : '',
            detailSearch: false,
            //ORDER BY
            educourseCodeList : [
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
            libraryCodeList : [
                {type: 'fileType', value : 'FT201', text : '동영상', checked : true },
                {type: 'fileType', value : 'FT203', text : '이미지', checked : true},
                {type: 'libraryType', value : '304007', text : '인물' , checked : true},
                {type: 'libraryType', value : '304001', text : '인문' , checked : true},
                {type: 'libraryType', value : '304002', text : '사회', checked : true},
                {type: 'libraryType', value : '304003', text : '자연과학', checked : true},
                {type: 'libraryType', value : '304004', text : '문화/예술/스포츠', checked : true},
                {type: 'libraryType', value : '304005', text : '기술/공학', checked : true},
                {type: 'libraryType', value : '304006', text : '생활/가정', checked : true}
            ]
        })
    }

    //검색어 입력창 키업 이벤트
    handleKeyUp = (e) => {
        var vm = this;
        const { logged, loginInfo, history } = this.props;
        const cookieDelimiter = "##@@##";
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;

        if(e.keyCode === 13 || e.charCode === 13) {
            if(logged) {
                //검색 history cookie 생성
                var cookies = this.getCookie(cookieName);
                var cValues;

                var expire = new Date();
                expire.setDate(expire.getDate() + 365);
                if(cookies !== '') {
                    cValues = cookies.split(cookieDelimiter);
                    if(cValues.indexOf(e.target.value) > -1) {
                        cValues.splice(e.target.value, 1);
                    } else {
                        cValues.push(e.target.value);
                    }

                    if(cValues.length > 7) cValues.splice(0, 1);
                } else {
                    cValues = [];
                    cValues.push(e.target.value);
                }

                cookies = cookieName + '=' + escape(cValues.join(cookieDelimiter)) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
                cookies += ';expires=' + expire.toGMTString() + ';';
                document.cookie = cookies;
            }

            //기존 검색 초기화
            this.setState({
                educourseCount : 0,
                educourseList : [],
                libraryCount : 0,
                libraryList : [],
                csCount : 0,
                csList : [],
                offset : 0,
            })

            //focus out
            e.target.blur();
            this.doSearch();
        } else {
            if(e.target.value !== '') {
                this.getAutocompleted();
                this.setState({
                    isHistory : false
                })
            } else {
                if(logged) {
                    this.setState({
                        isHistory : true,
                        isHistories : this.getCookie(cookieName).split(cookieDelimiter),
                        stickyToggle : false
                    })
                    
                    setTimeout(function(){
                        vm.setState({ isAutocomplete: false, })
                    }, 100);

                }
            }
        }
    }

    //검색이력삭제
    deleteHistory = (param, type) => {
        const { loginInfo } = this.props;
        const cookieDelimiter = "##@@##";
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;

        var cookies = this.getCookie(cookieName);
        var cValues, cValue;

        if(type === 'ALL') {
            cValue = '';

            this.setState({
                isHistories : []
            })
        } else {
            cValues = cookies.split(cookieDelimiter);
            cValues.splice(cValues.indexOf(param), 1);
            cValue = cValues.join(cookieDelimiter);
            var expire = new Date();
            expire.setDate(expire.getDate() + 365);
    
            cookies = cookieName + '=' + escape(cValue) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
            cookies += ';expires=' + expire.toGMTString() + ';';
            document.cookie = cookies;
    
            this.setState({
                isHistories : this.getCookie(cookieName).split(cookieDelimiter)
            })
        }

    }

    //쿠키조회
    getCookie = (cName) => {
        cName = cName + '=';
        var cookieData = document.cookie;
        var start = cookieData.indexOf(cName);
        var cValue = '';
        if(start != -1){
            start += cName.length;
            var end = cookieData.indexOf(';', start);
            if(end == -1)end = cookieData.length;
            cValue = cookieData.substring(start, end);
        }
        return unescape(cValue);
    }

    handleChange = (e) => {
        this.setState({
            searchKeyword : e.target.value
        });
    }

    handleClick = (param) => {
        var vm = this;
        this.setState({
            isHistory : false,
            searchKeyword : param
        })

        setTimeout(function(){
            vm.doSearch();
        }, 10);
    }


    changeSearchType = (param, e) => {
        var vm = this;

        this.setState({
            searchType : param,
            offset : 0,
            sorting : 'DEFAULT',
            detailSearch : false,
            educourseCount : 0,
            educourseList : [],
            libraryCount : 0,
            libraryList : [],
            csCount : 0,
            csList : []
        })

        //검색 필드 관련 초기화
        this.resetDetailSearchWithNoSearch();

        setTimeout(function(){
            vm.doSearch();
        }, 100);
    }

    getAutocompleted = async() => {
        try {
            const response = await api.getAutocompleted(this.state.searchKeyword);

            var autocompleteArr = [];
            for(var i = 0; i < response.data.suggestions[0].length; i++) {
                autocompleteArr.push(response.data.suggestions[0][i][0]);
            }

            this.setState({
                autocompletes : autocompleteArr
            })

            if(this.state.autocompletes.length > 0) {
                this.setState({
                    isAutocomplete : true,
                    stickyToggle : false
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    handleScroll = () => {
      if(!this.state.header){
        return false;
      }
    
      if (window.pageYOffset > this.state.sticky) {
        this.state.header.classList.add("sticky");
      } else {
        this.state.header.classList.remove("sticky");
      }
    }

    changeSearchKeyword = (param) => {
        this.setState({
            searchKeyword : param
        })

        this.doSearch();
    }

    //뒤로가기
    goBack = () => {
        const { history } = this.props;
        history.goBack();
    }

    //툴팁 열기
    openLayer = (e) => {
        var targetNode = ReactDOM.findDOMNode(e.target);
        if("integration_nav_infomation" === targetNode.className) {
            targetNode.className = "integration_nav_infomation active";
        } else {
            targetNode.className = "integration_nav_infomation";
        }

        if(this.state.tooltipActive) {
            this.setState({
                tooltipActive : false
            })
        } else {
            this.setState({
                tooltipActive : true        
            })
        }
    }

    //정렬 변경
    changeSorting = (e) => {
        var vm = this;
        this.setState({
            sorting : e.target.value,
            educourseCount : 0,
            educourseList : [],
            libraryCount : 0,
            libraryList : [],
            csCount : 0,
            csList : [],
            offset : 0
        })

        setTimeout(function(){
            vm.doSearch();
        }, 10);
    }

    //키워드 교체 후 검색
    changeKeywordSearch = (keyword) => {
        var vm = this;
        this.setState({
            searchKeyword : keyword
        })

        setTimeout(function(){
            vm.doSearch();
        }, 10);
    }

    //검색
    doSearch = async() => {
        const { BaseActions } = this.props;
        const { searchType } = this.state;
        var searchInfo = {
            searchKeyword : this.state.searchKeyword,
            searchType : this.state.searchType
        }
        BaseActions.pushValues({type:"searchInfo", object: searchInfo});

        this.setState({
            isSuggest:false,
            isAutocomplete : false,
            isHistory : false,
            noResultSearch: false,
            isLoading : true
        })

        if (searchType === 'educourse') {
            this.getEducourseSearchList();
        } else if (searchType === 'library') {
            this.getLibrarySearchList();
        } else if (searchType === 'cs') {
            this.getCsSearchList();
        } else {
            this.getTotalSearchList();
        }
    }

    //상세검색 필드 초기화 (검색 없이)
    resetDetailSearchWithNoSearch = () => {
        let educourseCodeList = this.state.educourseCodeList;
        let libraryCodeList = this.state.libraryCodeList;

        for(var i = 0; i < educourseCodeList.length; i++) {
            educourseCodeList[i].checked = true;
        }

        for(var i = 0; i < libraryCodeList.length; i++) {
            libraryCodeList[i].checked = true;
        }

        this.setState({
            educourseCodeList : educourseCodeList,
            libraryCodeList: libraryCodeList
        })
    }

    //상세검색 필드 초기화
    resetDetailSearch = () => {
        const vm = this;
        let educourseCodeList = this.state.educourseCodeList;
        let libraryCodeList = this.state.libraryCodeList;

        for(var i = 0; i < educourseCodeList.length; i++) {
            educourseCodeList[i].checked = true;
        }

        for(var i = 0; i < libraryCodeList.length; i++) {
            libraryCodeList[i].checked = true;
        }

        this.setState({
            detailSearch : false,
            educourseCodeList : educourseCodeList,
            libraryCodeList: libraryCodeList,
            isLoading : true
        })

        const searchType = this.state.searchType;
        if(searchType === 'educourse') {
            setTimeout(function(){ vm.getEducourseSearchList() }, 100);
        } else if (searchType === 'library') {
            setTimeout(function(){ vm.getLibrarySearchList() }, 100)
        }
    }

    changeCodeLists = (type, value) => {
        var vm = this;
        const { searchType } = this.state;
        let codeLists;
        if(searchType === 'educourse') {
            codeLists = this.state.educourseCodeList;
        } else if (searchType === 'library') {
            codeLists = this.state.libraryCodeList;
        }

        if(value !== 'ALL') {
            for(var i = 0; i < codeLists.length; i++) {
                if(codeLists[i].type === type && codeLists[i].value === value) codeLists[i].checked = !codeLists[i].checked;
                if(codeLists[i].type === 'subjectCode' && codeLists[i].value === 'ALL') codeLists[i].checked = false;
            }
        } else {
            for(var i = 0; i < codeLists.length; i++) {
                if(codeLists[i].type === 'subjectCode') codeLists[i].checked = true;
            }
        }

        window.scrollTo(0, 0);
        /*
        if(searchType === 'educourse') {
            vm.setState({ 
                educourseCodeList : codeLists, 
                offset : 0, 
                isLoading : true,
                educourseCount : 0,
                educourseList : []
            })
            setTimeout(function(){ vm.getEducourseSearchList(); }, 100);
        } else if (searchType === 'library') {
            vm.setState({ 
                libraryCodeList : codeLists, 
                offset : 0, 
                isLoading : true,
                libraryCount : 0,
                libraryList : []
            });
            setTimeout(function(){ vm.getLibrarySearchList(); }, 100);
        }
        */
    }

    //더보기
    clcikMoreBtn = () => {
        const {searchType} = this.state;
        this.setState({
            isLoading : true
        })
        if(searchType === 'educourse') {
            this.getEducourseSearchList();
        } else if (searchType === 'library') {
            this.getLibrarySearchList();
        } else if (searchType === 'cs') {
            this.getCsSearchList();
        }
    }

    //추천어 클릭
    clickSuggestLink = (query) => {
        if(query != null) this.changeSearchKeyword(query);
    }

    //교과자료 검색
    getEducourseSearchList = async() => {
        const { searchKeyword, educourseCodeList, sorting, offset } = this.state;
        this.setState({
            detailSearch : false,
        })

        try {
            var schoolLeves = [];
            var eduYears = [];
            var educourseTypes = [];
            var extNames = [];
            var subjectCodes = [];

            for(var i = 0; i < educourseCodeList.length; i++) {
                if(educourseCodeList[i].type === 'schoolLevel' && educourseCodeList[i].checked) schoolLeves.push(educourseCodeList[i].value);
                if(educourseCodeList[i].type === 'eduYear' && educourseCodeList[i].checked) eduYears.push(educourseCodeList[i].value);
                if(educourseCodeList[i].type === 'educourseType' && educourseCodeList[i].checked) educourseTypes.push(educourseCodeList[i].value);
                if(educourseCodeList[i].type === 'extName' && educourseCodeList[i].checked) extNames.push(educourseCodeList[i].value);
                if(educourseCodeList[i].type === 'subjectCode' && educourseCodeList[i].checked) subjectCodes.push(educourseCodeList[i].value);
            }

            //교과항목의 ALL 은 제외
            if(subjectCodes.indexOf("ALL") > -1) subjectCodes.splice(subjectCodes.indexOf("ALL"), 1);

            const response = await api.searchEducourseList(
                searchKeyword //query
                , offset //offset
                , schoolLeves.join(',') //schoolLevels
                , eduYears.join(',') //eduYears
                , educourseTypes.join(',') //educourseTypes
                , extNames.join(',') //extNames
                , subjectCodes.join(',') //subjectCodes
                , sorting //sorting
            );

            if(response !== null || response !== undefined) {
                if(this.state.educourseList.length === 0) {
                    this.setState({ 
                        educourseCount: response.data.educourseCount,
                        educourseList : response.data.educourseList
                    })
                } else {
                    var educourseLists = this.state.educourseList;
                    for(var i = 0; i < response.data.educourseList.length; i++) {
                        educourseLists.push(response.data.educourseList[i]);
                    }
                    this.setState({ 
                        educourseCount: response.data.educourseCount,
                        educourseList : educourseLists
                    })
                }
    
                //더보기를 위한 offset 작업
                var offSetCount = this.state.offset;
                if(this.state.educourseCount > 0 && this.state.educourseCount > 20) {
                    offSetCount += 20;
                } else {
                    offSetCount = response.data.educourseCount;
                }
    
                this.setState({
                    offset : offSetCount,
                    noResultKeyword : searchKeyword,
                    noResultSearch : (response.data.educourseCount === 0) ? true : false,
                    isLoading : false
                })
            }
        } catch(e) {
            console.log(e);
            this.setState({ isLoading : false });
        }
    }

    //라이브러리 검색
    getLibrarySearchList = async() => {
        const {searchKeyword, sorting, offset, libraryCodeList } = this.state;
        this.setState({
            detailSearch : false,
        })

        var fileTypes = [];
        var libraryTypes = [];

        for(var i = 0; i < libraryCodeList.length; i++) {
            if(libraryCodeList[i].type === 'fileType' && libraryCodeList[i].checked) fileTypes.push(libraryCodeList[i].value);
            if(libraryCodeList[i].type === 'libraryType' && libraryCodeList[i].checked) libraryTypes.push(libraryCodeList[i].value);
        }

        try {
            const response = await api.searchLibraryList(
                searchKeyword //query
                , offset //offset
                , fileTypes.join(',') //schoolLevels
                , libraryTypes.join(',') //eduYears
                , sorting //sorting
            );

            if(response !== null || response !== undefined) {
                if(this.state.libraryList.length === 0) {
                    this.setState({ 
                        libraryCount: response.data.libraryCount,
                        libraryList : response.data.libraryList
                    })
                } else {
                    var libraryLists = this.state.libraryList;
                    for(var i = 0; i < response.data.libraryList.length; i++) {
                        libraryLists.push(response.data.libraryList[i]);
                    }
                    this.setState({ 
                        libraryCount: response.data.libraryCount,
                        libraryList : libraryLists
                    })
                }
                //더보기를 위한 offset 작업
                var offsetCount = this.state.offset;
                if(this.state.libraryCount > 0 && this.state.libraryCount > 20) {
                    offsetCount += 20;
                } else {
                    offsetCount = response.data.libraryCount;
                }
                
                if(response.data.libraryCount === 0 || response.data.libraryCount === undefined) {
                    this.setState({
                        offset : 0,
                        noResultKeyword : searchKeyword,
                        noResultSearch : true,
                        isLoading : false,
                        libraryCount : 0,
                        libraryList : []
                    })
                } else {
                    this.setState({
                        offset : offsetCount,
                        noResultKeyword : searchKeyword,
                        noResultSearch : false,
                        isLoading : false
                    })
                }
            } else {
                this.setState({
                    offset : 0,
                    noResultKeyword : searchKeyword,
                    noResultSearch : true,
                    libraryCount : 0,
                    libraryList : [],
                    isLoading : false
                })
            }
        } catch (e) {
            console.log(e);
            this.setState({ isLoading : false });
        }
    }

    //공지사항 검색
    getCsSearchList = async() => {
        const {searchKeyword, offset, sorting} = this.state;
        try {
            const response = await api.searchCsList(
                searchKeyword //query
                , offset //offset
                , sorting //sorting
            );

            if(response !== null && response !== undefined) {
                if(this.state.csList.length === 0) {
                    this.setState({ 
                        csCount: response.data.csCount,
                        csList : response.data.csList
                    })
                } else {
                    var csLists = this.state.csList;
                    for(var i = 0; i < response.data.csList.length; i++) {
                        csLists.push(response.data.csList[i]);
                    }
                    this.setState({ 
                        csCount: response.data.csCount,
                        csList : csLists
                    })
                }
    
                //더보기를 위한 offset 작업
                var offSetCount = this.state.offSet;
                if(this.state.csCount > 0 && this.state.csCount > 20) {
                    offSetCount += 20;
                } else {
                    offSetCount = response.data.csCount;
                }
    
                this.setState({
                    offSet : offSetCount,
                    noResultKeyword : searchKeyword,
                    noResultSearch : (response.data.csCount === 0) ? true : false,
                    isLoading : false
                })
            }
        } catch (e) {
            console.log(e);
            this.setState({ isLoading : false });
        }
    }

    getSuggestCompletion = async() => {
        const {searchKeyword} = this.state;
        const response = await api.getSuggestCompletion(searchKeyword);
        if(response.data.suggestRelated != null && response.data.suggestRelated.length > 0) {
            this.setState({
                isSuggest : true,
                suggestRelations: response.data.suggestRelated
            })
        }
    }

    getSuggestQuery = async() => {
        const {searchKeyword} = this.state;
        const response = await api.getSuggestQuery(searchKeyword);
        this.setState({
            suggestQuery : response.data.suggestQuery[0]
        })
    }

    //통합검색
    getTotalSearchList = async() => {        
        try {
            const response = await api.getSearchList(this.state.searchKeyword);
            this.setState({
                educourseCount : response.data.educourseCount,
                educourseList : response.data.educourseList,
                libraryCount : response.data.libraryCount,
                libraryList : response.data.libraryList,
                csCount : response.data.csCount,
                csList : response.data.csList,
                noResultKeyword : this.state.searchKeyword,
                noResultSearch : (response.data.educourseCount === 0 && response.data.libraryCount === 0 && response.data.csCount === 0) ? true : false,
                isLoading : false
            })
        } catch (e) {
            console.log(e);
            this.setState({ isLoading : false });
        }
    }

    //상세 검색 on/off
    detailSearchOnOff = () => {
        let detailSearchs = this.state.detailSearch;
        if(this.state.detailSearch) {
            detailSearchs = false;
            document.querySelector('body').classList.remove('fix');
        } else {
            detailSearchs = true;
            document.querySelector('body').classList.add('fix');
        }

        this.setState({
            detailSearch : detailSearchs
        })
    }

    //뷰어
    handleViewer = async (e) => {
        const { logged, history, location } = this.props;
        if(!logged) {
            //history.push('/login')
            history.replace({
                pathname: '/login',
                state: { prevPath: location.pathname }
            });
        } else {
            e.preventDefault();
            //img 가 클릭이벤트로 처리 되어 dom 처리 필요
            const { ViewerActions } = this.props;
            var parentNode = ReactDOM.findDOMNode(e.target).parentNode;
            const target = getContentTarget((await getContentInfo(parentNode.dataset.id)).data);

            console.log(target.dataset.vbook);
            // 외부링크(FT206) 콘텐츠라면 외부 브라우저로 열기
            if (target.dataset.fileType === 'FT206') {
                onClickCallLinkingOpenUrl(this.generateRedirectUrl(target.dataset.siteurl));
                return;
            }

            ViewerActions.openViewer({title: target.dataset.name, target: target});
        }
    }

    generateRedirectUrl = (siteUrl) => {
        let url = new URL(siteUrl, window.location.origin);

        // skin 파라미터 없으면 추가
        if (!url.searchParams.has('skin')) {
            url.searchParams.append('skin', 'vivasam_t_01');
        }
        // token 파라미터 없으면 추가
        if (!url.searchParams.has('token')) {
            url.searchParams.append('token', localStorage.getItem('exSsToken'));
        }

        return url.toString();
    }

    handleFocus = () => {
        const { loginInfo } = this.props;
        const { searchKeyword } = this.state;

        const cookieDelimiter = "##@@##";
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;

        if(searchKeyword.length > 0) {
            //autocomplete
            this.setState({
                isAutocomplete : true,
                stickyToggle : false
            })

            this.getAutocompleted();
        } else {
            //history
            this.setState({
                isHistory : true,
                isHistories : this.getCookie(cookieName).split(cookieDelimiter),
                stickyToggle : false
            })
        }

        document.querySelector('body').classList.add('fix');
    }

    handleBlur = () => {
        this.setState({
            isAutocomplete : false,
            isHistory : false,
            stickyToggle : true
        })

        document.querySelector('body').classList.remove('fix');
    }

    render() {
        const { 
            searchKeyword, searchType, tooltipActive, isAutocomplete, autocompletes, isHistory, isHistories,
            educourseCount, educourseList, libraryCount, libraryList, csCount, csList, noResultSearch, noResultKeyword, 
            offset, detailSearch, sorting, educourseCodeList, libraryCodeList,
            isSuggest, suggestRelations, suggestQuery, isLoading
        } = this.state;

        const goPage = (param) => {
            this.setState({ searchKeyword : param });
            this.stateDataReset();
            var vm = this;
            setTimeout(function(){ vm.doSearch(); }, 10)
        }

        const HistoryList = ({isHistories}) => {
            let historyClassName = 'keyword_list';
            if(isHistories.length === 1 && isHistories[0] === '') {
                historyClassName += ' keyword_list_no';
                isHistories[0] = "검색결과가 없습니다.";
            }

            const History = isHistories.map((history, index) => {
                return (
                    <li className="keyword_item" key={index}>
                        <span className="keyword_txt" onClick={this.handleClick.bind(this, history)}>{history}</span>
                        {history !== '검색결과가 없습니다.' &&
                            <button className="keyword_delete btn_close2" onClick={this.deleteHistory.bind(this, history, null)}>삭제</button>
                        }
                    </li>
                )
            });

            return (
                <ul className={historyClassName} id="keywordSearch">
                    {History}
                </ul>
            )
        }

        const AutocompleteList = ({searchKeyword, autocompletes}) => {
            const Autocomplete = autocompletes.map((autocomplete, index) => {
                let spanText = '';
                let otherText = '';

                for(var i = 0; i < autocomplete.length; i++) {
                    if(i < searchKeyword.length && searchKeyword.indexOf(autocomplete[i]) > -1) {
                        spanText += autocomplete[i];
                    } else {
                        otherText += autocomplete[i];
                    }
                }

                return (
                    <li className="keyword_item" key={index}>
                        <a onClick={goPage.bind(this, autocomplete)} className="keyword__anchor">
                            <span className="highlight">{spanText}</span>{otherText}
                        </a>
                    </li>
                );
            });

            return (
                <ul className="keyword_list">
                    {Autocomplete}
                </ul>
            );
        };

        const NavBoxList = () => {
            let totalClassName = "integration_nav_item";
            let educourseClassName = "integration_nav_item";
            let libraryClassName = "integration_nav_item";
            let csClassName = "integration_nav_item";

            switch(this.state.searchType) {
                case "total" : totalClassName += " active"; break;
                case "educourse" : educourseClassName += " active"; break;
                case "library" : libraryClassName += " active"; break;
                case "cs" : csClassName += " active"; break;
            }

            return (
                <ul className="integration_nav_list">
                    <li className={totalClassName}>
                        <a className="intergration_nav_anchor" onClick={this.changeSearchType.bind(this, 'total')}>전체</a>
                    </li>
                    <li className={educourseClassName}>
                        <a className="intergration_nav_anchor" onClick={this.changeSearchType.bind(this, 'educourse')}>교과자료</a>
                    </li>
                    <li className={libraryClassName}>
                        <a className="intergration_nav_anchor" onClick={this.changeSearchType.bind(this, 'library')}>라이브러리</a>
                    </li>
                    <li className={csClassName}>
                        <a className="intergration_nav_anchor" onClick={this.changeSearchType.bind(this, 'cs')}>고객센터</a>
                    </li>
                </ul>
            );
        }
        
        let searchArea;
        if(searchType === 'total') {
            searchArea = <SearchTotalListContainer searchKeyword={searchKeyword} 
                                                   educourseCount={educourseCount}
                                                   educourseList={educourseList}
                                                   libraryCount={libraryCount}
                                                   libraryList={libraryList}
                                                   csCount={csCount}
                                                   csList={csList}
                                                   noResultSearch={noResultSearch}
                                                   noResultKeyword={noResultKeyword}
                                                   isSuggest={isSuggest}
                                                   suggestRelations={suggestRelations}
                                                   suggestQuery={suggestQuery}
                                                   changeSearchType={this.changeSearchType}
                                                   changeKeywordSearch={this.changeKeywordSearch}
                                                   clickSuggestLink={this.clickSuggestLink}
                                                   isLoading={isLoading}
                                                   handleViewer={this.handleViewer}></SearchTotalListContainer>
        } else if (searchType === 'educourse') {
            searchArea = <SearchEducourseListContainer searchKeyword={searchKeyword}
                                                       educourseCount={educourseCount}
                                                       educourseList={educourseList}
                                                       educourseCodeList={educourseCodeList}
                                                       noResultSearch={noResultSearch}
                                                       noResultKeyword={noResultKeyword}
                                                       offset={offset}
                                                       isSuggest={isSuggest}
                                                       suggestRelations={suggestRelations}
                                                       suggestQuery={suggestQuery}
                                                       detailSearch={detailSearch}
                                                       sorting={sorting}
                                                       changeSearchKeyword={this.changeSearchKeyword}
                                                       changeSorting={this.changeSorting}
                                                       detailSearchOnOff={this.detailSearchOnOff}
                                                       clcikMoreBtn={this.clcikMoreBtn}
                                                       clickSuggestLink={this.clickSuggestLink}
                                                       changeKeywordSearch={this.changeKeywordSearch}
                                                       getEducourseLists={this.getEducourseSearchList}
                                                       resetDetailSearch={this.resetDetailSearch}
                                                       changeCodeLists={this.changeCodeLists}
                                                       isLoading={isLoading}
                                                       handleViewer={this.handleViewer}></SearchEducourseListContainer>
        } else if (searchType === 'library') {
            searchArea = <SearchLibraryListContainer searchKeyword={searchKeyword}
                                                     libraryCount={libraryCount}
                                                     libraryList={libraryList}
                                                     libraryCodeList={libraryCodeList}
                                                     noResultSearch={noResultSearch}
                                                     noResultKeyword={noResultKeyword}
                                                     offset={offset}
                                                     isSuggest={isSuggest}
                                                     suggestRelations={suggestRelations}
                                                     suggestQuery={suggestQuery}
                                                     detailSearch={detailSearch}
                                                     sorting={sorting}
                                                     changeSearchKeyword={this.changeSearchKeyword}
                                                     changeSorting={this.changeSorting}
                                                     detailSearchOnOff={this.detailSearchOnOff}
                                                     clcikMoreBtn={this.clcikMoreBtn}
                                                     clickSuggestLink={this.clickSuggestLink}
                                                     changeKeywordSearch={this.changeKeywordSearch}
                                                     getLibrarySearchList={this.getLibrarySearchList}
                                                     resetDetailSearch={this.resetDetailSearch}
                                                     changeCodeLists={this.changeCodeLists}
                                                     isLoading={isLoading}
                                                     handleViewer={this.handleViewer}></SearchLibraryListContainer>
        } else if (searchType === 'cs') {
            searchArea = <SearchCsListContainer searchKeyword={searchKeyword}
                                                csCount={csCount}
                                                csList={csList}
                                                offset={offset}
                                                sorting={sorting}
                                                suggestQuery={suggestQuery}
                                                noResultSearch={noResultSearch}
                                                noResultKeyword={noResultKeyword}
                                                changeSorting={this.changeSorting}
                                                clcikMoreBtn={this.clcikMoreBtn}
                                                getCsSearchList={this.getCsSearchList}
                                                changeKeywordSearch={this.changeKeywordSearch}
                                                isLoading={isLoading}></SearchCsListContainer>
        }

        let headerClass = '';
        let searchClass = '';
        if(isHistory) {
            headerClass = 'header_sub no_line front_dim';
            searchClass = 'search_bar_wrap front_dim';
        } else {
            headerClass = 'header_sub no_line';
            searchClass = 'search_bar_wrap front_dim';
        }

        return (
            <div id="wrap">
                <header className={headerClass}>
                    <h1 className="header_tit">통합검색</h1>
                    <div className="allMenu">
                        <a onClick={this.goBack} className="allMenu_back"><span className="blind">이전 페이지 이동</span></a>
                    </div>
                </header>
                <div className={searchClass}>
                    <div className="search_bar">
                        <span className="search_input">
                            <input type="search" autoCapitalize="none" 
                                onChange={this.handleChange}
                                onKeyUp={this.handleKeyUp}
                                onFocus={this.handleFocus}
                                value={this.state.searchKeyword}/>
                        </span>
                        <button className="search_button" onClick={this.doSearch}><span className="blind">검색</span></button>
                    </div>
                </div>
                {isHistory && 
                <div className="keyword_index" id="autoKeyword">
                    <div className="keyword_box">
                        <HistoryList isHistories={isHistories} />
                        <div className="keyword_delete_box">
                            <button className="btn_square_type5" onClick={this.deleteHistory.bind(this, null, 'ALL')}>검색 기록 전체 삭제</button>
                            <button className="btn_del_keyword" onClick={this.handleBlur} id="btnDelete">닫기</button>
                        </div>
                    </div>
                    {/* <div className="dim on"></div> */}
                </div>
                }
                {isAutocomplete && 
                <div className="keyword_index" id="autoKeyword">
                    <div className="keyword_box">
                        <AutocompleteList searchKeyword={searchKeyword} autocompletes={autocompletes}></AutocompleteList>
                        <div className="keyword_delete_box">
                            {/*<button className="btn_del_keyword" onClick={this.handleBlur} id="btnDelete">닫기</button>*/}
                        </div>
                    </div>
                    {/* <div className="dim on"></div> */}
                </div>
                }
                <div id="sticky" className="integration_nav_wrap" style={{display: this.state.stickyToggle ? 'block' : 'none'}}>
                    <div className="integration_nav_box">
                        <NavBoxList></NavBoxList>
                    </div>
                    <a className="integration_nav_infomation" onClick={this.openLayer} style={{display: 'none'}}>
                        <span className="blind">?</span>
                    </a>
                </div>
                {tooltipActive &&
                <div className="layer_help type2" id="layerHelpPop">
                    <div className="layer_help_box">
                        <p className="layer_help_ment">플래시 자료는 PC웹에서만 제공합니다.</p>
                    </div>
                </div>
                }
                {searchArea}
                <Footer/>
            </div>
        ) 
    }
}
  
export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        searchInfo : state.base.get('searchInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)
(withRouter(SearchPage));