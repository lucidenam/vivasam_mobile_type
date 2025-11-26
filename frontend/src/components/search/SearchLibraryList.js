import React from 'react';
import { Link } from 'react-router-dom';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

const Suggest = ({suggest, index, clickSuggestLink}) => {
    const linkUrl = '/search?query=' + suggest + '&type=total';
    if(index !== 0) {
        return (
            <Link to={linkUrl} onClick={clickSuggestLink.bind(this, suggest)}><span className="comma">, </span>{suggest}</Link>
        )
    } else {
        return (
            <Link to={linkUrl} onClick={clickSuggestLink.bind(this, suggest)}>{suggest}</Link>
        )
    }
}

const DetailSearch = ({detailSearchOnOff, libraryCodeList, resetDetailSearch, getLibrarySearchList, changeCodeLists, changeSorting}) => {
    const fileTypesChecks = libraryCodeList.map((fileType, index) => {
        const idVal = 'detail_check_filetype_image' + fileType.value;
        let isFile = false;
        if(fileType.type === 'fileType') isFile = true;
        return (
            <div key={index}>
            {isFile &&
                <span className="detail_input" key={fileType.value}>
                <input type="checkbox" value={fileType.value} id={idVal} name="detail_check_filetype"
                    onClick={changeCodeLists.bind(this, fileType.type, fileType.value)} 
                    defaultChecked={fileType.checked} className="checkbox_circle"/>
                <label className="label_type2" htmlFor={idVal}>{fileType.text}</label>
                </span>
            }
            </div>
        )
    });

    const libraryTypesChecks = libraryCodeList.map((libraryType, index) => {
        const idVal = 'detail_check_library_' + libraryType.value;
        let isLibrary = false;
        if(libraryType.type === 'libraryType') isLibrary = true;
        return (
            <div key={index}>
                {isLibrary &&
                <span className="detail_input" key={libraryType.value}>
                    <input type="checkbox" id={idVal} value={libraryType.id} name="detail_check_library"
                        onClick={changeCodeLists.bind(this, libraryType.type, libraryType.value)} 
                        defaultChecked={libraryType.checked} className="checkbox_circle"/>
                    <label className="label_type2" htmlFor={idVal}>{libraryType.text}</label>
                </span>
                }
            </div>
        )
    })

    return (
        <div>
            <div className="dim on"></div>
            <div className="detail_search_wrap">
                <div className="detail_search_scroll">
                    <h2 className="detail_search_title">상세검색</h2>
                    <div className="deatil_search_content">
                        <div className="detail_search_row">
                            <h3 className="detail_search_item">자료유형</h3>
                            <div className="detail_search_inputwrap col2">
                                {fileTypesChecks}
                            </div>
                        </div>
                        <div className="detail_search_row noline">
                            <h3 className="detail_search_item">카테고리</h3>
                            <div className="detail_search_inputwrap col2">
                                {libraryTypesChecks}
                            </div>
                        </div>
                    </div>
                    <div className="detail_search_buttonWrap">
                        <a className="detail_search_button reset" onClick={resetDetailSearch}>초기화</a>
                        <a className="detail_search_button submit" onClick={changeSorting}>확인</a>
                    </div>
                    <a className="detail_search_close" onClick={detailSearchOnOff}>
                        <span className="blind">상세검색 닫기</span>
                    </a>
                </div>
            </div>
        </div>
    )
}

