import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import BaseContainer from 'containers/page/BaseContainer';
import ErrorBoundary from 'components/common/ErrorBoundary';
import {Slide, ToastContainer} from 'react-toastify';
import 'css/App.css';
import "react-toastify/dist/ReactToastify.css";
import {initializeGtag} from "./store/modules/gtag";
import {
    AiPage,
    ContactPage,
    EducoursePage,
    FindPage,
    JoinPage,
    LeavePage,
    LibraryImagePage,
    LibraryVideoPage,
    LinkagePage,
    LiveLessonPage,
    LoginPage,
    MainPage,
    CoverPage,
    MyClassSetupPage,
    MyDataPage,
    MyInfoPage,
    NotFoundPage,
    NoticePage,
    PopupPage,
    QnaPage,
    SaemteoApplyPage,
    SaemteoPage,
    SaemteoPreviewPage,
    SaemteoViewPage,
    SearchPage,
    SettingPage,
    SnsJoinPage,
    SoobakcDetailPage,
    SoobakcPage,
    SsoChangePage,
    TestPage,
    TextBookPage,
    TodayPage,
    VerificationPage,
    ViewerPage,
    // BridgePage
    TermsPage,
    VivaclassPage,
    TtukttakPage,
    WechallPage,
    AisamPage
} from 'pages';

// Sentry.init({
//     dsn: "https://eff749da1eb24182aca96a155572f82c@sentry.io/1337465"
// });

function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
}
gtag('config', 'G-MZNXNH8PXM', {
    'page_path': '/home',
    'page_title': '선생님과 함께 만들어가는 즐거운 수업｜비바샘'
});

window.addEventListener('online',  (e) => {
    if (document.querySelector('#state-network-offline-header').style.display == 'block') {
        document.querySelector('#state-network-offline-header').style.display = 'none';
        document.querySelector('#state-network-online-header').style.display = 'block';
        setTimeout(()=>{
            document.querySelector('#state-network-online-header').style.display = 'none';
            document.querySelector('#state-network-dim').style.display = 'none';
        }, 1500);
    }
    console.log('업 되었습니다.');
});
window.addEventListener('offline', (e) => {
    console.log('다운되었습니다.');
    document.querySelector('#state-network-offline-header').style.display = 'block';
    document.querySelector('#state-network-dim').style.display = 'block';
});

document.addEventListener('focusout', function(e) {
    if (__shouldHideBottoNavigation(e.target)) {
        if (document.querySelector('.myNavi') != null && document.querySelector('.myNavi').classList.contains('has-vk')) {
            document.querySelector('.myNavi').classList.remove('hide');
            document.querySelector('.myNavi').classList.remove('has-vk');
        }
        //window.scrollTo(0,0);
    }
});
document.addEventListener('focusin', function(e) {
    if (__shouldHideBottoNavigation(e.target)) {
        if (document.querySelector('.myNavi') != null && !document.querySelector('.myNavi').classList.contains('hide')) {
            document.querySelector('.myNavi').classList.add('hide');
            document.querySelector('.myNavi').classList.add('has-vk');//vk --> virtual keyboard
        }
    }
});
function __shouldHideBottoNavigation(el) {
    if (el.tagName === 'INPUT') {
        if (el.type === 'radio' || el.type === 'checkbox') {
            return false;
        }
        else {
            return true;
        }
    } else if (el.tagName === 'SELECT') {
        return false;
    } else if (el.tagName === 'TEXTAREA') {
        return true;
    }
}
//window.addEventListener("orientationchange", function() {
//    alert("the orientation of the device is now " + (window.matchMedia('(orientation: portrait)').matches ? 'portrait': 'landscape'));
//});

class App extends Component {
    // componentDidCatch(error, errorInfo) {
    //     this.setState({ error });
    //     Sentry.withScope(scope => {
    //       Object.keys(errorInfo).forEach(key => {
    //         scope.setExtra(key, errorInfo[key]);
    //       });
    //       Sentry.captureException(error);
    //     });
    // }


    componentDidMount() {
        // 카카오 api 사용할 수 있게 초기화MainPage
        window.Kakao.init('2e9c6cde882e76e728de43455d983923');
        initializeGtag();
    }

