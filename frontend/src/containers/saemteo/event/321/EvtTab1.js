import React, { Component } from 'react';

class EvtTab1 extends Component {
    render() {
        return (
            <div className="evtTab1">
                <h2 className="imgWrap"><img src="/images/events/2020/event201207/evt01.png" alt="왜 슬림한 교과서인가요?" /></h2>
                <div className="blind">
                    <ul>
                        <li>
                            <strong>진도 및 학습 부담 최소화</strong>
                            <p>본문 176쪽으로 수학 공부 끝! (정답 및 해설 포함 216쪽)</p>
                        </li>
                        <li>
                            <strong>꼭 필요한 필수 개념 중심</strong>
                            <p>어려운 개념은 과감히 삭제하고 필수 개념과 문항만 엄선!</p>
                        </li>
                        <li>
                            <strong>중학교 수학 연계 학습</strong>
                            <p>중학교에서 배운 내용을 다시 짚어보고 새로운 개념 연계 학습!</p>
                        </li>
                    </ul>
                    <strong>기본 수학 교과서 집필진</strong>
                    <ul>
                        <li>
                            <div>
                                <strong>김원경(대표저자)</strong>
                                <p>한국교원대학교 명예교수</p>
                                <p>2015, 2009 개정 교육과정<br />중·고등학교 수학 교과서 대표저자</p>
                                <p>2007 개정 교육과정<br />중학교 수학 교과서 대표저자</p>
                            </div>
                        </li>
                        <li>
                            <div>
                                <strong>김인규</strong>
                                <p>우송정보대학<br />컴퓨터정보과 교수</p>
                            </div>
                        </li>
                        <li>
                            <div>
                                <strong>김윤회</strong>
                                <p>비상교육 교과서2 본부장</p>
                                <p>2015, 2009 개정 교육과정<br />중·고등학교 수학 교과서 개발 책임</p>
                                <p>2015, 2007 개정 교육과정<br />중학교 수학 교과서 집필</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default EvtTab1;