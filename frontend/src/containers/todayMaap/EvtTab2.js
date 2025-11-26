import React, { Component } from 'react';

class EvtTab2 extends Component {
    render() {
        return (
            <div className="tabCont02">
                <ul className="infoList">
                    <li><strong>융합 수업에 적합한 활동지</strong>로 구성되어 있어요.</li>
                    <li>아이들이 쉽게 따라 할 수 있는 <strong>흥미로운 미술 활동</strong>을 소개해요.</li>
                    <li><strong>미술과 퀴즈, 게임 등을 연계</strong>하여 다채로운 수업이 가능해요.</li>
                </ul>
                <div className="gradeWrap">
                    <div className="gradeItem">
                        <span className="gradeTit">재미있는 미술 수업 3학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab02_textbook01.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(2) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(2) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                    <div className="gradeItem">
                        <span className="gradeTit">재미있는 미술 수업 4학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab02_textbook02.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(3) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(3) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                    <div className="gradeItem">
                        <span className="gradeTit">재미있는 미술 수업 5학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab02_textbook03.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(4) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(4) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                    <div className="gradeItem">
                        <span className="gradeTit">재미있는 미술 수업 6학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab02_textbook04.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(5) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(5) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EvtTab2;