const SearchLibraryList = ({searchKeyword, libraryCount, libraryList, libraryCodeList, noResultSearch, noResultKeyword, offset, isSuggest, suggestRelations, suggestQuery, 
    detailSearch, sorting, changeSearchKeyword, changeSorting, detailSearchOnOff, clcikMoreBtn, clickSuggestLink, changeKeywordSearch,
    getLibrarySearchList, resetDetailSearch, changeCodeLists, handleViewer, isLoading}) => {

    const Library = ({library, handleViewer}) => {
        const imagePath = DOWNLOAD_IMAGE_PATH + library.THUMBNAIL_PATH;
        const src = DOWNLOAD_IMAGE_PATH + library.FILE_PATH + library.SAVE_FILE_NAME;
        var pageLinkUrl = library.PAGE_LINK_URL;
        var params = pageLinkUrl.split("?")[1];
        var contentGubun = '';
        var contentId = '';

        for(var i = 0; i < params.split("&").length; i++) {
            if(params.split("&")[i].split("=")[0] === 'contentGubun') contentGubun = params.split("&")[i].split("=")[1];
            if(params.split("&")[i].split("=")[0] === 'contentId') contentId = params.split("&")[i].split("=")[1];
        }

        var type = 'video';
        var className = "library_item item_video";
        if(library.FILE_TYPE !== 'FT201') {
            type = 'image';
            className=  'library_item item_video type3';
        }

        return (
            <div className={className}>
                <a className="library_thumb"
                   data-id={contentId}
                   onClick={handleViewer}>
                    <img src={imagePath} alt={library.SUBJECT} className="thumb_img"/></a>
                <p className="library_title" dangerouslySetInnerHTML={{__html:library.SUBJECT}}></p>
            </div>
        )
    }
    
    const TagRow = ({tag}) => {
        return (
            <a className="tags_anchor" onClick={changeCodeLists.bind(this, tag.type, tag.value)}>{tag.text}<span className="tags_close_icon"></span></a>
        )
    }

    const libraryLists = libraryList.map((library, index) => {
        return (<Library library={library} handleViewer={handleViewer} key={index} />);
    });

    const tagRows = libraryCodeList.map((tag, index) => {
        const isShow = tag.checked;
        if(isShow) {
            return (
                <a className="tags_anchor" onClick={changeCodeLists.bind(this, tag.type, tag.value)} key={index}>
                    {tag.text}<span className="tags_close_icon"></span>
                </a>
            );
        }
    });

    const suggestRelationList = suggestRelations.map((suggest, index) => {
        return (<Suggest suggest={suggest} index={index} clickSuggestLink={clickSuggestLink} key={index} />)
    });

    let isSuggestQuery = false;
    if(suggestQuery !== undefined && suggestQuery.length > 0) isSuggestQuery = true;

    return (
        <div className="integration">
            {isSuggest &&
            <div>
                <div className="guideline"></div>
                <div className="relate_wrap">
                    <div className="relate_title">연관</div>
                    <div className="relate_keyword">
                        {suggestRelationList}
                    </div>
                </div>
                <div className="guideline"></div>
            </div>
            }
            {detailSearch &&
                <DetailSearch detailSearchOnOff={detailSearchOnOff}
                              resetDetailSearch={resetDetailSearch}
                              libraryCodeList={libraryCodeList}
                              changeCodeLists={changeCodeLists}
                              getLibrarySearchList={getLibrarySearchList}
                              changeSorting={changeSorting}
                ></DetailSearch>
            }
            <div>
                <div className="guideline"></div>
                <div className="integration_result">
                    <h2 className="integration_title">라이브러리 <span className="integration_count">({libraryCount})</span></h2>
                    <div className="subject_sorting">
                        <div className="subject_selectbox">
                            <select onChange={changeSorting} value={sorting}>
                                <option value="DEFAULT">정확도 순</option>
                                <option value="REG_DTTM">최신 순</option>
                                <option value="VIEW_CNT">조회수 순</option>
                            </select>
                        </div>
                        <button type="button" className="btn join_more_btn" onClick={detailSearchOnOff}>
                            <span className="icon_plus">상세검색</span>
                        </button>
                    </div>
                    {/*<div className="tags_wrap">
                        <div className="tags_row">
                            {tagRows}
                        </div>
                    </div>*/}
                    {isLoading && libraryCount === 0 &&
                        <RenderLoading />
                    }
                    <div className="library_list">
                        {libraryLists}
                    </div>
                    {isLoading && libraryCount > 0 &&
                        <ContentLoading />
                    }
                    {libraryCount > offset &&
                        <a className="intergration_full_button" onClick={clcikMoreBtn}>더보기</a>
                    }
                    {noResultSearch &&
                    <div>
                        <div className="guideline"></div>
                        <div className="empty_result_wrap">
                            <span className="integration_icon integration_icon_empty"></span>
                            <p className="empty_info_text1"><span className="highlight">'{noResultKeyword}'</span>에 대한 검색 결과가 없습니다.</p>
                            {isSuggestQuery &&
                            <div>
                                <p className="empty_info_text2"><span className="highlight">'{suggestQuery}'</span>으로 검색하시겠습니까?</p>
                                <a className="empty_search_button" onClick={changeSearchKeyword.bind(this, suggestQuery)}>검색</a>
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
            </div>
        </div>
    );
};

SearchLibraryList.defaultProps = {
    libraryList: []
}

export default SearchLibraryList;