import React, { Component } from 'react';
import * as api from 'lib/api';
import { SearchCsList } from 'components/search';

class SearchCsListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
    }

    render() {
        const { searchKeyword, csCount, csList, offset, sorting, suggestQuery, noResultSearch, noResultKeyword, 
            changeSorting, clcikMoreBtn, getCsSearchList, changeKeywordSearch, isLoading } = this.props;

        return <SearchCsList searchKeyword={searchKeyword}
                             csCount={csCount}
                             csList={csList}
                             offset={offset}
                             sorting={sorting}
                             suggestQuery={suggestQuery}
                             noResultSearch={noResultSearch}
                             noResultKeyword={noResultKeyword}
                             changeSorting={changeSorting}
                             clcikMoreBtn={clcikMoreBtn}
                             changeKeywordSearch={changeKeywordSearch}
                             getCsSearchList={getCsSearchList}
                             isLoading={isLoading}></SearchCsList>
    }
}

export default SearchCsListContainer;