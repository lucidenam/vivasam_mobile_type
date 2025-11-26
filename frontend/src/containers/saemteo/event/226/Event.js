import React, {Component,Fragment} from 'react';
import './Event.css';

class Event extends Component{

    validate = () => {
        return true;
    };


    applyClick = (e) => {
        const { eventId, handleClick } = this.props;
        //입력값 검증
        if(this.validate){
            console.log('성공')
        }else{
            console.log('실패');
            return;
        }
        //이벤트 신청하기
        handleClick(eventId);
    };

    render () {
        const { handleClick } = this.props;

        return (
            <div className="evt_180827">
                <div className="evt_sect" id="evt_sect">
                    <img src="https://www.vivasam.com/images/event/event180827/evt01.jpg" alt="비바샘 VR 지질 답사 이벤트 교과서 속 지질 명소 찾기" />
                    <img src="https://www.vivasam.com/images/event/event180827/evt02.jpg" alt="VR 지질 답사 테마관의 제주, 고성 각 지역을 체험해보고 수업에 가장 활용하고 싶은 지질 명소를 선택해주세요. 학급 전체에 VR 고글을 보내드립니다. 참여 기간 -2018년 8월 27일 (월) ~ 9월 30일 (일) 당첨 발표 -10월 4일 (목) / 비바샘 공지사항" />
                    <div className="entry_form">
                        <img src="https://www.vivasam.com/images/event/event180827/evt03.jpg" alt="Q. 수업에 가장 활용하고 싶은 VR 지질 명소는?" />
                        <form method="post">
                            <div className="form">
                            <fieldset>
                                <legend className="blind">지질명소와 학급인원 기재 양식</legend>
                                <p className="jeju">
                                    <label className="select-btn jeju1">
                                      <input type="radio" name="attraction" defaultValue="수월봉" />
                                      <i className="lab">수월봉</i>
                                    </label>
                                    <label className="select-btn jeju2">
                                      <input type="radio" name="attraction" defaultValue="수월봉-검은 모래 해변" />
                                      <i className="lab">수월봉-검은 모래 해변</i>
                                    </label>
                                    <label className="select-btn jeju3">
                                      <input type="radio" name="attraction" defaultValue="산방산&용머리해안" />
                                      <i className="lab">산방산&amp;용머리해안</i>
                                    </label>
                                    <label className="select-btn jeju4">
                                      <input type="radio" name="attraction" defaultValue="갯깍주상절리대" />
                                      <i className="lab">갯깍주상절리대</i>
                                    </label>
                                    <label className="select-btn jeju5">
                                      <input type="radio" name="attraction" defaultValue="서귀포패류화석산지" />
                                      <i className="lab">서귀포패류화석산지</i>
                                    </label>
                                    <label className="select-btn jeju6">
                                      <input type="radio" name="attraction" defaultValue="만장굴" />
                                      <i className="lab">만장굴</i>
                                    </label>
                                </p>
                                <p className="goseong">
                                    <label className="select-btn goseong1">
                                      <input type="radio" name="attraction" defaultValue="고성 공룡 박물관" />
                                      <i className="lab">고성 공룡 박물관</i>
                                    </label>
                                    <label className="select-btn goseong2">
                                      <input type="radio" name="attraction" defaultValue="공룡 발자국 화석 산지" />
                                      <i className="lab">공룡 발자국 화석 산지</i>
                                    </label>
                                    <label className="select-btn goseong3">
                                      <input type="radio" name="attraction" defaultValue="상족암" />
                                      <i className="lab">상족암</i>
                                    </label>
                                </p>
                                <label className="msg">
                                    <textarea name="textarea" id="reason" cols={68} rows={5} placeholder="수업에 활용하고 싶은 이유를 작성해주세요." />
                                    <p className="count">(<span id="reasonCount">0</span>/200)</p>
                                </label>
                                <label className="qty">
                                {/* <input id="peopleCnt" onkeydown='return onlyNumber(event)' onkeyup='removeChar(event)' type="type" maxlength="2"> */}
                                    <input id="peopleCnt" type="text" className="maxmin" min={0} max={100} intonly="true" placeholder="예) 50" />
                                </label>
                            </fieldset>
                            </div>
                            {/* //.form */}
                            <button
                                id="eApply"
                                type="button"
                                onClick={this.applyClick}
                                className="btn">
                                <img src="https://www.vivasam.com/images/event/event180827/btn_event.png" alt="응모하기" />
                            </button>
                        </form>
                        <div className="after">
                          이벤트에 응모해 주셔서 감사합니다.
                        </div>
                    </div>
                </div>
                <div>
                  <img src="https://www.vivasam.com/images/event/event180827/evt05.jpg" alt="신청시 유의사항" useMap="#semMap2" />
                  <img src="https://www.vivasam.com/images/event/event180827/evt06.jpg" alt="신청시 유의사항" useMap="#semMap3" />
                  <ol className="blind">
                    <li>이벤트는 1인 1회 참여 가능합니다.</li>
                    <li>이벤트 선물은 상기 이미지와 다를 수 있습니다.</li>
                    <li>이벤트 선물은 학교 주소로 발송되며 반송된 경우, 다시 발송해드리지 않습니다.
                      <br />신청자 개인정보(성명/주소/휴대전화번호)는 배송업체에 공유됩니다. (롯데글로벌로지스㈜ / 사업자등록번호: 102-81-23012)
                    </li>
                  </ol>
                </div>
                <map name="semMap2" id="semMap2">
                  <area shape="rect" coords="412,102,491,126" target="_blank" href="https://www.vivasam.com/themeplace/vrtrip/main.do" className="btnMap" alt="학교주소 확인하기" />
                </map>
                <map name="semMap3" id="semMap3">
                  <area shape="rect" coords="248,102,362,118" target="_blank" href="https://www.vivasam.com/myinfo/myinfoModify.do" className="btnMap" alt="학교주소 확인하기" />
                </map>
            </div>
        )
    }
}

export default Event;
