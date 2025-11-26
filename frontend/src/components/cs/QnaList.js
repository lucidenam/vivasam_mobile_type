import React from 'react';
import { Link } from 'react-router-dom';
import { QnaAnswerStatusBadge } from 'components/cs'; 

const QnA = ({qnaId, title, ansStatusCd, regDttm}) => {
    const linkToPathName = '/cs/qna/' + qnaId;
    return (

        <li className="post_item">
            <Link to={linkToPathName} className="post_link_badge">
                <QnaAnswerStatusBadge status={ansStatusCd} />
                <strong className="post_title post_txt_line">{title}</strong>
                <span className="post_date">{regDttm}</span>
            </Link>
        </li>
    );
}

const QnaList = ({qnas, isLoading}) => {
    if (qnas == null) {
        return (<div></div>);
    }
    else {
        const qnaList = qnas.map(qna => {
            return (<QnA {...qna} key={qna.qnaId}/>);
        });
        return (
            <ul>
                {!isLoading && qnaList.length == 0 && (
                    <li className="empty-state-text">
                        <p style={{textAlign:'center'}}>문의하신 내역이 없습니다.</p>
                    </li>
                )}
                {qnaList}
            </ul>
        );
    }
};

export default QnaList;