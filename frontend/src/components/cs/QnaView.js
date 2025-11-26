import React from 'react';
import {QnaAnswerStatusBadge, QnaViewAnswer} from 'components/cs';
import {SERVER_LOCAL_IMAGE_PATH} from '../../constants';

const QnaView = ({qna}) => {
    return (
        <div className="client_notice_view">
            <div className="clientDtl_sticky">
                <div className="clientDtl_cell">
                    <strong className="clientDtl_sticky_title">[{qna.qnaCdNm}] {qna.title}</strong>
                    <span className="post_date">{qna.regDttm}</span>
                </div>
                <div className="clientDtl_cell">
                    <QnaAnswerStatusBadge status={qna.ansStatusCd} isView='true' />
                </div>
            </div>
            <div className="clientDtl_cont">
                <p>{qna.contents}</p>
                {
                    qna.qnaUploadFile != null ?
                    <div className="clientDtl_file">
                        <a target="_blank" href={SERVER_LOCAL_IMAGE_PATH + 'customer/qna/' + qna.qnaUploadFile}>
                            ※ 첨부파일: {qna.qnaUploadFile}</a>
                    </div>
                    : null
                }
            </div>
            <div className="guideline"></div>
            <QnaViewAnswer {...qna} />
        </div>
    );
}

export default QnaView;
