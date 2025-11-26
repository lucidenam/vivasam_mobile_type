import React from 'react';
import {Link} from 'react-router-dom';
import Slider from "react-slick";

const MainSearch = ({logged, searchKeyword, isSearch, searchClassName, autocompletes, searchUlClassName, isHistory,
    handleChange, handleSearch, handleChangeState, handleCloseSearchArea, clickAutoCompletes, deleteSearchHistory, issueKeyword}) => {
    const handleFocusIn = (e) => {
        handleChangeState();
    }

    const AutocompleteList = ({searchKeyword, autocompletes, searchUlClassName, isHistory, deleteSearchHistory}) => {
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
                    <a className="keyword_txt" onClick={clickAutoCompletes.bind(this, autocomplete)}>
                        <span className="highlight">{spanText}</span>{otherText}
                    </a>
                    {isHistory &&
                        <button className="keyword_delete btn_close2" onClick={deleteSearchHistory.bind(this, autocomplete)}>삭제</button>
                    }
                </li>
            );
        });

        return (
            <ul className={searchUlClassName}>
                {Autocomplete}
            </ul>
        );
    };

    let issueKeywordList = [];
    if ({issueKeyword}.issueKeyword != null) {
        for (let i=0; i< {issueKeyword}.issueKeyword.length; i++) {
            let data = {issueKeyword}.issueKeyword[i];
            issueKeywordList.push(data);
        }
    }

    let settings = {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 3000,
        adaptiveHeight: true,
        vertical: true          // 가로, 세로
    };

    return (
        <div>
            <div className="search">
                <label htmlFor="searchBtn" className={searchClassName}>
                    <input type="search" id="searchBtn" autoCapitalize="none" title="검색어 입력" onKeyUp={handleChange} onFocus={handleFocusIn}></input>
                    <div className="">
                        <Slider {...settings}>
                            {
                                issueKeywordList.map((keyword, index) => {
                                    return (
                                        <Link to={"/liveLesson/MonthContainer"} key={index}>
                                            {/* {keyword.ISSUE_MM + "." + keyword.ISSUE_DD + " " + keyword.ISSUE_DATA} */}
                                            <time className="tri_date">{keyword.ISSUE_MM + "." + keyword.ISSUE_DD}</time>{" " + keyword.ISSUE_DATA}
                                        </Link>
                                    )
                                })
                            }
                        </Slider>
                    </div>
                </label>
                <button type="button" className="search_icon" onClick={handleSearch}></button>
            </div>
            {isSearch &&
                <div className="keyword_index" id="autoKeyword">
                    <div className="keyword_box">
                        <AutocompleteList 
                            searchKeyword={searchKeyword} 
                            autocompletes={autocompletes} 
                            searchUlClassName={searchUlClassName}
                            isHistory={isHistory}
                            deleteSearchHistory={deleteSearchHistory}>
                        </AutocompleteList>
                        <div className="keyword_delete_box">
                            {logged &&
                            <button className="btn_square_type5" onClick={deleteSearchHistory.bind(this, 'ALL')}>검색 기록 전체 삭제</button>
                            }
                            <button className="btn_del_keyword" id="btnDelete" onClick={handleCloseSearchArea}>닫기</button>
                        </div>
                    </div>
                </div>
            }
        </div>
        
    );
};

export default MainSearch;