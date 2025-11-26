import React, {Component} from 'react';

class Event extends Component{
    render () {
        return (
            <section className="event230925">
                <h1><img src="/images/events/2023/event230925/img.png" alt="2023 비상교과서 온라인 만족도 조사" style={{width: '100%'}}/></h1>
                <div className="blind">
                    <p>
                        비상교과서는 매년 <strong>교과서 콘텐츠 및 서비스에 대한 만족도 조사</strong>를 진행하고 있습니다.<br />
						선생님의 소중한 의견은 더 나은 교과서와 서비스를 만들어나가는 데 큰 도움이 됩니다.<br />
						올해에도 선생님들의 많은 참여를 부탁 드립니다.
					</p>
					<ul>
						<li>설문기간: 2023.09.25(월) ~ 10.22(일)</li>
						<li>참여대상: 초/중/고등학교 선생님(비바샘 회원)</li>
						<li>경품: 
                            <ul>
                                <li>참여자 전원 - 설문에 참여하여 완료해주신 <strong>모든 선생님</strong>께 <strong>컬쳐랜드 통합 모바일 상품권(5,000원권) 증정!</strong></li>
                                <li>설문 우수자 30명 - 꼼꼼한 조언을 주신 선생님 <strong>30분</strong>께 <strong>신세계상품권(50,000원권) 증정!</strong> (10월 31일 발표)</li>
                            </ul>
                        </li>
					</ul>
					<p>* 온라인 만족도 조사는 비바샘 PC 웹페이지에서 참여 가능합니다.</p>
				</div>
            </section>
        )
    }
}

export default Event;