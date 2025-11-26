import React, {Component} from 'react';
import './Event.css';
import connect from "react-redux/es/connect/connect";
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
class Event extends Component {
    render() {
        return (
            <section className="event240415">
                <div className="evtCont1">
                    <img src="/images/events/2024/event240415/img1.png" alt="" />
                    <div className="blind">
                        <h1>지역화 작가관 2기에 도전하세요!</h1>
                        <div>
                            <p>&lt;우리 동네 매력뿜뿜 챌린지&gt;로 만들어진<br />
                                지역화 작가관에서 2기 작가님들을 모십니다.<br /><br />
                                <strong>선생님이 직접 찍은 우리 지역 사진을 올려 주세요.</strong>
                                수상하신 선생님은 ‘지역화 작가관’에 작가 2기로 등록되고,<br />
                                수상 작품이 전국의 선생님들께 공유됩니다.
                            </p>
                            <ul>
                                <li>응모 기간: 2024.04.15.(월) ~ 2024.5.19.(일)</li>
                                <li>당첨자 발표: 2024.05.31.(금)</li>
                            </ul>
                        </div>
                        <span>이벤트 신청 시 비바콘 100콘 적립</span>
                    </div>
                </div>

                <div className="evtCont2">
                    <img src="/images/events/2024/event240415/img2.png" alt="" />
                    <div className="blind">
                        <h2>사진 응모하기</h2>
                        <div>
                            <h3>출품 주제</h3>
                            <ul>
                                <li>우리 동네 의미 있는 그곳, 지역 명소에 대한 사진</li>
                                <li>수업에 다양하게 활용 가능한 주제의 지역화 사진
                                    <ul>
                                        <li>- 관공서, 주요 상가/시장, 주요 역/정류장, 교량, 터널 등</li>
                                        <li>- 유물/유적지, 의미가 담긴 거리 모습</li>
                                        <li>- 산, 강, 하천 외 지형적 특성이 있는 자연 환경</li>
                                        <li>- 우리 동네만의 축제, 특이한 시설물</li>
                                        <li>- 그 밖에 우리 동네에서 자주 만나는 친근한 풍경들</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3>출품 방법</h3>
                            <ul>
                                <li>1개의 장소를 선택하여 사진 파일을 올려주세요.
                                    <div className="noti">
                                        <span className="tit">꼭 읽어주세요!</span>
                                        <ul>
                                            <li>- <strong>한 번에 하나의 장소</strong>만 선택해서 <strong>최대 10장까지</strong> 등록 가능합니다.
                                            </li>
                                            <li>- 단, 응모 횟수에 제한이 없으므로, <strong>장소별로 나누어 응모</strong>하실 수 있습니다.</li>
                                            <li>- <strong>1MB 이상의 컬러 사진만</strong> 응모 가능하며, 1회당 용량 제한은 50MB입니다.</li>
                                            <li>- 사진 이름 : <strong>[시/도]_시/구/군_촬영 장소명.jpeg (예시:
                                                [서울특별시]_종로구_경복궁1)</strong></li>
                                            <li>- 저작권 및 초상권 문제가 있는 사진은 응모할 수 없으며, 사진 선정에서 제외됩니다.</li>
                                        </ul>
                                        <div className="info">
                                            <p>※ 파일명 규칙을 지키지 않을 경우 사진 선정에서 제외 됩니다.</p>
                                            <p>※ 한 장소에서 여러 사진을 올리는 경우 사진명에 '숫자' 혹은 '상세 장소명' 구분해서 업로드 부탁드립니다.</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3>시상</h3>
                            <ul>
                                <li>응모하신 지역화 사진에서 선정된 사진 1장당 상품권을 드리고,<br />BEST 3는 특별한 선물을 추가적으로 드립니다.
                                    <div className="noti">
                                        <ul>
                                            <li>
                                                <strong>[지역화 작가 2기 선정]</strong><br />
                                                심사 과정을 통하여 작가 2기로 선발되신 선생님 모두에게<br />
                                                <span className="point">사진 1장당 신세계 상품권 1만원을 지급</span>합니다. (1인당 최대 50만원)
                                            </li>
                                            <li>
                                                <strong>[지역화 작가 BEST 3]</strong><br />
                                                작가 2기 선정되신 선생님께 추가로,<br />
                                                응모 사진 중 BEST3 사진을 선정하여 총 3명의 선생님께 특별한 선물을 드립니다.<br />
                                                (BEST 3는 선정 사진 1장당 신세계 상품권 1만원 + 1~3위 상품 중 제공)
                                            </li>
                                        </ul>
                                        <div className="info">
                                            <p>※ 촬영한 지 1년이 지난 사진 (2023년 이전 촬영된 사진), 해상도가 떨어지는 사진은 선정에서 제외됩니다.</p>
                                            <p>※ <strong>지역화 작가관 2기 사진 선정은 교사 크리에이터 협회에서 진행됩니다.</strong></p>
                                            <p>※ 선정된 사진은 비바샘 작가관 2기에 노출됩니다.</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="evtCont3">
                    <img src="/images/events/2024/event240415/img3.png" alt="" />
                    <div className="blind">
                        <div>
                            <p>지역화 작가 2기 선정 - 선정된 사진 1장당 신세계 상품권 1만원(1인당 최대 50만원)</p>
                            <ul>
                                <li>1위 1명 - 캐논 브이로그 액션캠</li>
                                <li>2위 1명 - 스위스밀리터리 서머 여행용 레디백 (기내용)</li>
                                <li>3위 1명 - CJ 3만원 상품권</li>
                            </ul>
                        </div>
                        <div>
                            <strong>BEST 3 당첨 TIP.</strong>
                            <p>비바샘 지역화 자료실에 제공되지 않고 있는 사진을 제출하신 선생님은 BEST 3에 선정될 확률이 높아집니다.</p>
                        </div>
                    </div>
                </div>

                <div className="evtCont4">
                    <img src="/images/events/2024/event240415/img4.png" alt="" />
                    <div className="blind">
                        <p>
                            본 이벤트는 <strong>PC 이벤트 페이지</strong>에서<br />참여 가능합니다.<br />
                            자세한 이벤트 참여 방법은 <strong>PC 이벤트 페이지</strong>에서 확인해주세요!
                        </p>
                    </div>
                </div>

                <div className="evtFooter">
                    <div className="inner">
                        <strong>유의사항</strong>
                        <ul>
                            <li>본 이벤트는 비바샘 교사인증을 완료한 학교 선생님 대상 이벤트입니다.</li>
                            <li>이벤트 응모 즉시 비바콘이 최초 1회 적립됩니다. 더불어, 응모한 사진을 모두 삭제하실 경우 비바콘은 지급되지 않습니다.</li>
                            <li>경품은 당첨자 발표 이후 순차적으로 발송됩니다.</li>
                            <li>개인정보 오기재, 유효기간 만료로 인한 경품 재발송은 불가합니다.</li>
                            <li>저작권 및 초상권 문제가 있는 사진은 응모할 수 없으며 사진 선정에서 제외됩니다.</li>
                            <li>참여 이후, 개인정보 수정이 불가합니다</li>
                            <li>경품 발송을 위해 개인정보(성명, 휴대전화번호)가 서비스사에 제공됩니다.<br />
                                (㈜카카오 사업자등록번호 120-81-47521), (㈜모바일이앤엠애드 사업자등록번호 215-87-19169),<br />
                                (㈜다우기술 사업자등록번호: 220-81-02810), (㈜CJ대한통운 사업자등록번호 110-81-0503),<br />
                                (㈜한진 사업자등록번호: 201-81-02823)</li>
                            <li>경품은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                            <li>이벤트 참여를 통해 1등, 2등, 3등, 입상으로 5만원을 초과하는 경품 혜택을 받으실 경우, (주)비상교육에서 제세공과금 대납을 진행할 예정이며 이에 따라 제세공과금
                                4.4%가 포함된 금액으로 기타소득 신고가 진행될 예정입니다. 관련하여 세금 신고에 필요한 개인정보(주민등록번호, 주소 등)를 수급할 예정입니다.<br />
                                주민등록번호는 상품자 정보 처리로 인해 받으며 이벤트 종료 후 일괄 폐기처분 됩니다.</li>
                            <li>이벤트는 상황에 따라 조기 종료될 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </section>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
        event: state.saemteo.get('event').toJS(),
        answerPage: state.saemteo.get('answerPage').toJS(),
        eventAnswer: state.saemteo.get('eventAnswer').toJS()
    }),
    (dispatch) => ({
        PopupActions: bindActionCreators(popupActions, dispatch),
        SaemteoActions: bindActionCreators(saemteoActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch),
    })
)(withRouter(Event));