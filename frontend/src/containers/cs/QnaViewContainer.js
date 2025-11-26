import React, { Component, Fragment } from 'react';
import { QnaAnswerStatusBadge, QnaViewAnswer } from 'components/cs';
import * as api from 'lib/api';
import { QnaView, ReqDataView } from '../../components/cs';

class QnaViewContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            qnaId : props.id,
            srchFilter : props.type ? props.type.replace('?', '') : 'SITE_QNA',
            qna : {}
        };
    }

    getQna = async (qnaId, srchFilter) => {
        try {
            const response = await api.qnaView(qnaId, srchFilter);
            const result = response.data;
            this.setState({
                qna: result
            });
            
            /*
             * ISMS 매개변수 조작 조치
             * 2021-02-18 김인수
             * */
            if(!result) {
            	alert("비정상적인 접속입니다.");
            	document.location.href="/cs/qna";
            	throw new Error("비정상적인 접속입니다.");
            } 
            
        } catch(e) {
            console.log(e);
        } 
    }

    componentDidMount() {
        this.getQna(this.state.qnaId, this.state.srchFilter);
    }
    
    render() {
        const {srchFilter, qna} = this.state;

        let myQnaViewTemplate;;
        switch(srchFilter) {
            case 'REQ_DATA' : 
                myQnaViewTemplate = <ReqDataView req={qna}></ReqDataView>;
                break;
            case 'QBANK_ERROR' : 
                //TODO 문제은행 항목 오류
                myQnaViewTemplate = <QnaView qna={qna}></QnaView>;
                break;
            default :
        		myQnaViewTemplate = <QnaView qna={qna}></QnaView>;
                break;
        }

        return (
            <div className="clientNotiDtl_view">
                {myQnaViewTemplate}
            </div>
        );
    }
}

export default QnaViewContainer;