    render() {
        // 캡챠 로고 defalut로 미노출
        let gb = document.getElementsByClassName("grecaptcha-badge");
        if (gb.length > 0) {gb[0].style.display = 'none';}
        if(document.getElementById("loading")) document.getElementById("loading").remove();
        return (
            <ErrorBoundary>
                <BaseContainer/>
                <Switch>
                    {/*각 유형에 맞는 PageTemplate을 선택*/}
                    <Route exact path="/" component={MainPage}/> {/*메인*/}
                    <Route exact path="/coverPage" component={CoverPage}/> {/* cover */}
                    <Route exact path="/login/:name?" component={LoginPage}/> {/*로그인*/}
                    <Route exact path="/find/:name" component={FindPage}/> {/*아이디회원찾기 //휴먼회원아이디찾기 //비밀번호찾기*/}
                    <Route exact path="/join/:name?" component={JoinPage}/> {/*회원가입*/}
                    <Route exact path="/sns/join/:name?" component={SnsJoinPage}/> {/*SNS 회원가입*/}
                    <Route exact path="/sns/linkage/:name?" component={LinkagePage}/> {/*SNS 연동화면*/}
                    <Route exact path="/myInfo/:name?" component={MyInfoPage}/> {/*개인정보수정*/}
                    <Route exact path="/verification/:name?" component={VerificationPage} /> {/*본인인증*/}
                    <Route exact path="/conversion/:name?" component={SsoChangePage} />{/* 통합회원 */}
                    <Route exact path="/educourse/textbook/:textbookCd?/:gubunCd?/:classCd?" component={TextBookPage}/> {/*교과서 상세*/}
                    <Route exact path="/educourse/myclassSetup/:name?" component={MyClassSetupPage}/> {/*내교과서*/}
                    <Route exact path="/educourse/:name?" component={EducoursePage}/> {/*교과서자료실*/}
                    <Route exact path="/library/image" component={LibraryImagePage}/> {/*라이브러리*/}
                    <Route exact path="/library/video" component={LibraryVideoPage}/> {/*라이브러리*/}
                    <Route exact path="/saemteo/event/view/:name?" component={SaemteoViewPage}/> {/*비바샘터 이벤트 상세*/}
                    <Route exact path="/saemteo/event/view/:name/:tab?" component={SaemteoViewPage}/> {/*비바샘터 이벤트 상세(탭)*/}
                    <Route exact path="/saemteo/event/apply/:name?" component={SaemteoApplyPage}/> {/*비바샘터 이벤트 신청*/}
                    <Route exact path="/saemteo/event/preview/:name/:type?" component={SaemteoPreviewPage}/> {/*비바샘터 이벤트 미리보기*/}
                    <Route exact path="/saemteo/program/view/:name?" component={SaemteoViewPage}/> {/*비바샘터 교사문화 프로그램 상세*/}
                    <Route exact path="/saemteo/program/apply/:name?" component={SaemteoApplyPage}/> {/*비바샘터 교사문화 프로그램 신청*/}
                    <Route exact path="/saemteo/seminar/view/:name?" component={SaemteoViewPage}/> {/*비바샘터 오프라인 세미나 상세*/}
                    <Route exact path="/saemteo/seminar/apply/:name?" component={SaemteoApplyPage}/> {/*비바샘터 오프라인 세미나 신청*/}
                    <Route exact path="/saemteo/vivasam/:name?" component={SaemteoPage}/> {/*비바샘이 간다 상세*/}
                    <Route exact path="/saemteo/vivasam/go/apply" component={SaemteoApplyPage}/> {/*비바샘이 간다 신청*/}
                    <Route exact path="/saemteo/:name?" component={SaemteoPage}/> {/*비바샘터*/}
                    <Route exact path="/liveLesson/:name?" component={LiveLessonPage} /> //살아있는 수업
                    <Route exact path="/search" component={SearchPage} /> //통합 검색
                    <Route exact path="/cs/notice/:id?" component={NoticePage}/> {/* 공지사항 */}
                    <Route exact path="/cs/qna/:id?" component={QnaPage}/> {/* 문의하기 */}
                    <Route exact path="/cs/contact/:name?" component={ContactPage}/> {/* 주변지사찾기, 본사오는길 */}
                    <Route exact path="/soobakc/:name?" component={SoobakcPage}/> {/* 수박씨 -> 온리원 추천 강의 */}
                    <Route exact path="/soobakc/detail/:name?" component={SoobakcDetailPage}/> {/* 수박씨 -> 온리원 추천 강의 상세 */}
                    <Route exact path="/mydata/:name?" component={MyDataPage}/> {/* 내자료 */}
                    <Route exact path="/setting" component={SettingPage}/> {/* setting */}
                    <Route exact path="/leave/:name?" component={LeavePage}/> {/* 회원탈퇴 */}
                    <Route exact path="/today/:name?" component={TodayPage}/> {/* 오늘뭐하지발표 */}
                    <Route exact path="/terms/:type?" component={TermsPage}/> {/* 약관 페이지 */}
                    <Route exact path="/vivaclass/:year?" component={VivaclassPage}/> {/* 비바클래스 홍보페이지 */}
                    <Route exact path="/ttukttak" component={TtukttakPage}/> {/* 뚝딱 홍보페이지 */}
                    <Route exact path="/wechall" component={WechallPage}/> {/* 위챌 홍보페이지 */}
                    <Route exact path="/aisam" component={AisamPage}/> {/* AI 수업 체험관 */}
                    <Route exact path="/textbookpromotion/hs/ai" component={AiPage}/> {/* 테스트페이지 */}
                    <Route exact path="/test/:name?" component={TestPage}/> {/* 테스트페이지 */}
                    <Route component={NotFoundPage}/>
                </Switch>
                <PopupPage/>
                <ViewerPage/>
                <ToastContainer
                    position="bottom-center"
                    autoClose={2000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    transition={Slide}
                    closeButton={false}
                />
            </ErrorBoundary>
    );
  }
}

export default App;
