import React, {Fragment} from 'react';

const QnaAnswerStatusBadge = ({status, isView}) => {
    const addClassName = isView ? ' clientDtl_sticky_state' : '';
    return (
        <Fragment>
            {status === 'Y' || status === '답변 완료' ?
                (<span className={"ans_state stateColorA" + (addClassName)}><em className="state_v_center">답변<br/>완료</em></span>)
                : (
                    status === 'P' || status === '답변 준비중' ?
                    (<span className={"ans_state stateColorB" + (addClassName)}><em className="state_v_center">답변<br/>준비중</em></span>)
                    : (<span className={"ans_state stateColorB" + (addClassName)}><em className="state_v_center">접수</em></span>)
                )
            }
        </Fragment>
    );
};

export default QnaAnswerStatusBadge;