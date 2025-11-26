import React, {Component,Fragment} from 'react';
import './Event.css';

class Event extends Component{

    validate = () => {
        return true;
    };

    render () {
        return (
            <div className="event190715">
                <h1><img src="/images/events/2019/event190715/img.jpg" alt="2019년 비상교과서 온라인 만족도 조사"/></h1>
                <div className="blind">
                    <p>비상교과서는 매년 교과서 콘텐츠 및 서비스에 대한 만족도 조사를 진행하고 있습니다. 선생님의 소중한 의견은 더 나은 교과서와 서비스를 만들어나가는 데 큰 도움이 됩니다. 올 해에도 선생님들의 많은 참여를 부탁 드립니다.</p>
                    비바샘 역사 테마관에서 ‘기억해야 할 그날의 그곳’을 만나보세요.
                    <dl>
                        <dt>설문기간</dt>
                        <dd>2019년 7월 15일(월) ~ 8월 31일(토)</dd>
                        <dt>참여대상</dt>
                        <dd>초/중/고등학교 선생님(비바샘 회원)</dd>
                        <dt>경품</dt>
                        <dd>설문 참여 시 – 참가자 전원 / 5,000원권 컬쳐랜드 통합 모바일 상품권  (매주 발송)</dd>
                        <dd>우수설문 작성 시 – 30명 추첨 / 50,000원권 상품권 (9월 4일 발표)</dd>
                    </dl>
                    <ul>
                        <li>100%지급 - 설문에 참여해 주신 모든 선생님께 컬쳐랜드 통합 모바일 상품권 (5,000원권) 증정!</li>
                        <li>30명 추첨 - 꼼꼼한 조언을 주신 선생님 30분께 신세계상품권(50,000원권) 증정!</li>
                    </ul>
                    <p>* 온라인 만족도 조사는 비바샘 PC 웹페이지에서 참여 가능합니다.</p>
                </div>
            </div>
        )
    }
}

export default Event;