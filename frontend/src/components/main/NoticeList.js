import React from 'react';
import { Link } from 'react-router-dom';
import * as common from 'lib/common'

const Notice = ({fixYn, noticeId, noticeNm, title, openDttm, schLvlNm}) => {
    const linkToPathName = '/cs/notice/' + noticeId;
    function gtag(){
        window.dataLayer.push(arguments);
    }
    return (
        <li className={"notice_item" + (fixYn === 'Y' ? ' notice_marker' : '')}>
            <span className="notice_lable">{schLvlNm === '초등학교' ? '초등' : (schLvlNm === '중학교' || schLvlNm === '고등학교') ? '중/고등' : '공통'}</span>
            <Link to={linkToPathName}
                  onClick={() => {
                      gtag('event', '2025 개편', {
                          'parameter': '메인',
                          'parameter_value': '공지사항_' + title,
                          'parameter_url': window.location.origin + "/#" + linkToPathName
                      });
                  }}
                className="notice_cont">{title}</Link>
            <span className="notice_date" >{openDttm}</span>
        </li>
    );
}


const NoticeList = ({notices}) => {
    if(!notices) return null;
    //공지사항 리스트
    const noticeList = notices.map(notice => {
        return (<Notice {...notice} key={notice.noticeId}/>);
    });

    return (
            <ul className="notice_list">
                {noticeList}
            </ul>
    );
};

export default NoticeList;