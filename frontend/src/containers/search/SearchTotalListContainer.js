import React, { Component } from 'react';
import * as api from 'lib/api';
import { SearchTotalList } from 'components/search';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import ReactDOM from 'react-dom';

class SearchTotalListContainer extends Component {
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

    render() {
        const {
            searchKeyword, educourseCount, educourseList, libraryCount, libraryList, csCount, csList, noResultSearch, noResultKeyword, 
            isSuggest, suggestRelations, suggestQuery,
            changeSearchType, changeKeywordSearch, clickSuggestLink, isLoading, handleViewer } = this.props;

        return <SearchTotalList searchKeyword={searchKeyword}
                                educourseCount={educourseCount}
                                educourseList={educourseList}
                                libraryCount={libraryCount}
                                libraryList={libraryList}
                                csCount={csCount}
                                csList={csList}
                                isSuggest={isSuggest}
                                suggestRelations={suggestRelations}
                                changeSearchType={changeSearchType}
                                suggestQuery={suggestQuery}
                                noResultSearch={noResultSearch}
                                noResultKeyword={noResultKeyword}
                                changeKeywordSearch={changeKeywordSearch}
                                handleViewer={handleViewer}
                                clickSuggestLink={clickSuggestLink}
                                isLoading={isLoading}></SearchTotalList>
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
)(withRouter(SearchTotalListContainer));