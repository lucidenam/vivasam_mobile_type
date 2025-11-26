import React, { Component } from 'react';

class TabCont3 extends Component {
    render() {
        return (
            <div className="evtTab3">
                <h2 className="imgWrap"><img src="/images/events/2020/event201207/evt03.png" alt="고등 기본 수학 수업 지원 자료" /></h2>
                <div className="blind">자료 유형, 자료명, 자료 형식 관련 테이블</div>
                <div className="inner">
                    <ul className="linkList">
                        <li><img src="/images/events/2020/event201207/list_link01.png" alt="국내 최대 규모 문제 출제 시스템 문제은행" /></li>
                        <li><img src="/images/events/2020/event201207/list_link02.png" alt="수능 전문가가 만든 신뢰도 높은 비상 모의고사" /></li>
                        <li><img src="/images/events/2020/event201207/list_link03.png" alt="재학생 인터뷰로 만나는 전국 대학 학과 정보" /></li>
                        <li><img src="/images/events/2020/event201207/list_link04.png" alt="직접 제작한 200여 개 유형별 직업정보" /></li>
                    </ul>
                    <span>※ 문제은행, 비상 모의고사, 학과 정보, 직업 정보는<br />PC 웹 페이지에서 확인해 주세요.</span>
                </div>
            </div>
        );
    }
}

export default TabCont3;