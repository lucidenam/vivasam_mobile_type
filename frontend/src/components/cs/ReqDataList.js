import React from 'react';
import { Link } from 'react-router-dom';
import { QnaAnswerStatusBadge } from 'components/cs'; 

const ReqData = ({reqDataId, reqDataTitle, reqDataNm, reqDataSchLvlNm, reqDataSubjectNm, regDt, updateNm}) => {
    const linkToPathName = '/cs/qna/' + reqDataId + '?REQ_DATA';
    return (

        <li className="post_item">
            <Link to={linkToPathName} className="post_link_badge">
                <QnaAnswerStatusBadge status={updateNm} />
                <strong className="post_title post_txt_line">{reqDataTitle}</strong>
                <span className="post_date">{regDt}</span>
            </Link>
        </li>
    );
}

const ReqDataList = ({reqDatas}) => {
    const reqDataList = reqDatas.map(req => {
        return (<ReqData {...req} key={req.reqDataId}/>);
    });
    return (
        <ul>
            {reqDataList.length == 0 && (
                <li className="empty-state-text">
                    <p style={{textAlign:'center'}}>문의하신 내역이 없습니다.</p>
                </li>
            )}
            {reqDataList}
        </ul>
    );
};

export default ReqDataList;