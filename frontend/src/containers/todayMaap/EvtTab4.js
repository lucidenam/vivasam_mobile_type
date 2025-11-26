import React, { Component } from 'react';

class EvtTab4 extends Component {
    render() {
        return (
            <div className="tabCont04">
                <ul className="infoList">
                    <li><strong>소프트웨어 영역과 진로 탐색 영역</strong>으로 구성되어 있어요.</li>
                    <li><strong>프로그래밍을 다양한 과목과 연계하여</strong> 활동할 수 있어요.</li>
                    <li><strong>재능 카드 놀이와 재능 탐색 활동지</strong>로 진로를 설계해요.</li>
                </ul>
                <div className="gradeWrap">
                    <div className="gradeItem">
                        <span className="gradeTit">호기심 실과 수업 5~6학년</span>
                        <div className="gradeCont">
                            <img src="/images/contents/today/maap/img_tab04_textbook01.png" alt="" />
                            <div className="btnWrap">
                                <button type="button" className="btnEbook" onClick={ () => this.props.onBook(8) }>E book보기</button>
                                <button type="button" className="btnDown" onClick={ () => this.props.onDown(8) }>다운로드</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EvtTab4;