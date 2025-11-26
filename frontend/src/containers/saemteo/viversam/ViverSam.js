import React, {Component} from 'react';
import './ViverSam.css';
import Slider from "react-slick";
import * as common from "../../../lib/common";
import connect from "react-redux/lib/connect/connect";
import {withRouter} from "react-router-dom";
import {bindActionCreators} from "redux";
import * as baseActions from "../../../store/modules/base";

class ViverSam extends Component{
    constructor(props) { //초기화
        super(props);
        this.state = {
            scrollX: 0,
            scrollY: 0,
        }
    }

    pageDown = () => {
        document.getElementById('locaY').scrollIntoView({behavior:'smooth'}, true);
    }

    viverdown = () => {
        const {logged, history, BaseActions} = this.props;
        if (!logged) {
            // 미로그인시
            common.info("로그인이 필요한 서비스입니다.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }

        window.location.href="https://dn.vivasam.com/VS/CHARACTER/2023/비바샘 캐릭터 소스.zip"
    }


    render() {
        //slick option 설정
        const settings = {
            slidesToShow: 4,
            slidesToScroll: 1,
            swipeToSlide:true,
            autoplay: true,
            autoplaySpeed: 2200,
            arrows:false,
            infinite: true,
            variableWidth: true,
            className: "slide_list",
        };

        return(
            <section className="viversamWrap" id="test">
                <a href="javascript:void(0);" className="downBtn" onClick={() => this.pageDown()}><span className="blind">다운로드 버튼</span></a>
                <div className="viversamContainer evtContainer">
                    <section className="viversamCont">
                        <div className="viversam_full">
                            <div className="viversam_cont01 fp-auto-height">
                                <img src="/images/saemteo/viversam/viversam_cont01.png" alt="비버샘 소개 이미지" />
                                <div className="blind">
                                    <h1>저의 이름은 비버샘 입니답!</h1>
                                    <h2>반갑습니답!</h2>
                                    <p>
                                        비바샘터에서 태어난 비버샘이라고 해욥.
                                        친구들에게 나뭇가지로 집짓기, 멋지게 수영하기, 꼬리 단장하기 등을 알려주며
                                        누군가를 돕고 배움을 전하는것이 저의 적성과 잘 맞는다는 생각이 들지 뭐에욥?
                                    </p>
                                </div>
                            </div>

                            <div className="viversam_cont02">
                                <div className="contwrap">
                                    <img src="/images/saemteo/viversam/viversam_cont02.png" alt="비버샘 story" />
                                    <div className="blind">
                                        <h1>비버샘 STORY</h1>
                                        <h2>저는 비바샘 선생님께서 만들어주셨어욥.</h2>
                                        <p>2023년 1월 비바샘 캐릭터 공모전에서 361명의 선생님을 통해 저는 다양한 모습으로 만들어졌답니답. 이후 선생님들의 투표를 받아 아주 특별하게 탄생했어욥.<br /><br />짧지만 굵은 비버샘 탄생 스토리를 소개합니답.</p>
                                        <ul>
                                            <li>인기투표에서 선의의 경쟁을 펼친 친구들이에욥! 제가 당선된 건 다 선생님들 덕분입니답!</li>
                                            <li>이건 비밀인데욥! 처음에 저는 이렇게 생겼었대욥.</li>
                                            <li>이번엔 제가 약간 푸근해졌어욥.​ 이 모습도 꽤 귀엽죱?</li>
                                            <li>지금 이 모습이 가장 마음에 들어욥!</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="viversam_cont03">
                                <div className="contwrap">
                                    <img src="/images/saemteo/viversam/viversam_cont03.png" alt="비버샘 A to Z" />
                                    <div className="blind">
                                        <h1>비버샘 A to Z</h1>
                                        <h2>귀여운 외모와는 달리, 교단에서 서면 똑부러지는 카리스마를 발산!</h2>
                                        <p>안녕 얘들압!</p>
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>이름</th>
                                                <th>직업</th>
                                                <th>생일</th>
                                                <th>나이</th>
                                                <th>국적</th>
                                                <th>소속</th>
                                                <th>고향</th>
                                            </tr>
                                            <tr>
                                                <th>취미</th>
                                                <th>습관</th>
                                                <th>장래희망</th>
                                                <th>MBTI</th>
                                                <th>성격</th>
                                                <th>좌우명</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>비버샘(Viversam)</td>
                                                <td>선생님</td>
                                                <td>4월 3일</td>
                                                <td>1살</td>
                                                <td>대한민국</td>
                                                <td>비바샘</td>
                                                <td>비바샘터</td>
                                                <td>수영, 노래</td>
                                                <td>말 끝에 'ㅂ' 붙이기</td>
                                                <td>교단위의 아이돌</td>
                                                <td>비상 비(砒)씨</td>
                                                <td>학생들의 행동에 따라 천사가 될 수도, 악마가 될 수도 있음(반전매력)</td>
                                                <td>비비디 바비디</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="viversam_cont04" id="locaY">
                                <div className="contwrap">
                                    <img src="/images/saemteo/viversam/viversam_cont04.png" alt="비버샘 is Free" />
                                    <div className="blind">
                                        <h1>비버샘 is FREE</h1>
                                        <p>
                                            비버샘 캐릭터는 오직 선생님께만 무료로 제공됩니답. 학급 꾸미기, 수업 자료 등에 비버샘을 활용해 보세욥! 이모티콘으로 제작된
                                            16종 모션도 활용하실 수 있습니답.
                                        </p>
                                        <ul>
                                            <li>학급 꾸미기</li>
                                            <li>문구류</li>
                                            <li>수업 자료</li>
                                        </ul>
                                    </div>
                                </div>

                                <Slider {...settings}>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam01.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam02.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam03.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam04.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam05.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam06.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam07.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam08.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam09.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam10.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam11.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam12.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam13.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam14.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam15.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam16.png" alt="비버샘 굿즈"/></div>

                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam01.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam02.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam03.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam04.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam05.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam06.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam07.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam08.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam09.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam10.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam11.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam12.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam13.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam14.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam15.png" alt="비버샘 굿즈"/></div>
                                    <div className="slideimg"><img src="../images/saemteo/viversam/viversam16.png" alt="비버샘 굿즈"/></div>
                                </Slider>

                                <div className="viverbtnWrap">
                                    <a className="viverdown" onClick={this.viverdown}><span
                                        className="blind">캐릭터 파일 다운로드</span></a>
                                    <div className="copyimg">
                                        <img src="/images/saemteo/viversam/viversam_cont04_tit.png" alt="상업적 이용은 제한 됩니다." />
                                    </div>
                                </div>
                            </div>

                            <div className=" viversam_cont05">
                                <div className="contwrap">
                                    <img src="/images/saemteo/viversam/viversam_cont05.png" alt="비버샘 viversam with you"/>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        );
    };
};

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(ViverSam));