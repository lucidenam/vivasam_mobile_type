import React from 'react';
import { QnaAnswerStatusBadge, QnaViewAnswer } from 'components/cs';

const ReqDataView = ({req}) => {
    return (
        <div className="client_notice_view">
            <div className="clientDtl_sticky">
                <div className="clientDtl_cell">
                    <strong className="clientDtl_sticky_title">[{req.reqDataNm}] {req.reqDataTitle}</strong>
                    <span className="post_date">{req.regDt}</span>
                </div>
                <div className="clientDtl_cell">
                    <QnaAnswerStatusBadge status={req.ansStatusCd} isView='true' />
                </div>
            </div>
            <div className="clientDtl_cont">
                <p dangerouslySetInnerHTML={{__html: req.reqDataContents}}></p>
            </div>
            <div className="guideline"></div>
            <QnaViewAnswer {...req} />
        </div>
    );
}

export default ReqDataView;
