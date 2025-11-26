import React from 'react';
import { Link } from 'react-router-dom';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';

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

const Educourse = ({educourse, handleViewer}) => {
    //link url 이 정해지면 바꿔야 함, AS IS 의 경우 2개의 파라미터를 받아서 전달함 
    const linkToPathName = '/educourse/textbook/' + educourse.TEXTBOOKCD;
    let anchorClassName = 'intergration_anchor';

    const thumnailPath = /*DOWNLOAD_IMAGE_PATH + */educourse.THUMBNAIL_PATH;
    const src = DOWNLOAD_IMAGE_PATH + educourse.FILE_PATH;
    var params = educourse.PAGE_LINK_URL.split("?")[1];
    var contentGubun = '';
    var contentId = '';

    for(var i = 0; i < params.split("&").length; i++) {
        if(params.split("&")[i].split("=")[0] === 'contentGubun') contentGubun = params.split("&")[i].split("=")[1];
        if(params.split("&")[i].split("=")[0] === 'contentId') contentId = params.split("&")[i].split("=")[1];
    }

    var fileIcon = '';
    var type = 'video';
    var isThumbnail = false;
    if(educourse.FILE_TYPE === 'FT201') {
        fileIcon = 'play';
        anchorClassName += ' anchor_pic';
        isThumbnail = true;
    } else if (educourse.FILE_TYPE === 'FT203') {
        fileIcon = 'img';
        anchorClassName += ' anchor_pic'
        type = 'image'
        isThumbnail = true;
    } else {
        fileIcon = educourse.EXT_NM;
        if (fileIcon === '' && educourse.TYPE_1 === '5020001') { // 스마트 자료(iBook)
            fileIcon = 'ebook';
        }
        type = 'document';
    }

    const extClassName = "file_icon icon_" + fileIcon;
    return (
        <li className="intergration_item">
            <a className={anchorClassName} onClick={handleViewer}>
                <div className="intergration_thumb" data-id={contentId}>
                    {type === 'video' &&
                        <span class="icon_video_type3"></span>
                    }
                    {type === 'image' &&
                        <span class="icon_picture"></span>
                    }
                    {isThumbnail &&
                        <img src={thumnailPath}></img>
                    }
                    {!isThumbnail &&
                        <span className={extClassName}><span className="blind">{educourse.EXT_NM}</span></span>
                    }
                </div>
                <div className="intergration_textbox" data-id={contentId}>
                    <p className="intergration_title" dangerouslySetInnerHTML={{__html:educourse.SUBJECT}}></p>
                    <p className="intergration_directory" dangerouslySetInnerHTML={{__html:educourse.PAGE_PATH}}></p>
                </div>
            </a>
        </li>
    )
}

