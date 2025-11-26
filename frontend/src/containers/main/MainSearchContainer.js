import React, { Component } from 'react';
import { MainSearch } from 'components/main';
import { withRouter, Link } from 'react-router-dom';
import * as baseActions from 'store/modules/base';
import * as api from 'lib/api';
import * as common from 'lib/common';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {getIssueContentsGroupMainKeyword} from "lib/api";

class MainSearchContainer extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            searchKeyword: '',
            searchClassName : 'search_input',
            isSearch : false,
            autocompletes : [],
            searchUlClassName : 'keyword_list',
            isHistory : false,
            issueKeywordList : null,
        }

//        this.getIssueKeyword();
    }

    componentDidMount = () => {
        //setTimeout(()=>{
            this.getIssueKeyword();
       // }, 100);
    }

    componentWillUnmount = () => {
        
    }

    getIssueKeyword = async () => {
		const response = await getIssueContentsGroupMainKeyword();

		/*
		response.data.forEach(function (key) {
			issueDate.push(key.issueDay);
		});
		// 날짜 중복 제거
		issueDate = Array.from(new Set(issueDate.map((item) => item)));
		*/
        //console.log(response);
		this.setState({
			issueKeyword : response.data,
			//issueDate : issueDate
		})
	}

    handleChange = (e) => {
        const { logged, loginInfo } = this.props;
        var vm = this;
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;
        const cookieDelimiter = "##@@##";

        if(e.keyCode === 13 || e.charCode === 13) {
            this.setState({
                searchKeyword : e.target.value
            })
            setTimeout(function(){ vm.handleSearch(); }, 100);
        } else {
            if(e.target.value.length === 0) {
                var searchUlClassName = 'keyword_list';
                var autocompleteArr = [];

                if(logged) {
                    autocompleteArr = this.getCookie(cookieName).split(cookieDelimiter);
                    if(autocompleteArr.length === 1 && autocompleteArr[0] === '') {
                        autocompleteArr[0] = "검색 결과가 없습니다.";
                        searchUlClassName += " keyword_list_no";
                    }
                } else {
                    autocompleteArr[0] = "검색 결과가 없습니다.";
                    searchUlClassName += " keyword_list_no";
                }
                
                this.setState({
                    autocompletes : autocompleteArr,
                    searchUlClassName : searchUlClassName,
                    isHistory : true
                })
            } else {
                this.setState({
                    searchKeyword : e.target.value,
                    searchClassName : 'search_input active',
                    isSearch : true,
                    autocompletes : [],
                    searchUlClassName : 'keyword_list',
                    isHistory : false
                })

                setTimeout(function(){
                    vm.getAutocompleted();
                }, 10);
            }
        }
    }

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
                    isAutocomplete : true
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    handleSearch = () => {
        const { logged, loginInfo, history, BaseActions } = this.props;
        const { searchKeyword } = this.state;
        const cookieDelimiter = "##@@##";
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;
        if(logged) {
            //검색 history cookie 생성
            var cookies = this.getCookie(cookieName);
            var cValues;

            var expire = new Date();
            expire.setDate(expire.getDate() + 365);
            if(cookies !== '') {
                cValues = cookies.split(cookieDelimiter);
                if(cValues.indexOf(searchKeyword) > -1) {
                    cValues.splice(searchKeyword, 1);
                } else {
                    cValues.push(searchKeyword);
                }

                if(cValues.length > 7) cValues.splice(0, 1);
            } else {
                cValues = [];
                cValues.push(searchKeyword);
            }

            cookies = cookieName + '=' + escape(cValues.join(cookieDelimiter)) + '; path=/ '; // 한글 깨짐을 막기위해 escape(cValue)를 합니다.
            cookies += ';expires=' + expire.toGMTString() + ';';
            document.cookie = cookies;
        }

        var searchInfo = {
            searchKeyword : this.state.searchKeyword,
            searchType : 'total'
        }

        BaseActions.pushValues({type:"searchInfo", object: searchInfo});
        history.push('/search');
    }

    handleChangeState = () => {
        const { logged, loginInfo } = this.props;
        const cookieDelimiter = "##@@##";
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;

        var autocompletesArr = [];
        var searchUlClassName = 'keyword_list';
        var isHistory = false;
        
        if(logged) {
            autocompletesArr = this.getCookie(cookieName).split(cookieDelimiter);
            isHistory = true;
            if(autocompletesArr.length === 1 && autocompletesArr[0] === '') {
                autocompletesArr[0] = '검색 결과가 없습니다.';
                searchUlClassName += " keyword_list_no";
                isHistory = false;
            }
        } else {
            autocompletesArr[0] = '검색 결과가 없습니다.';
            searchUlClassName += " keyword_list_no";
        }

        this.setState({
            searchClassName : 'search_input active',
            isSearch : true,
            autocompletes : autocompletesArr,
            searchUlClassName : searchUlClassName,
            isHistory : isHistory
        })

        document.querySelector('body').classList.add('fix');
        document.querySelector('.myNavi').classList.add('hide');
    }

    handleCloseSearchArea = () => {
        this.setState({
            searchClassName : 'search_input',
            isSearch : false,
            isHistory : false
        })

        document.querySelector('#searchBtn').value = '';
        document.querySelector('body').classList.remove('fix');
        document.querySelector('.myNavi').classList.remove('hide');
    }

    clickAutoCompletes = (keyword) => {
        const {BaseActions, history} = this.props;
        var searchInfo = {
            searchKeyword : keyword,
            searchType : 'total'
        }

        BaseActions.pushValues({type:"searchInfo", object: searchInfo});
        history.push('/search');
    }

    deleteSearchHistory = (type) => {
        const { loginInfo } = this.props;
        const cookieName = 'vivasam_mobile_' + loginInfo.memberId;
        const cookieDelimiter = "##@@##";
        var cookies = this.getCookie(cookieName);
        var cValues, cValue;
        var expire = new Date();
        var vm = this;

        if(type === 'ALL') {
            expire.setDate( expire.getDate() - 1 );
            document.cookie = cookieName + "= " + "; expires=" + expire.toGMTString() + "; path=/";

            this.setState({
                autocompletes : ['검색 결과가 없습니다.'],
                searchUlClassName : 'keyword_list keyword_list_no',
                isHistory : false
            })
        } else {
            var cookieLength = this.getCookie(cookieName).split(cookieDelimiter).length;
            cValues = cookies.split(cookieDelimiter);
            cValues.splice(cValues.indexOf(type), 1);
            cValue = cValues.join(cookieDelimiter);
            expire.setDate(expire.getDate() + 365);
    
            cookies = cookieName + '=' + escape(cValue) + '; path=/ ';
            cookies += ';expires=' + expire.toGMTString() + ';';
            document.cookie = cookies;

            cookieLength--;

            if(cookieLength > 0) {
                this.setState({
                    autocompletes : this.getCookie(cookieName).split(cookieDelimiter)
                });
            } else {
                this.setState({
                    autocompletes : ['검색 결과가 없습니다.'],
                    searchUlClassName : 'keyword_list keyword_list_no',
                    isHistory : false
                })
            }
        }
    }

    render() {
        const {logged} = this.props;
        const {searchKeyword, isSearch, searchClassName, autocompletes, searchUlClassName, isHistory, issueKeyword} = this.state;
        return <MainSearch
            logged={logged}
            searchKeyword={searchKeyword}
            isSearch={isSearch}
            searchClassName={searchClassName}
            autocompletes={autocompletes}
            searchUlClassName={searchUlClassName}
            isHistory={isHistory}
            handleChange={this.handleChange}
            handleSearch={this.handleSearch}
            handleChangeState={this.handleChangeState}
            handleCloseSearchArea={this.handleCloseSearchArea}
            clickAutoCompletes={this.clickAutoCompletes}
            deleteSearchHistory={this.deleteSearchHistory}
            issueKeyword={issueKeyword} />
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        searchInfo : state.base.get('searchInfo')
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)
(withRouter(MainSearchContainer));
