import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import * as popupActions from 'store/modules/popup';
import {DOWNLOAD_IMAGE_PATH} from "../../constants";

class ElementaryProcessAppraisalListContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {

    }

    componentWillUnmount = () => {

    }

    goBack = () => {
        const { history } = this.props;
        history.goBack();
    }

    handleViewer = async (e) => {
        const dataset = e.currentTarget.dataset;
        const { ViewerActions } = this.props;
        try {
            ViewerActions.openViewer({title:e.target.dataset.name, target:e.target});
        }catch(e) {
            console.log(e);
        }
    }

    render() {
        return (
            <div>
                <section className="live_teaching">
                    <h2 className="blind">초등 과정형 수행 평가</h2>
                    <div className="live_teaching_top">
                        <p className="live_teaching_intro"><em>2015 개정 초등 과학 교과서 저자가 직접 개발한</em><br />초등 3~4학년군 과학과 수행평가 자료를 소개합니다.</p>
                    </div>

                    <div className="live_professor">
                        <h3>연구진 소개</h3>
                        <ul>
                            <li><strong>채동현 교수(전주교육대학교 과학교육과)</strong><br /><span>대한지구과학교육학회 회장,<br />한국과학교육총연합회 수석부회장</span></li>
                            <li>양일호 교수(한국교원대학교 초등교육과)</li>
                            <li>김은애 박사(한국교육개발원 디지털교육연구센터</li>
                            <li>한제준 교사(남원대산초등학교)</li>
                            <li>김순미 교사(전주삼천남초등학교)</li>
                            <li>신정윤 교사(대전두리초등학교)</li>
                        </ul>
                    </div>

                    <div className="live_ele_info">
                        <dl>
                            <dt>개발 배경</dt>
                            <dd>정기고사 형태의 지필평가의 폐지를 통한<br /><strong>성장중심의 평가 실시</strong></dd>
                            <dd>전인적 발달을 돕는<br /><strong>과정중심의 수행평가 활성화</strong></dd>
                            <dd>학생이 직접 참여하고 평가 방법과 기준이 명확한<br /><strong>활용성 높은 수행평가 자료의 확대</strong></dd>
                        </dl>
                        <dl>
                            <dt>개발 목적</dt>
                            <dd className="first">2015 개정 교육과정 분석과 수행평가 방법에 관한<br />연구를 통해 교육 현장에서 실제 활용 가능성이 높은<br />과학과 수행평가 자료 개발</dd>
                        </dl>
                        <dl>
                            <dt>개발 방향</dt>
                            <dd className="first"><strong>성취기준 중심의 평가</strong><br />각 차시 앞부분에 교과 역량과 관련한 요소들을 설명하여 수업 진행 시 중점을 두어야 할 부분을 확인할 수 있도록 함.</dd>
                            <dd><strong>과제 수행 과정에 대한 평가</strong><br />학생들의 문제 해결 과정을 평가의 중점으로 삼아 과정 중심 평가가 이루어지도록 함.</dd>
                            <dd><strong>평가 방법의 다양성 보장</strong><br />Demonstration(시연), Observation(관찰), Interview(구술평가), Portfolio(포트폴리오), Essay(글쓰기)와 같이 다양한 평가 방법을 활용하여 창의적 문제해결력을 키울 수 있도록 함.</dd>
                            <dd><strong>학생 중심의 자기 평가</strong><br />평가 기준을 제시하여 학생 스스로가 자신의 수행 수준과 성장 정도를 파악하고, 성취 수준을 높일 수 있도록 함.</dd>
                            <dd><strong>수업 중에 이루어지는 평가</strong><br />평가 기준을 제시하여 학생 스스로의 참여도를 높이고 자신의 수행 수준과 성장 정도를 파악하여 성취 수준을 높일 수 있도록 함.</dd>
                        </dl>
                    </div>

                    <div className="live_ele_data">
                         <ul className="live_subject">
                            <li className="live_subject_list">
                                <h3 className="live_subject_tit">3학년 1학기</h3>
                                <div className="live_subject_item" data-name="수행 평가 - 2. 물질의 성질_교사용" data-id="232512" data-src="https://dn.vivasam.com/VS/HS/SCN/106257/document/contents/[비상교육] 초등_과학_3-1_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    2. 물질의 성질
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 3. 동물의 한살이_교사용" data-id="232514" data-src="https://dn.vivasam.com/VS/HS/SCN/106257/document/contents/[비상교육] 초등_과학_3-1_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    3. 동물의 한살이
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 4. 자석의 이용_교사용" data-id="232494" data-src="https://dn.vivasam.com/VS/HS/SCN/106257/document/contents/[비상교육] 초등_과학_3-1_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    4. 자석의 이용
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 5. 지구의 모습_교사용" data-id="232496" data-src="https://dn.vivasam.com/VS/HS/SCN/106257/document/contents/[비상교육] 초등_과학_3-1_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    5. 지구의 모습
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                            </li>
                            <li className="live_subject_list">
                                <h3 className="live_subject_tit">3학년 2학기</h3>
                                <div className="live_subject_item" data-name="수행 평가 - 2. 동물의 생활_교사용" data-id="232499" data-src="https://dn.vivasam.com/VS/HS/SCN/106267/document/contents/[비상교육] 초등_과학_3-2_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    2. 동물의 생활
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 3. 지표의 변화_교사용" data-id="232500" data-src="https://dn.vivasam.com/VS/HS/SCN/106267/document/contents/[비상교육] 초등_과학_3-2_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    3. 지표의 변화
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 4. 물질의 상태_교사용" data-id="232502" data-src="https://dn.vivasam.com/VS/HS/SCN/106267/document/contents/[비상교육] 초등_과학_3-2_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    4. 물질의 상태
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 5. 소리의 성질_교사용" data-id="232504" data-src="https://dn.vivasam.com/VS/HS/SCN/106267/document/contents/[비상교육] 초등_과학_3-2_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    5. 소리의 성질
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                            </li>
                            <li className="live_subject_list">
                                <h3 className="live_subject_tit">4학년 1학기</h3>
                                <div className="live_subject_item" data-name="수행 평가 - 2. 지층과 화석_교사용" data-id="232520" data-src="https://dn.vivasam.com/VS/HS/SCN/106258/document/contents/[비상교육] 초등_과학_4-1_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    2. 지층과 화석
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 3. 식물의 한살이_교사용" data-id="232522" data-src="https://dn.vivasam.com/VS/HS/SCN/106258/document/contents/[비상교육] 초등_과학_4-1_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    3. 식물의 한살이
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 4. 물체의 무게_교사용" data-id="232515" data-src="https://dn.vivasam.com/VS/HS/SCN/106258/document/contents/[비상교육] 초등_과학_4-1_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    4. 물체의 무게
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 5. 혼합물의 분리_교사용" data-id="232518" data-src="https://dn.vivasam.com/VS/HS/SCN/106258/document/contents/[비상교육] 초등_과학_4-1_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    5. 혼합물의 분리
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                            </li>
                            <li className="live_subject_list">
                                <h3 className="live_subject_tit">4학년 2학기</h3>
                                <div className="live_subject_item" data-name="수행 평가 - 1. 식물의 생활_교사용" data-id="232528" data-src="https://dn.vivasam.com/VS/HS/SCN/106268/document/contents/[비상교육] 초등_과학_4-2_1_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    1. 식물의 생활
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 2. 물의 상태 변화_교사용" data-id="232516" data-src="https://dn.vivasam.com/VS/HS/SCN/106268/document/contents/[비상교육] 초등_과학_4-2_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    2. 물의 상태 변화
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 3. 그림자와 거울_교사용" data-id="232524" data-src="https://dn.vivasam.com/VS/HS/SCN/106268/document/contents/[비상교육] 초등_과학_4-2_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    3. 그림자와 거울
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                                <div className="live_subject_item" data-name="수행 평가 - 4. 화산과 지진_교사용" data-id="232526" data-src="https://dn.vivasam.com/VS/HS/SCN/106268/document/contents/[비상교육] 초등_과학_4-2_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                    4. 화산과 지진
                                    <span className="blind">한글자료 뷰어</span>
                                </div>
                            </li>


                             <li className="live_subject_list">
                                 <h3 className="live_subject_tit">5학년 1학기</h3>
                                 <div className="live_subject_item" data-name="수행 평가 - 2. 온도와 열" data-id="236267" data-src="https://dn.vivasam.com/VS/NES/SCN/106301/document/contents/[비상교육] 초등_과학_5-1_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     2. 온도와 열
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 3. 태양계와 별" data-id="236268" data-src="https://dn.vivasam.com/VS/NES/SCN/106301/document/contents/[비상교육] 초등_과학_5-1_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     3. 태양계와 별
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 4. 용해와 용액" data-id="236269" data-src="https://dn.vivasam.com/VS/NES/SCN/106301/document/contents/[비상교육] 초등_과학_5-1_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     4. 용해와 용액
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 5. 다양한 생물과 우리 생활" data-id="236270" data-src="https://dn.vivasam.com/VS/NES/SCN/106301/document/contents/[비상교육] 초등_과학_5-1_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     5. 다양한 생물과 우리 생활
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                             </li>
                             <li className="live_subject_list">
                                 <h3 className="live_subject_tit">5학년 2학기</h3>
                                 <div className="live_subject_item" data-name="수행 평가 - 2. 생물과 환경" data-id="236271" data-src="https://dn.vivasam.com/VS/NES/SCN/106310/document/contents/[비상교육] 초등_과학_5-2_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     2. 생물과 환경
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 3. 날씨와 우리 생활" data-id="236272" data-src="https://dn.vivasam.com/VS/NES/SCN/106310/document/contents/[비상교육] 초등_과학_5-2_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     3. 날씨와 우리 생활
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 4. 물체의 운동" data-id="236273" data-src="https://dn.vivasam.com/VS/NES/SCN/106310/document/contents/[비상교육] 초등_과학_5-2_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     4. 물체의 운동
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 5. 산과 염기" data-id="236274" data-src="https://dn.vivasam.com/VS/NES/SCN/106310/document/contents/[비상교육] 초등_과학_5-2_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     5. 산과 염기
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                             </li>
                             <li className="live_subject_list">
                                 <h3 className="live_subject_tit">6학년 1학기</h3>
                                 <div className="live_subject_item" data-name="수행 평가 - 2. 지구와 달의 운동" data-id="236275" data-src="https://dn.vivasam.com/VS/NES/SCN/106302/document/contents/[비상교육] 초등_과학_6-1_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     2. 지구와 달의 운동
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 3. 여러 가지 기체" data-id="236276" data-src="https://dn.vivasam.com/VS/NES/SCN/106302/document/contents/[비상교육] 초등_과학_6-1_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     3. 여러 가지 기체
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 4. 식물의 구조와 기능" data-id="236277" data-src="https://dn.vivasam.com/VS/NES/SCN/106302/document/contents/[비상교육] 초등_과학_6-1_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     4. 식물의 구조와 기능
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 5. 빛과 렌즈" data-id="236278" data-src="https://dn.vivasam.com/VS/NES/SCN/106302/document/contents/[비상교육] 초등_과학_6-1_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     5. 빛과 렌즈
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                             </li>
                             <li className="live_subject_list">
                                 <h3 className="live_subject_tit">6학년 2학기</h3>
                                 <div className="live_subject_item" data-name="수행 평가 - 1. 전기의 이용" data-id="236279" data-src="https://dn.vivasam.com/VS/NES/SCN/106311/document/contents/[비상교육] 초등_과학_6-1_1_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     1. 전기의 이용
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 2. 계절의 변화" data-id="236280" data-src="https://dn.vivasam.com/VS/NES/SCN/106311/document/contents/[비상교육] 초등_과학_6-1_2_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     2. 계절의 변화
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 3. 연소와 소화" data-id="236281" data-src="https://dn.vivasam.com/VS/NES/SCN/106311/document/contents/[비상교육] 초등_과학_6-1_3_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     3. 연소와 소화
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 4. 우리 몸의 구조와 기능" data-id="236282" data-src="https://dn.vivasam.com/VS/NES/SCN/106311/document/contents/[비상교육] 초등_과학_6-1_4_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     4. 우리 몸의 구조와 기능
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                                 <div className="live_subject_item" data-name="수행 평가 - 5. 에너지와 생활" data-id="236283" data-src="https://dn.vivasam.com/VS/NES/SCN/106311/document/contents/[비상교육] 초등_과학_6-1_5_수행 평가_교사용.hwp" onClick={this.handleViewer.bind(this)} data-gubun="CN030" data-summary="" data-type="document">
                                     5. 에너지와 생활
                                     <span className="blind">한글자료 뷰어</span>
                                 </div>
                             </li>
                        </ul>

                        <div className="down_txt">
                            * PC로 접속하시면 교과서 자료실 및 수업 혁신 채널에서 다운로드받으실 수 있습니다.
                        </div>
                    </div>





                </section>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(ElementaryProcessAppraisalListContainer));
