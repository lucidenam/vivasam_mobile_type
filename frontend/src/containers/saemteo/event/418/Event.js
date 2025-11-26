import React, {Component,Fragment} from 'react';

class Event extends Component{

    render () {
        return (
            <div className="event220921">
                <h1><img src="/images/events/2022/event220921/img.jpg" alt="2022년 비상교과서 온라인 만족도 조사" style={{width: '100%'}}/></h1>
                <div className="blind">
					<p>
						비상교과서는 매년 <strong>교과서 콘텐츠 및 서비스</strong>에 대한 만족도 조사를 진행하고 있습니다.<br />
						선생님의 소중한 의견은 더 나은 교과서와 서비스를 만들어나가는 데 큰 도움이 됩니다.<br />
						올해에도 선생님들의 많은 참여를 부탁 드립니다.
					</p>
					<ul>
						<li>설문기간: 2022.09.21(수) ~ 10.16(일)</li>
						<li>참여대상: 초/중/고등학교 선생님(비바샘 회원)</li>
						<li>경품: 100%지급 - 설문에 참여해 주신 모든 선생님께 컬쳐랜드 통합 모바일 상품권 (5,000원권) 증정!, 30명 추첨 - 꼼꼼한 조언을 주신 선생님 30분께 신세계상품권(50,000원권) 증정!(10월 21일 발표)</li>
					</ul>
					<p>* 온라인 만족도 조사는 비바샘 PC 웹페이지에서 참여 가능합니다.</p>
				</div>
            </div>
        )
    }
}

export default Event;