import React, {Component} from 'react';
import './Event.css';
import * as common from "../../../../lib/common";

class Event extends Component{
    state ={
        eventUrl: 'https://mv.vivasam.com/#/saemteo/event/view/474',
        visible: true,
    }

    copyToClipboard = (e) => {
        // 글을 쓸 수 있는 란을 만든다.
        let aux = document.createElement("input");
        // 지정된 요소의 값을 할당 한다.
        aux.setAttribute("value", this.state.eventUrl);
        // bdy에 추가한다.
        document.body.appendChild(aux);
        // 지정된 내용을 강조한다.
        aux.select();
        // 텍스트를 카피 하는 변수를 생성
        document.execCommand("copy");
        // body 로 부터 다시 반환 한다.
        document.body.removeChild(aux);
        common.info('링크가 복사되었습니다.\n동료 선생님과 함께 이벤트에 참여해 보세요.');
    };
    /* 플로팅 배너 */
    handleClosePop = (e) =>{
        this.setState({
            visible: false,
        });
    };
    render () {
        return (
            <section className="event231025">
                <button type="button" className="btnShare" onClick={this.copyToClipboard}>
                    <span className="blind">이벤트 공유하기</span>
                </button>
                <h1><img src="/images/events/2023/event231025/img.png" alt="2023 비상교과서 온라인 만족도 조사" style={{width: '100%'}}/></h1>
                <div className="blind">
                    <p>
                        저마다의 이야기와 개성이 녹아있는 학생들의 작품,
                        마냥 묻어두기엔 우리 친구들의 재능이 아깝지 않나요?
                        미술 수업에서 꽃피운 학생들의 창의력을 비바샘 미술관에 자랑해 보세요!
                    </p>
                    <p>
                        작품의 겉모습과 상관없이 모든 아이들의 상상력은 특별해요.
                        모두가 예술가로 존중 받는 공간,
                        비바샘 미술관에 아이들의 창작물을 전시해 주세요!
                    </p>
                    <ul>
                        <li>이벤트 기간 : 2023.10.25(수) ~ 11.17(금)</li>
                        <li>당첨자 발표:2023.12.15(금) * 공지사항으로 안내</li>
                    </ul>
                    <p><strong>참여만 해도 100% 경품 지급! 작품과 개인정보 활용 동의서 최종 제출을 완료하신 모든 분들께 경품을 드립니다.</strong></p>
                    <ul>
                        <li>1등(5명) : 신세계 상품권 25만원</li>
                        <li>2등(15명) : 신세계 상품권 15만원</li>
                        <li>3등(80명) : 네이버페이 5만원권</li>
                        <li>참가상 : 스타벅스 부드러운 디저트 세트</li>
                        <li>학생 전원 : 교보문고 3만원권</li>
                    </ul>
                    <p>본 이벤트는 PC 이벤트 페이지에서 참여 가능합니다.</p>
                    <p>자세한 이벤트 참여 방법은 PC 이벤트 페이지에서 확인해주세요!</p>
				</div>
                <div className="evtBanner_wrap" id="evtBanner"
                     style={{display: this.state.visible ? 'block' : 'none'}}
                >
                    <div className="evtBanner">
                        <img src="/images/events/2023/event231025/evtBanner.png" alt="비바샘 미술관 조기종료 배너"/>
                        <button className="banner_close" onClick={this.handleClosePop}>닫기</button>
                        <div className="blind">
                            <span>비바샘 미술관 이벤트</span>
                            <h1>조기 종료 예고</h1>
                            <p>함께 만들어요, 비바샘 미술관 이벤트가 목표 초과 달성으로 11/10(금) 자정에 조기 종료될 예정입니다.</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Event;