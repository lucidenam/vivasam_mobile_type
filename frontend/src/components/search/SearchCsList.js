import React from 'react';
import { Link } from 'react-router-dom';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

const Cs = ({TITLE, PAGE_LINK_URL, PAGE_PATH, REG_DTTM}) => {
    const linkToPathName = '/cs/notice/' + PAGE_LINK_URL.split("noticeId=")[1];
    return (
        <li className="intergration_item">
            <Link to={linkToPathName} className="intergration_anchor">
                <div className="intergration_thumb">
                    <span className="integration_icon integration_icon_pdf"></span>
                </div>
                <div className="intergration_textbox">
                    <p className="intergration_title" dangerouslySetInnerHTML={{__html : TITLE}}></p>
                    <p className="intergration_directory" dangerouslySetInnerHTML={{__html:PAGE_PATH}}></p>
                </div>
            </Link>
        </li>
    )
}

const SearchCsList = ({ searchKeyword, csCount, csList, offset, sorting, suggestQuery, noResultSearch, noResultKeyword, changeSorting, clcikMoreBtn, 
    getCsSearchList, changeKeywordSearch, isLoading}) => {
    const csLists = csList.map(cs => {
        return (<Cs {...cs} key={cs.TITLE}/>)
    });

    let isSuggestQuery = false;
    if(suggestQuery !== undefined && suggestQuery.length > 0) isSuggestQuery = true;

    return (
        <div className="integration">
            <div className="guideline"></div>
            {!noResultSearch &&
                <div>
                    <div className="integration_result cs">
                        <h2 className="integration_title">고객센터 <span className="integration_count">({csCount})</span></h2>
                        <div className="subject_sorting">
                            <div className="subject_selectbox">
                                <select onChange={changeSorting} value={sorting}>
                                    <option value="DEFAULT">정확도 순</option>
                                    <option value="REG_DTTM">최신 순</option>
                                    <option value="READCNT">조회수 순</option>
                                </select>
                            </div>
                        </div>
                        {isLoading && csCount === 0 &&
                            <RenderLoading />
                        }
                        <ul className="integration_list">
                            {csLists}
                        </ul>
                        {isLoading && csCount > 0 &&
                            <ContentLoading  />
                        }
                        {csCount > offset &&
                        <a className="intergration_full_button" onClick={clcikMoreBtn}>더보기</a>
                        }
                    </div>
                </div>
            }
            {noResultSearch &&
            <div>
                <div className="empty_result_wrap">
                    <span className="integration_icon integration_icon_empty"></span>
                    <p className="empty_info_text1"><span className="highlight">'{noResultKeyword}</span>에 대한 검색 결과가 없습니다.</p>
                    {isSuggestQuery &&
                    <div>
                        <p className="empty_info_text2"><span className="highlight">'{suggestQuery}'</span>으로 검색하시겠습니까?</p>
                        <a className="empty_search_button" onClick={changeKeywordSearch.bind(this, suggestQuery)}>검색</a>
                    </div>
                    }
                </div>
                <div className="guideline"></div>
                <div className="empty_guide">
                    <span className="icon_noti">찾으시는 자료가 없으시다면 비바샘에 요청하실 수 있습니다.</span>
                    <Link to="/cs/qna/new" className="data_request_button">자료요청</Link>
                </div>
            </div>
            }
        </div>
    );
};

SearchCsList.defaultProps = {
    csList: []
}

export default SearchCsList;