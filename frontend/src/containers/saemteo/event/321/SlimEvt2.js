import React, { Component } from 'react';
import $ from "jquery";

class SlimEvt2 extends Component {
    state = {
        contents: [
            {'idx': 0, 'title': '176쪽의 슬림한 본문', 'isSelect': false},
            {'idx': 1, 'title': '중학교 수학 개념 연계', 'isSelect': false},
            {'idx': 2, 'title': '<왜 배울까> 대단원 도입', 'isSelect': false},
            {'idx': 3, 'title': '풀이 보충 설명', 'isSelect': false},
            {'idx': 4, 'title': '<수학! 재미를 더하다> 활동지', 'isSelect': false},
            {'idx': 5, 'title': '<개념열기> 도입', 'isSelect': false},
            {'idx': 6, 'title': '<꿈! 수학을 만나다> 진로 정보', 'isSelect': false},
            {'idx': 7, 'title': '<스스로 확인하기> 문제', 'isSelect': false},
            {'idx': 8, 'title': '<수학플러스> 실생활 문제', 'isSelect': false},
            {'idx': 9, 'title': '<중단원 학습 점검> 정리', 'isSelect': false},
        ]
    }

    onChange = (e) => {
        let target = e.target;
        let val = target.value;
        let contents = this.state.contents;

        if(target.checked){
            let selContentCnt = 0;
            contents.map( (item, idx) => {
                if(item.isSelect){
                    selContentCnt++;
                }
            });
            if(selContentCnt < 2){
                contents[val].isSelect = true;
            }
            this.setState({contents: contents});
        }else{
            let newData = contents.map( (item, idx) => {
                if(item.idx == val){
                    return {
                        ...item,
                        isSelect: false
                    }
                } else {
                    return item;
                }
            });
            this.setState({contents: newData});
        }
    }

    render() {
        const { eventApply } = this.props;
        return (
            <div className="slimEvt2">
                <h2><img src="/images/events/2020/event201207/slim_evt02.png" alt="고등 수학 선생님이 선택한 슬림한 매력" /></h2>
                <div className="blind">
                    <span>이벤트 기간: 2020.12.07 ~ 12.31, 당첨자 발표: 2021.01.07</span>
                    <p>선생님이 생각하는 비상교육 ‘슬림한’ 기본 수학의 장점 두 가지를 선택해 주세요. 참여해주신 분들께 풍성한 선물을 보내드립니다.</p>
                    <ul>
                        <li>무선 슬림 키보드 & 마우스 3명</li>
                        <li>슬림 터치 펜 10명</li>
                        <li>슬림 유산균 30명</li>
                        <li>GS25 코카콜라 제로 참여자 전원</li>
                    </ul>
                </div>
                <div className="inner">
                    <div className="slimEvtTxt">
                        <p><em>‘슬림한’ 기본 수학의 장점 2가지</em>를<br />선택해주세요.</p>
                        <a href="https://dn.vivasam.com/VS/EBOOK/고등기본수학MW/index.html" target="_blank" title="새창열림"><img src="/images/events/2020/event201207/btn_hint02.png" alt="교과서 보기" /></a>
                    </div>
                    <div className="borderBox evtWordWrap">
                        <span className="word"><input type="checkbox" name="chk" id="chk01" value="0" checked={this.state.contents[0].isSelect} onChange={this.onChange}/><label htmlFor="chk01">176쪽의 <em>슬림한 본문</em></label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk02" value="1" checked={this.state.contents[1].isSelect} onChange={this.onChange}/><label htmlFor="chk02"><em>중학교 수학</em> 개념 연계</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk03" value="2" checked={this.state.contents[2].isSelect} onChange={this.onChange}/><label htmlFor="chk03"><em>&lt;왜 배울까?&gt;</em> 대단원 도입</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk04" value="3" checked={this.state.contents[3].isSelect} onChange={this.onChange}/><label htmlFor="chk04"><em>풀이 보충 설명</em></label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk05" value="4" checked={this.state.contents[4].isSelect} onChange={this.onChange}/><label htmlFor="chk05"><em>&lt;수학! 재미를 더하다&gt;</em> 활동지</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk06" value="5" checked={this.state.contents[5].isSelect} onChange={this.onChange}/><label htmlFor="chk06"><em>&lt;개념열기&gt;</em> 도입</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk07" value="6" checked={this.state.contents[6].isSelect} onChange={this.onChange}/><label htmlFor="chk07"><em>&lt;꿈! 수학을 만나다&gt;</em> 진로 정보</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk08" value="7" checked={this.state.contents[7].isSelect} onChange={this.onChange}/><label htmlFor="chk08"><em>&lt;스스로 확인하기&gt;</em> 문제</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk09" value="8" checked={this.state.contents[8].isSelect} onChange={this.onChange}/><label htmlFor="chk09"><em>&lt;수학플러스&gt;</em> 실생활 문제</label></span>
                        <span className="word"><input type="checkbox" name="chk" id="chk10" value="9" checked={this.state.contents[9].isSelect} onChange={this.onChange}/><label htmlFor="chk10"><em>&lt;중단원 학습 점검&gt;</em> 정리</label></span>
                    </div>
                    <button type="button" className="btnApply" onClick={eventApply.bind(this, this.state.contents)}><img src="/images/events/2020/event201207/btn_apply.png" alt="참여 완료" /></button>
                </div>
            </div>
        );
    }
}

export default SlimEvt2;