const DetailSearch = ({detailSearchOnOff, educourseCodeList, getEducourseLists, resetDetailSearch, changeCodeLists, changeSorting}) => {
    const schoolLevels = educourseCodeList.map((code) => {
        if(code.type === 'schoolLevel') {
            const id = "school_" + code.value
            return (
                <span className="detail_input" key={id}>
                    <input type="checkbox" id={id} value={code.value} name="detail_check_school" defaultChecked={code.checked} 
                           className="checkbox_circle" onClick={changeCodeLists.bind(this, code.type, code.value)}/>
                    <label className="label_type2" htmlFor={id}>{code.text}</label>
                </span>
            )
        }
    });

    const eduYears = educourseCodeList.map((code) => {
        if(code.type === 'eduYear') {
            const id = "eduYear_" + code.value;
            return (
                <span className="detail_input" key={id}>
                    <input type="checkbox" id={id} value={code.value} name="detail_check_school" defaultChecked={code.checked} 
                           className="checkbox_circle" onClick={changeCodeLists.bind(this, code.type, code.value)}/>
                    <label className="label_type2" htmlFor={id}>{code.text}</label>
                </span>
            )
        }
    });

    const subjectCodes = educourseCodeList.map((code) => {
        if(code.type === 'subjectCode') {
            const id = 'subjectCode_' + code.value;
            return (
                <span className="detail_input" key={id}>
                    <input type="checkbox" id={id} value={code.value} name="detail_check_school" defaultChecked={code.checked} 
                           className="checkbox_circle" onClick={changeCodeLists.bind(this, code.type, code.value)}/>
                    <label className="label_type2" htmlFor={id}>{code.text}</label>
                </span>
            )
        }
    });

    const educourseTypes = educourseCodeList.map((code) => {
        if(code.type === 'educourseType') {
            const id = 'educourseType_' + code.value;
            return (
                <span className="detail_input" key={id}>
                    <input type="checkbox" id={id} value={code.value} name="detail_check_school" defaultChecked={code.checked} 
                           className="checkbox_circle" onClick={changeCodeLists.bind(this, code.type, code.value)}/>
                    <label className="label_type2" htmlFor={id}>{code.text}</label>
                </span>
            )
        }
    });

    const extNames = educourseCodeList.map((code) => {
        if(code.type === 'extName') {
            const id = 'extName_' + code.value;
            return (
                <span className="detail_input" key={id}>
                    <input type="checkbox" id={id} value={code.value} name="detail_check_school" defaultChecked={code.checked} 
                           className="checkbox_circle" onClick={changeCodeLists.bind(this, code.type, code.value)}/>
                    <label className="label_type2" htmlFor={id}>{code.text}</label>
                </span>
            )
        }
    });

    return (
        <div>
            <div className="dim on"></div>
            <div className="detail_search_wrap">
                <div className="detail_search_scroll">
                    <h2 className="detail_search_title">상세검색</h2>
                    <div className="deatil_search_content">
                        <div className="detail_search_row">
                            <h3 className="detail_search_item">학교급</h3>
                            <div className="detail_search_inputwrap col4">
                                {schoolLevels}
                            </div>
                        </div>
                        <div className="detail_search_row">
                            <h3 className="detail_search_item">교육과정</h3>
                            <div className="detail_search_inputwrap col4">
                                {eduYears}
                            </div>
                        </div>
                        <div className="detail_search_row">
                            <h3 className="detail_search_item">교과</h3>
                            <div className="detail_search_inputwrap col4">
                                {subjectCodes}
                            </div>
                        </div>
                        <div className="detail_search_row">
                            <h3 className="detail_search_item">자료유형</h3>
                            <div className="detail_search_inputwrap col2">
                                {educourseTypes}
                            </div>
                        </div>
                        <div className="detail_search_row noline">
                            <h3 className="detail_search_item">파일형식</h3>
                            <div className="detail_search_inputwrap col3">
                                {extNames}
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

const SearchEducourseList = ({searchKeyword, educourseCount, educourseList, educourseCodeList, noResultSearch, noResultKeyword, offset, isSuggest, suggestRelations, suggestQuery, 
    detailSearch, sorting, changeSorting, detailSearchOnOff, clcikMoreBtn, clickSuggestLink, changeKeywordSearch, 
    getEducourseLists, resetDetailSearch, changeCodeLists, isLoading, handleViewer}) => {

    let educourseLists;
    if(educourseList !== undefined) {
        educourseLists = educourseList.map(educourse => {
            return (<Educourse educourse={educourse} handleViewer={handleViewer} key={educourse.CONTENT_ID} />);
        });
    }

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
            </div>
            }
            {detailSearch && 
                <DetailSearch detailSearchOnOff={detailSearchOnOff}
                              educourseCodeList={educourseCodeList}
                              getEducourseLists={getEducourseLists}
                              resetDetailSearch={resetDetailSearch}
                              changeCodeLists={changeCodeLists}
                              changeSorting={changeSorting}
                ></DetailSearch>
            }
            {!noResultSearch &&
            <div>
                <div className="guideline"></div>
                <div className="integration_result">
                    <h2 className="integration_title">교과자료 <span className="integration_count">({educourseCount})</span></h2>
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
                    {isLoading && educourseCount === 0 &&
                        <RenderLoading />
                    }
                    <ul className="integration_list">
                        {educourseLists}
                    </ul>
                    {isLoading && educourseCount > 0 && 
                        <ContentLoading />
                    }
                    {educourseCount > offset &&
                    <a className="intergration_full_button" onClick={clcikMoreBtn}>더보기</a>
                    }
                </div>
            </div>
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

SearchEducourseList.defaultProps = {
    educourseLists: []
}

export default SearchEducourseList;