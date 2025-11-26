import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';
import Drawer from 'components/common/Drawer';
import * as common from "../../lib/common";


const MainHeader = ({logged, loginInfo, handleMenuClick, open, handleMenuOnchange, handleMenuCloseClick, handlePopup, scrollPosition, initHidden, handleLogin, schoolName, mainSubjectName, secondSubjectName, schoolLvlCd, onClickCallLinkingOpenUrl}) => {

    const {memberId, memberName} = loginInfo;
    const drawerProps = {
        overlayColor : "rgba(255,255,255,0.6)",
        open : open,
        noTouchOpen : false,
        noTouchClose : false,
        width : 310,
        drawerStyle : {
            "background" : "#F9F9F9",
            "boxShadow" : "rgba(0, 0, 0, 0.188235) 0px 10px 20px, rgba(0, 0, 0, 0.227451) 0px 6px 6px"
        }
    };
    let clazz = 'header_main';
    if(!initHidden){
        //메인 제외
        clazz = '';
    }

    function gtag(){
        window.dataLayer.push(arguments);
    }
    return (
        <Fragment>
            <header id={initHidden ? '' : ''} className={clazz} >
                <h1 className="logo">
                    <Link to="/"
                          onClick={()=>{
                              gtag('event', '홈', {
                                  'parameter': 'GNB'
                              });
                          }}>
                        <img src="/images/common/logo_vivasam_180x28.png" alt="비바샘 중고등"/>
                        {/*<img src="/images/common/logo_250124.png" alt="비바샘" />*/}
                    </Link>
                </h1>
                <div className="allMenu">
                    <div
                        className="bm-burger-button"
                        style={{zIndex: 1000, display: 'inline-block', position: 'relative', top: 20, width: 18, height: 15}}>
                        <span>
                        <span
                            className="bm-burger-bars"
                            style={{position: 'absolute', height: '16%', left: 0, right: 0, top: '0%', opacity: 1, background: 'rgb(51, 51, 51)'}}>
                        </span>
                        <span
                            className="bm-burger-bars"
                            style={{position: 'absolute', height: '15%', left: 0, right: 0, top: '40%', opacity: 1, background: 'rgb(51, 51, 51)'}}>
                        </span>
                        <span
                            className="bm-burger-bars"
                            style={{position: 'absolute', height: '15%', left: 0, right: 0, top: '80%', opacity: 1, background: 'rgb(51, 51, 51)'}}>
                        </span>
                        </span>
                        <button
                            onClick={handleMenuClick}
                            style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', margin: '-20px', padding: '25px 30px', border: 'none', opacity: 0, fontSize: 8, cursor: 'pointer'}}>
                            Open Menu
                        </button>
                    </div>
                </div>
                <div className="mainLinkWrap">
                    <a href="https://pf.kakao.com/_JUlsK" className="ico_kakao" target="_blank"></a>
                </div>
            </header>
            <Drawer
                {...drawerProps}
                fadeOut
                onChange={open=>{handleMenuOnchange(open)}}
            >

                <div id="navi" className="navi on">
                    <div id="navi_inbox" className="navi_inbox">
                        <h2 className="blind">
                            비바샘 전체메뉴
                        </h2>
                        <div className="navi_top">
                            <Link to={logged ? '/setting' : '/login'} onClick={() => {
                                gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '설정', 'parameter_url': window.location.origin + "/#" + (logged ? '/setting' : '/login')});
                            }}>
                                <button className="navi_btn_setting ico_setting">
                                    <span className="blind">설정</span>
                                </button>
                            </Link>
                            {!logged ? (
                                <p className="navi_top_ment">
                                        <span>
                                            <a onClick={handleLogin} className="navi_top_ment_marker">로그인</a>하고<br />비바샘과 즐거운 수업 시작하세요.
                                        </span>
                                </p>
                            ) : ''}
                            {logged ? (
                                <div className="navi_top_login">
                                    <h3 className="navi_top_tit">
                                        <strong className="navi_user_nick">{memberName}</strong>
                                        <span className="navi_user_name">선생님</span>
                                    </h3>
                                    <div className="navi_top_info">
                                        {schoolName ? <span className="navi_user_school">{schoolName}</span> : ''}
                                        {schoolLvlCd != 'ES' && mainSubjectName ? <em className="navi_top_marker">{mainSubjectName}</em> : '' }
                                        {schoolLvlCd != 'ES' && secondSubjectName ? <em className="navi_top_marker">{secondSubjectName}</em> : ''}
                                    </div>
                                    <ul className="navi_user">
                                        <li className="navi_user_list">
                                            <a href="javascript:void(0)" onClick={() => {
                                                gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '내 교과서', 'parameter_url': window.location.origin + "/#/educourse/myclassSetup/textbook"});
                                                // 교사 인증
                                                if (loginInfo.certifyCheck === 'N') {
                                                    common.info("교사 인증 후 사용 가능합니다.");
                                                    window.location.hash = "/login/require";
                                                    window.viewerClose();
                                                    return;
                                                } else {
                                                    window.location.hash = "/educourse/myclassSetup/textbook";
                                                }
                                            }}>
                                                <button
                                                    type="button"
                                                    className="navi_user_link">
                                                    내 교과서
                                                </button>
                                            </a>
                                        </li>
                                        <li className="navi_user_list">
                                            <a href="javascript:void(0);" onClick={() => {
                                                gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '내 자료', 'parameter_url': window.location.origin + "/#/mydata"});
                                                // 교사 인증
                                                if (loginInfo.certifyCheck === 'N') {
                                                    common.info("교사 인증 후 사용 가능합니다.");
                                                    window.location.hash = "/login/require";
                                                    window.viewerClose();
                                                    return;
                                                } else {
                                                    window.location.hash = "/mydata";
                                                }
                                            }}>
                                                <button
                                                    type="button"
                                                    className="navi_user_link mid">
                                                    내 자료
                                                </button>
                                            </a>
                                        </li>
                                        <li className="navi_user_list">
                                            <Link to="/myInfo" onClick={() => {
                                                gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '정보 수정', 'parameter_url': window.location.origin + "/#/myInfo"});
                                            }}>
                                                <button
                                                    type="button"
                                                    className="navi_user_link">
                                                    정보수정
                                                </button>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            ) : ''}
                        </div>
                        <button
                            type="button"
                            className="navi_close btn_close_type2"
                            onClick={handleMenuCloseClick}>
                                    <span className="blind">
                                        비바샘 전체메뉴 레이어 닫기
                                    </span>
                        </button>

                        <div className={"navi_cont" + (logged ? ' type2' : '')}>
                            {/* [DEV] 2024-04-24 단독회원인 경우 배너 노출 */}
                            { logged && (loginInfo.ssoMemberYN !== 'Y' || loginInfo.ssoMemberYN === undefined || loginInfo.ssoMemberYN === "") ?
                                <Fragment>
                                    <div className="navi_linkbanner2">
                                        <Link to="/conversion/agree" className="btnLink"
                                              onClick={() => {
                                                  gtag('event', '통합회원 전환하기', {
                                                      'parameter': '전체메뉴'
                                                  });
                                              }}>
                                            <strong className="tit">통합회원 전환하기</strong>
                                            <p className="txt">비바샘의 다양한 서비스를<br/>하나의 아이디로 이용해보세요.</p>
                                        </Link>
                                    </div>
                                </Fragment>
                                :
                                ""
                            }
                            <div className="navi_cont_box">
                                <ul className="navi_menu">
                                    <li className="navi_menu_list navi_menu_class">
                                        <h3 className="navi_menu_tit">
                                            교과서 자료 {/* <span className="renewer_year y22">22 개정</span> */} {/* <span className="renewer_year y15">15 개정</span> */}
                                        </h3>
                                        {/* {
                                            logged ?
                                                <Link to="/educourse/myclass"
                                                      onClick={()=>{
                                                          gtag('event', '2024 모바일', {
                                                               'parameter': '마이페이지',
                                                               'parameter value' : '교과 자료_내 교과서'
                                                          });
                                                          handleMenuOnchange(false)
                                                      }}
                                                      className="navi_link">내 교과서</Link> : ''
                                        } */}
                                        <Link to={"/educourse/middle"}
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '교과서 자료_중학', 'parameter_url': window.location.origin + "/#/educourse/middle"});
                                                  handleMenuOnchange(false);
                                              }}
                                              className="navi_link">중학</Link>
                                        <Link to={"/educourse/high"}
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '교과서 자료_고등', 'parameter_url': window.location.origin + "/#/educourse/high"});
                                                  handleMenuOnchange(false);
                                              }}
                                              className="navi_link right_no">고등</Link>
                                    </li>
                                    <li className="navi_menu_list navi_menu_live">
                                        <h3 className="navi_menu_tit">
                                            창체·수업연구
                                        </h3>
                                        <Link to="/liveLesson/aidtNewcurriculum"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '2022 개정 교육과정', 'parameter_url': window.location.origin + "/#/liveLesson/aidtNewcurriculum"});
                                              }}
                                              className="navi_link">
                                            2022 개정 교육과정
                                        </Link>
                                        <Link to="/liveLesson/fastMusicLibrary"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '바로바로 음악 자료실', 'parameter_url': window.location.origin + "/#/liveLesson/fastMusicLibrary"});
                                              }}
                                              className="navi_link">
                                            바로바로 음악 자료실
                                        </Link>
                                        <Link to="/liveLesson/visualThinking"
                                            onClick={()=>{
                                                gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '비주얼 싱킹', 'parameter_url': window.location.origin + "/#/liveLesson/visualThinking"});
                                            }}
                                            className="navi_link">
                                            비주얼 싱킹
                                        </Link>
                                        {/* <Link to="/liveLesson/middleClassAppraisalList"
                                              onClick={() => {
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '중등 수업 평가 혁신'});
                                              }}
                                              className="navi_link right_no">
                                            중등 수업 평가 혁신
                                        </Link> */}
                                        <Link to="/liveLesson/classLiveQuestion"
                                              onClick={() => {
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '질문이 살아있는 수업', 'parameter_url': window.location.origin + "/#/liveLesson/classLiveQuestion"});
                                              }}
                                              className="navi_link">
                                            질문이 살아있는 수업
                                        </Link>
                                        <Link to="/liveLesson/MonthContainer"
                                              onClick={() => {
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '계기 수업 자료', 'parameter_url': window.location.origin + "/#/liveLesson/MonthContainer"});
                                              }}
                                              className="navi_link">
                                            계기 수업 자료
                                        </Link>
                                        <Link to="/liveLesson/OnlineClassSurvivalSecret"
                                              onClick={() => {
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '온라인 교실 생존비법', 'parameter_url': window.location.origin + "/#/liveLesson/OnlineClassSurvivalSecret"});
                                              }}
                                              className="navi_link">
                                            온라인 교실 생존비법
                                        </Link>
                                        <Link to="/library/image"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '이미지 자료', 'parameter_url': window.location.origin + "/#/library/image"});
                                              }}
                                              className="navi_link right_no">
                                            라이브러리
                                        </Link>
                                    </li>
                                    <li className="navi_menu_list navi_menu_viva">
                                        <h3 className="navi_menu_tit">
                                            비바샘터
                                        </h3>
                                        <Link to="/saemteo/event"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '이벤트', 'parameter_url': window.location.origin + "/#/saemteo/event"});
                                                  handleMenuOnchange(false)
                                              }}
                                              className="navi_link">
                                            이벤트
                                        </Link>
                                        <Link to="/saemteo/program"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '교사문화 프로그램', 'parameter_url': window.location.origin + "/#/saemteo/program"});
                                                  handleMenuOnchange(false);
                                              }}
                                              className="navi_link right_no">
                                            교사문화 프로그램
                                        </Link>
                                        <Link to="/saemteo/survey"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '비바샘 설문조사', 'parameter_url': window.location.origin + "/#/saemteo/survey"});
                                                  handleMenuOnchange(false);
                                              }}
                                              className="navi_link right_no">
                                            비바샘 설문조사
                                        </Link>
                                        <Link to="/saemteo/vivasam/go"
                                              onClick={()=>{
                                                  gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '비바샘이 간다', 'parameter_url': window.location.origin + "/#/saemteo/vivasam/go"});
                                                  handleMenuOnchange(false);
                                              }}
                                              className="navi_link right_no">
                                            비바샘이 간다
                                        </Link>
                                    </li>
                                    <li className="navi_menu_sns">
                                        <h3>비바샘 소식, <br/>SNS에서 만나보세요!</h3>
                                        <div className="navi_sns_icons">
                                            <a className="navi_sns_icon blog" href="https://blog.naver.com/vivasam_official"><span className="blind">블로그</span></a>
                                            <a className="navi_sns_icon insta" href="https://www.Instagram.com/vivasam_official"><span className="blind">인스타그램</span></a>
                                            <a className="navi_sns_icon kakaoCh" href="https://pf.kakao.com/_JUlsK"><span className="blind">카카오톡 </span></a>
                                        </div>
                                    </li>
                                    {/*<li className="eventBanner">
                                        <a href="https://me.vivasam.com/#/aisam" target="_blank" onClick={() => {
                                            gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '배너1_비상교육 AI 디지털교과서, 지금 만나 보세요.', 'parameter_url': "https://me.vivasam.com/#/aisam"});
                                        }}>
                                            <img src="/images/main/mo_aidt_banner.png" alt="비상교육 AI 디지털교과서, 지금 만나 보세요." />
                                        </a>
                                    </li>*/}
                                    <li className="navi_menu_list navi_menu_cs">
                                        <h3 className="navi_menu_tit">
                                            고객센터 <em className="navi_menu_cs_num">1544-7714</em>
                                        </h3>
                                        <a
                                            onClick={()=>{
                                                gtag('event', '전화걸기', {
                                                    'parameter': '전체메뉴'
                                                });
                                            }}
                                            href="tel:1544-7714"
                                            className="navi_menu_cs_tel ico_tel_type2">
                                            <span className="blind">전화걸기</span>
                                        </a>
                                        <p className="navi_menu_cs_guide">
                                            평일 9시~6시, 토/공휴일 휴무
                                        </p>
                                        <ul className="navi_menu_cs_ul">
                                            <li className="navi_menu_cs_list list1">
                                                <Link to="/cs/notice"
                                                      onClick={()=>{
                                                          gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '공지사항', 'parameter_url': window.location.origin + "/#/cs/notice"});
                                                      }}
                                                      className="navi_menu_cs_link">
                                                    <span>공지사항</span>
                                                </Link>
                                            </li>
                                            <li className="navi_menu_cs_list list2">
                                                <Link to={logged ? "/cs/qna/new" : '/login'}
                                                      onClick={()=>{logged
                                                          ? gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '문의하기', 'parameter_url': window.location.origin + "/#/cs/qna/new"})
                                                          : null}}
                                                      className="navi_menu_cs_link">
                                                    <span>문의하기</span>
                                                </Link>
                                            </li>
                                            <li className="navi_menu_cs_list list3">
                                                <Link to="/cs/qna"
                                                      onClick={()=>{
                                                          gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '내 문의내역', 'parameter_url': window.location.origin + "/#/cs/qna"});
                                                      }}
                                                      className="navi_menu_cs_link">
                                                    <span>
                                                        내 문의내역
                                                    </span>
                                                </Link>
                                            </li>
                                            <li className="navi_menu_cs_list list4">
                                                <Link to="/cs/contact/hq"
                                                      onClick={()=>{
                                                          gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '찾아오는 길', 'parameter_url': window.location.origin + "/#/cs/contact/hq"});
                                                      }}
                                                      className="navi_menu_cs_link">
                                                    <span>
                                                        찾아오시는 길
                                                    </span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>

                            {/* <div className="navi_soobac">
                                <Link to="/vivaclass"
                                      onClick={()=>{
                                          gtag('event', '2025 개편', {'parameter': '메뉴', 'parameter_value': '배너2_비바클래스 OPEN!'});
                                          handleMenuOnchange(false)
                                      }}
                                      className="navi_soobac_box">
                                    <img
                                        className="navi_soobac_banner"
                                        src="/images/common/banner_vivaclass.png"
                                        alt="비바클래스 OPEN!" />
                                </Link>
                            </div> */}

                            <div className="navi_agree">
                                <div className="navi_agree_term">
                                    <Link className="navi_agree_link" to={"/terms/service"}>이용약관</Link>

                                </div>
                                <div className="navi_agree_privacy">
                                    <Link className="navi_agree_link" to={"/terms/privacy"}>개인정보처리방침</Link>
                                </div>
                            </div>
                            <div className="navi_agree" style={{paddingTop: '0px'}}>
                                <div className="navi_agree_term" style={{width: '100%'}}>
                                    <a
                                        onClick={()=>{
                                            gtag('event', '위치정보 수집이용 약관', {
                                                'parameter': '전체메뉴',
                                                'parameter value': '약관'
                                            });
                                            handlePopup('gps')
                                        }}
                                        className="navi_agree_link">
                                        위치정보 수집이용 약관
                                    </a>
                                </div>
                            </div>
                            <div className="navi_footer">
                                <h2 className="navi_footer_logo logo_visang">비상</h2>
                                <p className="navi_footer_copyright">
                                    COPYRIGHT(C) (주)비상교육 ALL RIGHTS RESERVED.
                                </p>
                                {/*<p className="navi_footer_ment">비바샘 PC 버전에서는 창의 융합 수업 자료, 테마별 자료 등 수업에 활용할 수 있는 더 많은 자료를 확인할 수 있습니다.</p>
                                <a onClick={onClickCallLinkingOpenUrl}
                                   className="footer_pclink">PC 버전보기</a>*/}
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </Fragment>
    );
};

export default MainHeader;