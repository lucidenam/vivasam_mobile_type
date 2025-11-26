import React from 'react';
import { Link } from 'react-router-dom';

const Notice = ({fixYn, noticeId, noticeNm, regDttm, schLvlNm, title, isNew, openDttm}) => {
    const linkToPathName = '/cs/notice/' + noticeId;
    function gtag(){
        window.dataLayer.push(arguments);
    }
    return (
        <li className="post_item">
            <Link to={linkToPathName} 
                onClick={()=>{
                    gtag('event', '공지사항', {
                        'parameter': '메인'
                    });
                }}
                className="post_link">
                <strong className={"post_title " + (fixYn === 'Y' ? ' post_color' : '')}>
                {/* fixYn : post_color , isNew : post_new */}
                    {/*<span className="blind" style={{display: isNew === 'Y' ? 'block' : 'none'}}>최신글</span>*/}
                    [{schLvlNm === '초등학교' ? '초등' : (schLvlNm === '중학교' || schLvlNm === '고등학교') ? '중/고등' : '공통'}] {title}
                </strong>
                <span className="post_date">{openDttm}</span>
            </Link>
        </li>
    );
}


const NoticeList = ({notices}) => {
    
    const noticeList = notices.map(notice => {
        return (<Notice {...notice} key={notice.noticeId}/>);
    });

    return (
        <ul>
            {noticeList}
        </ul>
    );
};

export default NoticeList;