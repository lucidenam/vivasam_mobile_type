import React from 'react';
import { Link } from 'react-router-dom';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

const Suggest = ({suggest, index, clickSuggestLink}) => {
    if(index !== 0) {
        return (
            <a onClick={clickSuggestLink.bind(this, suggest)}><span className="comma">, </span>{suggest}</a>
        )
    } else {
        return (
            <a onClick={clickSuggestLink.bind(this, suggest)}>{suggest}</a>
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
        anchorClassName += ' anchor_pic'
        isThumbnail = true;
    } else if (educourse.FILE_TYPE === 'FT203') {
        fileIcon = 'img';
        anchorClassName += ' anchor_pic'
        type = 'image';
        isThumbnail = true;
    } else {
        fileIcon = educourse.EXT_NM;
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

const Library = ({library, handleViewer}) => {
    //thumbnail : 'https://dn.vivasam.com' + library.THUMBNAIL_PATH,
    //src : DOWNLOAD_IMAGE_PATH + library.FILE_PATH + library.SAVE_FILE_NAME,
    //type : type,
    //subject : library.SUBJECT,
    //contentId : contentId,
    //summary : library.SUMMARY,
    //sourcename: library.PAGE_PATH,
    //filePath : library.FILE_PATH,
    //filename : library.SAVE_FILE_NAME,
    //className : "library_item item_video",
    //key: contentId
    const imagePath = DOWNLOAD_IMAGE_PATH + library.THUMBNAIL_PATH;
    const src = DOWNLOAD_IMAGE_PATH + library.FILE_PATH + library.SAVE_FILE_NAME;
    var params = library.PAGE_LINK_URL.split("?")[1];
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
            <a className="library_thumb" onClick={handleViewer} data-id={contentId}>
                <img src={imagePath} alt={library.SUBJECT} className="thumb_img"/></a>
            <p className="library_title" dangerouslySetInnerHTML={{__html:library.SUBJECT}}></p>
        </div>
    )
}

const Cs = ({TITLE, PAGE_LINK_URL, PAGE_PATH, REG_DTTM}) => {
    const linkToPathName = '/cs/notice/' + PAGE_LINK_URL.split("noticeId=")[1];
    return (
        <li className="intergration_item">
            <Link to={linkToPathName} className="intergration_anchor">
                <div className="intergration_thumb">
                    <span className="integration_icon integration_icon_pdf"></span>
                </div>
                <div className="intergration_textbox">
                    <p className="intergration_title" dangerouslySetInnerHTML={{__html:TITLE}}></p>
                    <p className="intergration_directory" dangerouslySetInnerHTML={{__html:PAGE_PATH}}></p>
                </div>
            </Link>
        </li>
    )
}

const SearchTotalList = ({educourseCount, educourseList, libraryCount, libraryList, csCount, csList, isSuggest, suggestRelations, suggestQuery, noResultSearch, noResultKeyword,
    changeSearchType, changeKeywordSearch, handleViewer, clickSuggestLink, isLoading}) => {

    let educourseLists;
    if(educourseList !== undefined) {
        educourseLists = educourseList.map(educourse => {
            return (<Educourse educourse={educourse} key={educourse.CONTENT_ID} handleViewer={handleViewer} />);
        });
    }

    let libraryLists;
    if(libraryList !== undefined) {
        libraryLists = libraryList.map((library, index) => {
            return (<Library library={library} handleViewer={handleViewer} key={index}/>);
        });
    }

    let csLists;
    if(csList !== undefined) {
        csLists = csList.map(cs => {
            return (<Cs {...cs} key={cs.TITLE}/>)
        });
    }

    const suggestRelationList = suggestRelations.map((suggest, index) => {
        return (<Suggest suggest={suggest} index={index} clickSuggestLink={clickSuggestLink} key={index} />)
    });

    let isSuggestQuery = false;
    if(suggestQuery !== undefined && suggestQuery.length > 0) isSuggestQuery = true;

    return (
        <div className="integration">
            <div className="guideline"></div>
            {isSuggest &&
            <div>
                <div className="relate_wrap">
                    <div className="relate_title">연관</div>
                    <div className="relate_keyword">
                        {suggestRelationList}
                    </div>
                </div>
                <div className="guideline"></div>
            </div>
            }
            {isLoading && 
                <RenderLoading />
            }
            {educourseCount > 0 &&
            <div className="integration_result">
                <h2 className="integration_title">교과자료 <span className="integration_count">({educourseCount})</span></h2>
                <ul className="integration_list">
                    {educourseLists}
                </ul>
                <a className="integration_more" onClick={changeSearchType.bind(this, 'educourse')}>더보기 <span className="integration_icon integration_icon_more"></span></a>
            </div>
            }
            {libraryCount > 0 &&
            <div className="integration_result">
                <h2 className="integration_title">라이브러리 <span className="integration_count">({libraryCount})</span></h2>
                <div className="library_list">
                    {libraryLists}
                </div>
                <a className="integration_more" onClick={changeSearchType.bind(this, 'library')}>더보기 <span className="integration_icon integration_icon_more"></span></a>
            </div>
            }
            {csCount > 0 &&
            <div className="integration_result cs">
                <h2 className="integration_title">고객센터 <span className="integration_count">({csCount})</span></h2>
                <ul className="integration_list">
                    {csLists}
                </ul>
                <a className="integration_more" onClick={changeSearchType.bind(this, 'cs')}>더보기 <span className="integration_icon integration_icon_more"></span></a>
            </div>
            }
            {noResultSearch && 
            <div>
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

export default SearchTotalList;