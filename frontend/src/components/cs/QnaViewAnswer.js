import React, {Fragment} from 'react';
import {SERVER_LOCAL_IMAGE_PATH} from "../../constants";

const QnaAnswer = ({ansDttm, answer, answerUploadFile}) => {
    {/* <!-- 관리자 답변이 있을 경우 --> */}
    return (
        <div className="clientDtl_answer">
            <div className="clientDtl_answer_top">
                <span className="badge_round_blue">답변</span>
                <span className="clientDtl_answer_name">관리자</span>
                <span className="post_date">{ansDttm}</span>
            </div>
            <div className="mt20">
                <p dangerouslySetInnerHTML={{__html: answer}}></p>
            </div>
            <div className="clientDtl_file">
                {
                    answerUploadFile != null ?
                        <div className="clientDtl_file">
                            <a target="_blank" href={SERVER_LOCAL_IMAGE_PATH + 'customer/qna/' + answerUploadFile}>
                                ※ 첨부파일: {answerUploadFile}</a>
                        </div>
                        : null
                }
            </div>
        </div>
    );
}

const QnaReadyAnswer = () => {
    {/* <!-- 관리자 답변이 준비중일 경우 --> */}
    return (
        <div className="clientDtl_answer">
            <p className="clientDtl_answer_none">문의하신 내용에 대한 답변을 준비 중입니다.</p>
        </div>
    );
}

const QnaNoAnswer = () => {
    {/* <!-- 관리자 답변이 없을 경우 --> */}
    return (
        <div className="clientDtl_answer">
            <p className="clientDtl_answer_none">선생님의 문의가 등록되었습니다.<br/>
                문의에 대한 답변은 나의 교실 또는 선생님 이메일을 통해<br/>
                확인하실 수 있습니다.</p>
        </div>
    );
}

const QnaViewAnswer = ({ansStatusCd, ansDttm, answer, answerUploadFile}) => {
    const ans = ansStatusCd === 'Y' ? <QnaAnswer ansDttm={ansDttm} answer={answer} answerUploadFile={answerUploadFile} /> : (ansStatusCd === 'P' ? <QnaReadyAnswer /> : <QnaNoAnswer />);
    return (
        <Fragment>{ans}</Fragment>
    );
};

export default QnaViewAnswer;