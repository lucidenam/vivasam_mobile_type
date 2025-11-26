import React, { Component } from 'react';
import * as api from 'lib/api';
import { SearchLibraryList } from 'components/search';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import ReactDOM from 'react-dom';

class SearchLibraryListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    componentWillUnmount = () => {
        
    }

    changeSorting = (e) => {
        var vm = this;
        this.setState({
            offset:0,
            sorting : e.target.value
        });
        setTimeout(function(){
            vm.setState({
                libraryList : []
            })
            vm.getLibraryList();
        }, 10);
    }

    clcikMoreBtn = (e) => {
        this.getLibraryList();
    }

    changeTags = (e) => {
        const fileTypesArr = this.state.fileTypes;
        const libraryTypesArr = this.state.libraryTypes;
        let tagRowsArr = [];

        for(var i = 0; i < fileTypesArr.length; i++) {
            switch(fileTypesArr[i]) {
                case "FT201": tagRowsArr.push('동영상'); break;
                case "FT203": tagRowsArr.push('이미지'); break;
            }
        }

        for(var i = 0; i < libraryTypesArr.length; i++) {
            switch(libraryTypesArr[i]) {
                case "304007": tagRowsArr.push('인물'); break;
                case "304001": tagRowsArr.push('인문'); break;
                case "304002": tagRowsArr.push('사회'); break;
                case "304003": tagRowsArr.push('자연과학'); break;
                case "304004": tagRowsArr.push('문화/예술/스포츠'); break;
                case "304005": tagRowsArr.push('기술/공학'); break;
                case "304006": tagRowsArr.push('생활/가정'); break;
            }
        }

        this.setState({
            tagList : tagRowsArr
        })
    }

    detailSearchOnOff = (e) => {
        let detailSearchs = this.state.detailSearch;
        if(this.state.detailSearch) {
            detailSearchs = false;
        } else {
            detailSearchs = true;
        }

        this.setState({
            detailSearch : detailSearchs
        })
    }

    getLibraryList = async () => {
        try {
            var fileTypesJoin = this.state.fileTypes.join(',');
            var libraryTypesJoin = this.state.libraryTypes.join(',');

            const response = await api.searchLibraryList(
                this.props.searchKeyword //query
                , this.state.offset //offset
                , fileTypesJoin //schoolLevels
                , libraryTypesJoin //eduYears
                , this.state.sorting //sorting
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

                this.setState({
                    offset : offsetCount,
                    noResultKeyword : this.props.searchKeyword
                })
            } 
        } catch (e) {
            console.log(e);
        }
    }

    handleViewer = (e) => {
        const { logged, history } = this.props;
        if(!logged) {
            history.push('/login')
        } else {
            e.preventDefault();
            //img 가 클릭이벤트로 처리 되어 dom 처리 필요
            var parentNode = ReactDOM.findDOMNode(e.target).parentNode;
            const { ViewerActions } = this.props;
            ViewerActions.openViewer({title:parentNode.dataset.name, target:parentNode});
        }
    }

    clickSuggestLink = (query) => {
        var vm = this;
        const {changeSearchKeyword} = this.props;
        if(query != null) changeSearchKeyword(query);

        setTimeout(function(){
            vm.getLibraryList();
        }, 100);
    }

    changeDetailSearch = (param) => {
        if(param === 'ok') {
            this.setState({
                detailSearch : false
            })
        } else {
            let tagList = this.state.tagList;
            for(var i = 0; i < tagList.length; i++) {
                tagList[i].checked = true;
            }

            this.setState({
                detailSearch : false,
                tagList : tagList
            })
        }
    }

    getSuggestCompletion = async(query) => {
        const response = await api.getSuggestCompletion(query);
        if(response.data.suggestRelated != null && response.data.suggestRelated.length > 0) {
            this.setState({
                isSuggest : true,
                suggestRelations: response.data.suggestRelated
            })
        }
    }

    changeFilterList = (type, id) => {
        var vm = this;
        let tagList = this.state.tagList;
        var fileTypes = [];
        var libraryTypes = [];

        for(var i = 0; i < tagList.length; i++) {
            if(tagList[i].value === id) tagList[i].checked = !tagList[i].checked;
            if(tagList[i].type === 'fileType' && tagList[i].checked) fileTypes.push(tagList[i].value);
            if(tagList[i].type === 'libraryType' && tagList[i].checked) libraryTypes.push(tagList[i].value);
        }

        this.setState({
            tagList : tagList,
            fileTypes: fileTypes,
            libraryTypes : libraryTypes
        })

        setTimeout(function(){
            vm.getLibraryList();
        }, 10);
    }

    getSuggestQuery = async(query) => {
        const response = await api.getSuggestQuery(query);
        this.setState({
            suggestQuery : response.data.suggestQuery[0]
        })
    }

    changeKeywordAndSearch = (query) => {
        var vm = this;
        vm.props.changeSearchKeyword(query);
        setTimeout(function(){
            vm.getLibraryList();
        }, 10);
    }

    render() {
        const {
            searchKeyword, libraryCount, libraryList, libraryCodeList, noResultSearch, noResultKeyword, offset, isSuggest, suggestRelations, suggestQuery, 
            detailSearch, sorting,
            changeSearchKeyword, changeSorting, detailSearchOnOff, clcikMoreBtn, clickSuggestLink, changeKeywordSearch,
            getLibrarySearchList, resetDetailSearch, changeCodeLists, isLoading, handleViewer
        } = this.props;

        return <SearchLibraryList searchKeyword={searchKeyword}
                                  libraryCount={libraryCount}
                                  libraryList={libraryList}
                                  libraryCodeList={libraryCodeList}
                                  offset={offset}
                                  detailSearch={detailSearch}
                                  isSuggest={isSuggest}
                                  suggestRelations={suggestRelations}
                                  suggestQuery={suggestQuery}
                                  noResultSearch={noResultSearch}
                                  noResultKeyword={noResultKeyword}
                                  sorting={sorting}
                                  changeSearchKeyword={changeSearchKeyword}
                                  changeSorting={changeSorting}
                                  detailSearchOnOff={detailSearchOnOff}
                                  clcikMoreBtn={clcikMoreBtn}
                                  clickSuggestLink={clickSuggestLink}
                                  changeKeywordSearch={changeKeywordSearch}
                                  getLibrarySearchList={getLibrarySearchList}
                                  resetDetailSearch={resetDetailSearch}
                                  changeCodeLists={changeCodeLists}
                                  handleViewer={handleViewer}
                                  isLoading={isLoading}></SearchLibraryList>
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
    ViewerActions: bindActionCreators(viewerActions, dispatch)
})
)(withRouter(SearchLibraryListContainer));