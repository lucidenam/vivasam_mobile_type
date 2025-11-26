import React, {Component} from 'react';
import './Event.css';
import * as api from 'lib/api';
import connect from "react-redux/es/connect/connect";
import * as common from 'lib/common';
import {withRouter} from "react-router-dom";
import * as saemteoActions from 'store/modules/saemteo';
import * as popupActions from 'store/modules/popup';
import * as baseActions from 'store/modules/base';
import {bindActionCreators} from "redux";
import queryString from "query-string";
import {isProd} from "../../../../lib/TargetingUtils";

const PRODUCT_LIST = [
    {type: '3', name: '스타벅스 케익,커피 세트', price: 10000, caption: '스타벅스<br />케익,커피 세트',  imgUrl: '/images/events/2023/event230512/gift_01.png'},
    {type: '4', name: '배스킨라빈스 파인트 아이스크림', price: 10000, caption: '배스킨라빈스<br />파인트 아이스크림',  imgUrl: '/images/events/2023/event230512/gift_02.png'},
    {type: '5', name: '신세계 상품권 1만원권', price: 10000, caption: '신세계 상품권<br />1만원권',  imgUrl: '/images/events/2023/event230512/gift_03.png'},
    {type: '6', name: '배달의민족 기프티콘 1만원권', price: 10000, caption: '배달의민족<br />기프티콘 1만원권',  imgUrl: '/images/events/2023/event230512/gift_04.png'},
    {type: '7', name: '설빙 1만원권', price: 10000, caption: '설빙<br />1만원권',  imgUrl: '/images/events/2023/event230512/gift_05.png'},
    {type: '8', name: '파리바게트 1만원권', price: 10000, caption: '파리바게트<br />1만원권',  imgUrl: '/images/events/2023/event230512/gift_06.png'},
    {type: '9', name: '요기요 1만원권', price: 10000, caption: '요기요<br />1만원권',  imgUrl: '/images/events/2023/event230512/gift_07.png'},
    {type: '10', name: 'CU 1만원권', price: 10000, caption: 'CU<br />1만원권',  imgUrl: '/images/events/2023/event230512/gift_08.png'},

    {type: '11', name: '에스오일 주유권 3만원권', price: 30000, caption: '에스오일 주유권<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_09.png'},
    {type: '12', name: '배스킨라빈스 아이스크림 케익', price: 30000, caption: '배스킨라빈스<br />아이스크림 케익',  imgUrl: '/images/events/2023/event230512/gift_10.png'},
    {type: '13', name: '신세계 상품권 3만원권', price: 30000, caption: '신세계 상품권<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_11.png'},
    {type: '14', name: '올리브영 상품권 3만원권', price: 30000, caption: '올리브영 상품권<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_12.png'},
    {type: '15', name: '도서문화 상품권 3만원권', price: 30000, caption: '도서문화 상품권<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_13.png'},
    {type: '16', name: '파리바게트 3만원권', price: 30000, caption: '파리바게트<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_14.png'},
    {type: '17', name: '메가박스 2인 예매권', price: 30000, caption: '메가박스<br />2인 예매권',  imgUrl: '/images/events/2023/event230512/gift_15.png'},
    {type: '18', name: '아웃백 3만원권', price: 30000, caption: '아웃백<br />3만원권',  imgUrl: '/images/events/2023/event230512/gift_16.png'},

    {type: '19', name: '도미노피자 피자 세트', price: 50000, caption: '도미노피자<br />피자 세트',  imgUrl: '/images/events/2023/event230512/gift_17.png'},
    {type: '20', name: '랑콤 립스틱', price: 50000, caption: '랑콤 립스틱',  imgUrl: '/images/events/2023/event230512/gift_18.png'},
    {type: '21', name: '신세계 상품권 5만원권', price: 50000, caption: '신세계 상품권<br />5만원권',  imgUrl: '/images/events/2023/event230512/gift_19.png'},
    {type: '22', name: 'CJ 기프트카드 5만원권', price: 50000, caption: 'CJ 기프트카드<br />5만원권',  imgUrl: '/images/events/2023/event230512/gift_20.png'},
    {type: '23', name: 'SK 주유권 5만원권', price: 50000, caption: 'SK 주유권<br />5만원권',  imgUrl: '/images/events/2023/event230512/gift_21.png'},
    {type: '24', name: '올리브영 5만원권', price: 50000, caption: '올리브영<br />\n5만원권',  imgUrl: '/images/events/2023/event230512/gift_22.png'},
    {type: '25', name: '고려은단 비타민 C 영양제', price: 50000, caption: '고려은단<br />비타민 C 영양제',  imgUrl: '/images/events/2023/event230512/gift_23.png'},
    {type: '26', name: '락피쉬 웨더웨어 슬리퍼', price: 50000, caption: '락피쉬 웨더웨어<br />슬리퍼',  imgUrl: '/images/events/2023/event230512/gift_24.png'},

    {type: '27', name: '아웃백 기프트카드 10만원권', price: 100000, caption: '아웃백 기프트카드<br />10만원권',  imgUrl: '/images/events/2023/event230512/gift_25.png'},
    {type: '28', name: '설화수 윤조 에센스 60ml', price: 100000, caption: '설화수<br />윤조 에센스 60ml',  imgUrl: '/images/events/2023/event230512/gift_26.png'},
    {type: '29', name: '신세계 상품권 10만원권', price: 100000, caption: '신세계 상품권<br />10만원권',  imgUrl: '/images/events/2023/event230512/gift_27.png'},
    {type: '30', name: 'CJ 기프트카드 10만원권', price: 100000, caption: 'CJ 기프트카드<br />10만원권',  imgUrl: '/images/events/2023/event230512/gift_28.png'},
    {type: '31', name: '롯데모바일교환권 10만원권', price: 100000, caption: '롯데모바일교환권<br />10만원권',  imgUrl: '/images/events/2023/event230512/gift_29.png'},
    {type: '32', name: '메가박스 부띠크 2인 예매권', price: 100000, caption: '메가박스 부띠끄<br />2인 예매권',  imgUrl: '/images/events/2023/event230512/gift_30.png'},
    {type: '33', name: '일리 프란시스 Y3.3 커피머신', price: 100000, caption: '일리<br />프란시스 Y3.3 커피머신',  imgUrl: '/images/events/2023/event230512/gift_31.png'},
    {type: '34', name: '헬리녹스 야외용 경량의자', price: 100000, caption: '헬리녹스<br />야외용 경량의자',  imgUrl: '/images/events/2023/event230512/gift_32.png'},

    {type: '35', name: 'LG 퓨리케어 공기청정기', price: 200000, caption: 'LG<br />퓨리케어 공기청정기',  imgUrl: '/images/events/2023/event230512/gift_33.png'},
    {type: '36', name: '에스티로더 갈색병 세럼', price: 200000, caption: '에스티로더<br />갈색병 세럼',  imgUrl: '/images/events/2023/event230512/gift_34.png'},
    {type: '37', name: '신세계 상품권 20만원권', price: 200000, caption: '신세계 상품권<br />20만원권',  imgUrl: '/images/events/2023/event230512/gift_35.png'},
    {type: '38', name: '루메나 무선 서큘레이터', price: 200000, caption: '루메나<br />무선 서큘레이터',  imgUrl: '/images/events/2023/event230512/gift_36.png'},
    {type: '39', name: '롯데 호텔 상품권 20만원권', price: 200000, caption: '롯데 호텔 상품권<br />20만원권',  imgUrl: '/images/events/2023/event230512/gift_37.png'},
    {type: '40', name: '보스 블루투스 스피커', price: 200000, caption: '보스<br />블루투스 스피커',  imgUrl: '/images/events/2023/event230512/gift_38.png'},
    {type: '41', name: '네스프레소 버츄오커피머신', price: 200000, caption: '네스프레소<br />버츄오커피머신',  imgUrl: '/images/events/2023/event230512/gift_39.png'},
    {type: '42', name: '에이지알 뷰티 디바이스', price: 200000, caption: '에이지알<br />뷰티 디바이스',  imgUrl: '/images/events/2023/event230512/gift_40.png'},

    {type: '43', name: '갤럭시 워치5 40mm', price: 300000, caption: '갤럭시<br />워치5 40mm',  imgUrl: '/images/events/2023/event230512/gift_41.png'},
    {type: '44', name: '롯데모바일교환권 30만원권', price: 300000, caption: '롯데모바일교환권<br />30만원권',  imgUrl: '/images/events/2023/event230512/gift_42.png'},
    {type: '45', name: '신세계 상품권 30만원권', price: 300000, caption: '신세계 상품권<br />30만원권',  imgUrl: '/images/events/2023/event230512/gift_43.png'},
    {type: '46', name: 'LG 디오스 와인셀러', price: 300000, caption: 'LG<br />디오스 와인셀러',  imgUrl: '/images/events/2023/event230512/gift_44.png'},
    {type: '47', name: '샘소나이트 노트북 가방', price: 300000, caption: '샘소나이트<br />노트북 가방',  imgUrl: '/images/events/2023/event230512/gift_45.png'},
    {type: '48', name: '발뮤다 토스터기', price: 300000, caption: '발뮤다<br />토스터기',  imgUrl: '/images/events/2023/event230512/gift_46.png'},
    {type: '49', name: '마샬 와이어리스 이어폰', price: 300000, caption: '마샬<br />와이어리스 이어폰',  imgUrl: '/images/events/2023/event230512/gift_47.png'},
    {type: '50', name: '아메리칸 투어리스터 캐리어', price: 300000, caption: '아메리칸 투어리스터<br />캐리어',  imgUrl: '/images/events/2023/event230512/gift_48.png'},

    {type: '51', name: 'LG 코드제로 A9 청소기', price: 500000, caption: 'LG<br />코드제로 A9 청소기',  imgUrl: '/images/events/2023/event230512/gift_49.png'},
    {type: '52', name: '다이슨 에어랩 멀티스타일러', price: 500000, caption: '다이슨<br />에어랩 멀티스타일러',  imgUrl: '/images/events/2023/event230512/gift_50.png'},
    {type: '53', name: '신세계 상품권 50만원권', price: 500000, caption: '신세계 상품권<br />50만원권',  imgUrl: '/images/events/2023/event230512/gift_51.png'},
    {type: '54', name: '삼성 비스포크 제트 청소기', price: 500000, caption: '삼성<br />비스포크 제트 청소기',  imgUrl: '/images/events/2023/event230512/gift_52.png'},
    {type: '55', name: 'LG 퓨리케이 공기청정기', price: 500000, caption: 'LG<br />퓨리케어 공기청정기',  imgUrl: '/images/events/2023/event230512/gift_53.png'},
    {type: '56', name: '삼성 직화오븐 비스포트35L', price: 500000, caption: '삼성<br />직화오븐 비스포크35L',  imgUrl: '/images/events/2023/event230512/gift_54.png'},
    {type: '57', name: '삼성 비스포크 제트봇', price: 500000, caption: '삼성<br />비스포크 제트봇',  imgUrl: '/images/events/2023/event230512/gift_55.png'},
    {type: '58', name: 'LG 프라엘 BLP1', price: 500000, caption: 'LG<br />프라엘 BLP1',  imgUrl: '/images/events/2023/event230512/gift_56.png'},

];

const PRODUCT_PER_TYPE_MAP = {};
for (let i=0,size=PRODUCT_LIST.length; i<size; i++) {
    let product = PRODUCT_LIST[i];
    PRODUCT_PER_TYPE_MAP[product.type] =  product;
}

const PRODUCT_LIST_PER_PRICE_MAP = {
    '10000': PRODUCT_LIST.filter(item => item.price === 10000),
    '30000': PRODUCT_LIST.filter(item => item.price === 30000),
    '50000': PRODUCT_LIST.filter(item => item.price === 50000),
    '100000': PRODUCT_LIST.filter(item => item.price === 100000),
    '200000': PRODUCT_LIST.filter(item => item.price === 200000),
    '300000': PRODUCT_LIST.filter(item => item.price === 300000),
    '500000': PRODUCT_LIST.filter(item => item.price === 500000),
};

class Event extends Component {
    state = {
        eventId1: 450,
        eventProgress1: false,  // 1번 이벤트 진행여부
        eventEnded1: false,      // 1번 이벤트 종료 여부
        eventId2: 451,
        eventProgress2: false,  // 2번 이벤트 진행여부
        eventEnded2: false,      // 2번 이벤트 종료 여부
        isEventApply : false,       // 신청여부
        eventUrl: (isProd() ? 'https://mv.vivasam.com' : 'https://dev-mv.vivasam.com' ) + '/#/saemteo/event/view/449',
        webUrl: (isProd() ? 'https://www.vivasam.com' : 'https://dev.vivasam.com') + '/event/2023/viewEvent449',
        showInstructorPop1: false,
        showInstructorPop2: false,
        showInstructorPop3: false,
        showInstructorPop4: false,

        showInstructorPop5: false,

        memberRegType: null,
        recoCode: null,
        recommendationList: [],
        recommendationCount: '0',
        totalPoint: '0',
        reco: '',


        currentProdType : '',
        currentProd: null,
        currentProdCnt: 0,

        productCntMap: {},
        applyPoint: 0,
    }

    componentDidMount = async () => {
        let qs = queryString.parse(this.props.location.search);

        const {BaseActions} = this.props;
        BaseActions.openLoading();
        try {
            await this.eventApplyCheck();

            // 추천인 코드 조회
            await this.getRecommendationInfo();

            await this.chkEvent1Progress();
            await this.chkEvent2Progress();

            // 추천인 코드 설정
            if (qs.reco) {
                this.setState({
                    reco: qs.reco
                });
            }

        } catch (e) {
            console.log(e);
            common.info(e.message);
        } finally {
            setTimeout(() => {
                BaseActions.closeLoading();
            }, 1000);//의도적 지연.
        }

        // 포인트 꿀팁
        this.instructorPopRef1 = React.createRef();
        // 추천가입자 목록
        this.instructorPopRef2 = React.createRef();
        // 로그인/회원가입 창
        this.instructorPopRef3 = React.createRef();
        // 선물고르기 팝업
        this.instructorPopRef4 = React.createRef();
        // 선물 수량 팝업
        this.instructorPopRef5 = React.createRef();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.showInstructorPop1 && this.state.showInstructorPop1) {
            this.instructorPopRef1.current.scrollIntoView({
                behavior: "smooth",
            });
        }

        if (!prevState.showInstructorPop2 && this.state.showInstructorPop2) {
            this.instructorPopRef2.current.scrollIntoView({
                behavior: "smooth",
            });
        }
        if (!prevState.showInstructorPop3 && this.state.showInstructorPop3) {
            this.instructorPopRef3.current.scrollIntoView({
                behavior: "smooth",
            });
        }
        if (!prevState.showInstructorPop4 && this.state.showInstructorPop4) {
            this.instructorPopRef4.current.scrollIntoView({
                behavior: "smooth",
            });
        }
        if (!prevState.showInstructorPop5 && this.state.showInstructorPop5) {
            this.instructorPopRef5.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }

    // 기 신청 여부 체크
    eventApplyCheck = async () => {
        const {logged, eventId} = this.props;

        if (logged) {
            const response = await api.chkEventJoin({eventId: this.state.eventId2});

            if (response.data.eventJoinYn === 'Y') {
                this.setState({
                    isEventApply: true
                });
            }
        }
    }

    getRecommendationInfo = async () => {
        const {logged} = this.props;
        if (logged) {
            const response = await api.getRecommendationInfo();
            const data = response.data;

            // 숫자 3자리 comma
            const regexp = /\B(?=(\d{3})+(?!\d))/g;
            this.setState({
                memberRegType: data.memberRegType,
                recoCode: data.recoCode,
                recommendationList: data.recommendationList,
                recommendationCount: data.recommendationCount,
                totalPoint: data.totalPoint,
            });
        }
    }

    chkEvent1Progress = async () => {
        const response = await api.chkEventProgress(this.state.eventId1);
        this.setState({
            eventProgress1: response.data.progress,
            eventEnded1: response.data.ended
        });
    }

    chkEvent2Progress = async () => {
        const response = await api.chkEventProgress(this.state.eventId2);
        this.setState({
            eventProgress2: response.data.progress,
            eventEnded2: response.data.ended
        });
    }

    formatNumber = (num) => {
        const regexp = /\B(?=(\d{3})+(?!\d))/g;
        return num.toString().replace(regexp, ',');
    }

    registerRecoCode = async (cb) => {
        const {logged} = this.props;
        if (logged) {
            const response = await api.registerMemberRecoCode();
            if (response.data.code === '0') {
                this.setState({
                    recoCode: response.data.recoCode
                });
            }

            cb(response.data.recoCode);
        }
    }

    // 전제 조건
    prerequisite = () => {
        const {logged, history, BaseActions, loginInfo} = this.props;
        const {isEventApply} = this.state;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }
        if (this.state.memberRegType === 'B001') {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            // 준회원 여부
            if (loginInfo.mLevel !== 'AU300') {
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요(1544-7714)");
                return false;
            }
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.");
            return false;
        }

        return true;
    }

    // 참여하기 버튼 클릭, eventApply로 이동
    eventApply = async () => {
        const {SaemteoActions, eventId, handleClick, event} = this.props;

        if (!this.prerequisite()) {
            return;
        }

        try {
            event.amountMap = {
                ...this.state.productCntMap
            };
            event.applyPoint = this.state.applyPoint;

            SaemteoActions.pushValues({type: "event", object: event});

            handleClick(eventId);    // 신청정보 팝업으로 이동
        } catch (e) {
            console.log(e);
        } finally {
            setTimeout(() => {
            }, 1000);//의도적 지연.
        }
    }

    // popup 보이기
    showInstructorPop = (idx) => {
        let key = 'showInstructorPop' + idx;
        this.setState({
            [key]: true
        });
    };

    // popup 닫기
    hideInstructorPop = (idx) => {
        let key = 'showInstructorPop' + idx;
        this.setState({
            [key]: false
        });
    }

    moveToLogin = () => {
        const {history, BaseActions} = this.props;
        BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
        history.push("/login");
    }

    moveToJoin = () => {
        const {logged, history} = this.props;

        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        if (logged) {
            common.info("이미 비바샘 회원입니다. \n다른 동료 선생님께 비바샘을 추천해주세요.");
            return;
        }

        history.push("/join/select?via=event&reco=" + this.state.reco);
    }

    checkQualification = async (cb) => {
        const {logged, loginInfo, history, BaseActions} = this.props;
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        if (this.state.memberRegType !== 'A001') {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                common.info("교사 인증 후 이벤트에 참여해 주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }
        }

        if (!this.state.recoCode) {
            await this.registerRecoCode(cb);
        } else {
            cb(this.state.recoCode);
        }
    }


    handleClickSenKakaoFeed = () => {
        const {logged} = this.props;
        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        if (logged) {
            this.sendKakaoFeed()
        } else {
            this.showInstructorPop(3);
        }
    }

    handleClickCopyRecoCode = () => {
        const {logged} = this.props;
        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        if (logged) {
            this.copyRecoCode()
        } else {
            this.showInstructorPop(3);
        }
    }

    sendKakaoFeed = async () => {
        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        this.checkQualification((recoCode) => {

            let webUrl = this.state.webUrl + '?reco=' + recoCode;
            let mobileWebUrl = this.state.eventUrl + '?reco=' + recoCode + '&type=d';
            let prefix = isProd() ? '' : '개발 - '
            window.Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: '스승의 날 선물 대잔치 (추천코드: ' + recoCode + ')',
                    description: prefix + '아래의 링크로 추천 코드를 입력하고 비바샘에 가입하세요.\n추천하신 선생님과 가입하신 선생님 모두 경품으로 교환 가능한 1만 포인트를 드립니다!\n추천 코드는 ' + recoCode + ' 입니다.',
                    imageUrl: 'https://dn.vivasam.com/VS/EVENT/kakaoscrap/gift_party2.jpg',
                    link: {
                        webUrl: webUrl,
                        mobileWebUrl: mobileWebUrl
                    },
                },
                buttons: [
                    {
                        title: '가입하고 포인트받기',
                        link: {
                            webUrl: webUrl,
                            mobileWebUrl: mobileWebUrl
                        },
                    }
                ]
            })
        });

    }

    copyRecoUrl = () => {
        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        this.checkQualification((recoCode) => {
            let aux = document.createElement("input");
            aux.setAttribute("value", this.state.eventUrl + '?reco=' + recoCode + '&type=d');
            document.body.appendChild(aux);
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
            common.info('추천링크가 복사되었습니다.');
        });
    }

    copyRecoCode = () => {
        if (this.state.eventEnded1) {
            common.info('포인트 받는 기간이 종료되었습니다.')
            return;
        }

        this.checkQualification((recoCode) => {
            let aux = document.createElement("input");
            aux.setAttribute("value", recoCode);
            document.body.appendChild(aux);
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
            common.info('추천코드는 ' + recoCode + ' 입니다.\n동료 선생님이 회원 가입 시, 회원 정보에 추천코드를 입력하면 함께 포인트가 적립됩니다.');
        });
    }

    showProductCntPop = (productType) => {
        if (this.state.isEventApply) {
            return;
        }

        // 팝업 보이기, 선택한 상품 조회
        const currentProd = PRODUCT_PER_TYPE_MAP[productType];
        if (this.state.totalPoint < currentProd.price) {
            return;
        }

        let cnt = this.state.productCntMap[productType];
        if (!cnt) cnt = 0;
        this.setState({
            showInstructorPop5: true,
            currentProd: currentProd,
            currentProdType: productType,
            currentProdCnt: cnt
        });
    }

    confirmProductCnt = () => {
        // 변경된 수량 적용
        let newMap = {
            ...this.state.productCntMap,
        };
        newMap[this.state.currentProdType] = this.state.currentProdCnt;

        // 상품 전체 포인트 계산
        let applyPoint = 0;
        for (let prodType in newMap) {
            let product = PRODUCT_PER_TYPE_MAP[prodType];
            applyPoint += product.price * newMap[prodType];
        }

        this.setState({
            showInstructorPop5: false,

            currentProdType: '',
            currentProd: null,
            currentProdCnt: 0,

            productCntMap: newMap,
            applyPoint: applyPoint
        });

    }

    hideProductCntPop = () => {
        this.setState({
            showInstructorPop5: false,
            currentProdType: '',
            currentProd: null,
            currentProdCnt: 0,
        });
    }

    minusProduct = () => {
        let cnt = this.state.currentProdCnt;
        if (!cnt) cnt = 0;

        if (cnt > 0) {
            cnt--;
            this.setState({
                currentProdCnt : cnt
            });
        }
    }

    plusProduct = () => {
        let cnt = this.state.currentProdCnt;
        if (!cnt) cnt = 0;

        if (cnt < 99) {
            cnt++;
            this.setState({
                currentProdCnt : cnt
            });
        }
    }

    // 신청상품 수량 포인트 조회
    buildApplyTotalPoint = () => {
        const applyTotalPoint = this.state.applyPoint;

        let applyTotalPointStr;
        if (applyTotalPoint > 0) {
            applyTotalPointStr = applyTotalPoint.toString();
            if (applyTotalPointStr.length < 6) {
                applyTotalPointStr = applyTotalPointStr.padStart(6, 0);
            }
        } else {
            applyTotalPointStr = '000000';
        }

        let pointAtIdx;
        let html = '<strong>';
        for (let i = 0, size = applyTotalPointStr.length; i < size; i++) {
            let lastLength = size - i;

            pointAtIdx = applyTotalPointStr.charAt(i);
            if (lastLength > 4) {
                if (this.state.totalPoint < this.state.applyPoint) {
                    html += '<span class="on">' + pointAtIdx + '</span>';
                } else {
                    html += '<span>' + pointAtIdx + '</span>';
                }
            } else {
                html += '<span>' + pointAtIdx + '</span>';
            }
        }
        html += '</strong>';
        return html;
    }

    handleBtnApply = () => {
        const {logged, history, BaseActions} = this.props;
        const {isEventApply} = this.state;

        if (this.state.eventEnded2) {
            common.info('이벤트가 종료되었습니다.');
            return;
        }

        if (!this.state.eventProgress2) {
            common.info('5월 30일(화) 9시부터 신청 가능합니다.');
            return;
        }

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 참여해 주세요.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return;
        }

        // 기 신청 여부
        if (isEventApply) {
            common.error("이미 신청하셨습니다.\n선물 신청은 5.30(화)~6.5(월) 기간 내 1회만 가능합니다.");
            return;
        }

        if (this.state.totalPoint === 0) {
            common.info("선물 신청은 포인트가 있는 회원만 가능합니다.");
            return;
        }

        if (this.state.applyPoint === 0) {
            common.info("선물을 선택하세요.");
            return;
        }

        if (this.state.totalPoint < this.state.applyPoint) {
            common.info("포인트가 초과되었습니다.");
            return;
        }

        if (this.state.totalPoint > this.state.applyPoint) {
            // 잔여 포인트가 남았습니다.
            this.showInstructorPop(4);
            return ;
        }

        this.eventApply();

    }

    render() {
        const {logged} = this.props;

        return (
            <section className="event230512">
                {/*popup*/}
                <div id="eventPopWrap"
                     ref={this.instructorPopRef1}
                     className={this.state.showInstructorPop1? 'on' : ''}>
                    <div className="dimed"></div>
                    {/* 클래스 추가 .pop1 포인트 사용 꿀팁 */}
                    <div className="eventPop pop_type02 pop1">
                        <div className="titWrap">
                            <div className="tit">
                                <span>포인트 사용 꿀팁!</span>
                            </div>
                            <button type="button" className="evtPopClose" onClick={() => {this.hideInstructorPop(1)}}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                <div className="popInfoWrap">
                                    {/*<p>예시를 참고하여 선물을 다양하게 구성해 보세요.</p>*/} 
                                    <img src="/images/events/2023/event230512/tip.jpg" alt="포인트 사용 꿀팁 예시" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    id="eventPopWrap"
                    ref={this.instructorPopRef2}
                    className={this.state.showInstructorPop2? 'on' : ''}>
                    <div className="dimed"></div>

                    {/* 클래스 추가 .pop2 포인트 사용 꿀팁 */}
                    <div className="eventPop pop_type02 pop2">
                        <div className="titWrap">
                            <div className="tit">
                                <span>내가 초대한 선생님</span>
                            </div>
                            <button type="button" className="evtPopClose" onClick={() => {this.hideInstructorPop(2)}}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                <div className="table_box">
                                    <table width="100%" cellPadding="0" cellSpacing="0">
                                        <colgroup>
                                            <col width="calc(33.3333% - 7%)" />
                                            <col width="33.3333%" />
                                            <col width="33.3333%" />
                                            <col width="7%" />
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th scope="col">이름</th>
                                            <th scope="col">휴대폰 번호</th>
                                            <th scope="col" colSpan="2">아이디</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            (this.state.recommendationList && this.state.recommendationList.length > 0)
                                            ?
                                            this.state.recommendationList.map((item, index) => {
                                                return (
                                                    <tr key={index} className={item.state === 'D' ? 'on' : ''}>
                                                        <td scope="col" className="name">{item.name}</td>
                                                        <td scope="col" className="phone">{item.cellphone}</td>
                                                        <td scope="col" className="userid">{item.memberId}</td>
                                                        {
                                                            item.state === 'D' && (<td scope="col" className="none_user"><span>탈퇴</span></td>)
                                                        }
                                                    </tr>
                                                );
                                            })
                                            :
                                            <tr>
                                                <td scope="col" colSpan={4} className="visit_none">아직 초대한 선생님이 없습니다.</td>
                                            </tr>
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 로그인 팝업 */}
                <div
                    id="eventPopWrap"
                    ref={this.instructorPopRef3}
                    className={this.state.showInstructorPop3? 'on' : ''}>
                    <div className="dimed"></div>
                    <div className="eventPop pop_type03 pop3">
                        <div className="titWrap">
                            <button type="button" className="evtPopClose" onClick={() => {this.hideInstructorPop(3)}}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                {/* 로그인 전 */}
                                <div className="log_before">
                                    <p><strong>로그인 후 이용 가능합니다.</strong></p>
                                    <p>아직 비바샘 회원이 아니시라면,<br />
                                        지금 바로 회원가입을 진행해 주세요.</p>
                                    <div className="cont_flex">
                                        <button type="button" className="btnPopApply btnPopApply02" onClick={this.moveToLogin}><span className="blind">로그인하기</span></button>
                                        <button type="button" className="btnPopApply" onClick={this.moveToJoin}><span className="blind">가입하기</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 선물 고르기 팝업 */}
                <div
                    id="eventPopWrap"
                    ref={this.instructorPopRef4}
                    className={this.state.showInstructorPop4? 'on' : ''}>
                    <div className="dimed"></div>
                    <div className="eventPop pop_type03 pop4">
                        <div className="titWrap">
                            <button type="button" className="evtPopClose" onClick={() => {this.hideInstructorPop(4)}}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                {/* 로그인 후*/}
                                <div className="log_after">
                                    <p><strong>아직 사용 가능한 포인트가 남았습니다.</strong></p>
                                    <p>선물 신청은 선물 고르기 기간 내<br />
                                        1회만 가능합니다.</p>
                                    <div className="cont_flex">
                                        <button type="button" className="btnPopApply btnPopApply02" id="giftApply" onClick={() => {this.hideInstructorPop(4)}}><span className="blind">선물 다시 고르기</span></button>
                                        <button type="button" className="btnPopApply" id="giftChoice" onClick={this.eventApply}><span className="blind">선물<br /> 바로 신청하기</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 선물 수량 팝업 */}
                <div
                    id="eventPopWrap"
                    ref={this.instructorPopRef5}
                    className={this.state.showInstructorPop5 ? 'on' : ''}>
                    <div className="dimed"></div>
                    <div className="eventPop pop_type03 pop5">
                        <div className="titWrap">
                            <button type="button" className="evtPopClose" onClick={this.hideProductCntPop}><span className="blind">팝업 닫기</span></button>
                        </div>
                        <div className="contWrap">
                            <div className="popInfoWrap">
                                <div className="countbox">
                                    <p><strong>수량을 입력해 주세요.</strong></p>
                                    <fieldset className="cont_flex">
                                        <button type="button" className="countBtn minus" onClick={this.minusProduct}></button>
                                        <input type="text" name="gift_num" className="giftNum" value={this.state.currentProdCnt} readOnly="readonly" />
                                        <button type="button" className="countBtn plus" onClick={this.plusProduct}></button>
                                    </fieldset>
                                </div>
                                {/*//countbox*/}
                                <div className="cont_flex countbox_btn">
                                    <button type="button" className="count_btn" onClick={this.confirmProductCnt}><span className="blind">확인</span></button>
                                    <button type="button" className="count_btn02" onClick={this.hideProductCntPop}><span className="blind">취소</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* content */}
                {/*<span className="evtCon"><em className="blind">이벤트 신청 시 비바콘 100콘 적립</em></span>*/}
                <div className="evtCont01">
                    <div className="evtTitWrap">
                        <div className="evtTit01">
                            <img src="/images/events/2023/event230512/evtCont01.jpg" alt="스승의 날 선물 대잔치" />
                            <p className="evtinfoText">
                                * 선물 고르기는 5.30(화) 오전 9시부터 가능합니다.
                            </p>
                            <div className="blind">
                                <span>추천하면 할수록 쏟아지는 선물 - </span>
                                <h1>스승의날 선물 대잔치</h1>
                                <p>
                                    동료 선생님께 비바샘을 추천해 주세요.
                                    초대 받은 선생님이 회원가입 후 교사인증 하시면
                                    초대/신규 가입한 선생님 모두 1만 포인트씩 드립니다.
                                </p>

                                <ul>
                                    <li><span>포인트 받기</span> 5.12(금) ~ 25일(목)</li>
                                    <li><span>선물 고르기</span> 5.30(화) ~ 6.5일(월)</li>
                                </ul>

                                <ul>
                                    <li><strong>비바샘 회원이면 누구나 참여 가능</strong></li>
                                    <li><strong>지금 회원가입한 선생님도 1만 포인트</strong></li>
                                    <li><strong>쌓은 포인트로 경품 고르는 재미</strong></li>
                                </ul>
                            </div>
                        </div>
                        {/* evtTit02 */}
                        <div className="evtTit02">
                            <div className="inner">
                                <h3><span className="blind">포인트 받는 방법</span></h3>
                                <ul className="cont_flex">
                                    <li>
                                        <button type="button" className="btnCont01 kakaoSns" onClick={this.handleClickSenKakaoFeed}>
                                            <span className="blind">카카오톡으로 추천하기 ></span>
                                        </button>
                                    </li>
                                    {/*<li>*/}
                                    {/*    <button type="button" className="btnCont02" onClick={() => {*/}
                                    {/*        if (logged) {*/}
                                    {/*            this.copyRecoUrl()*/}
                                    {/*        } else {*/}
                                    {/*            this.showInstructorPop(3);*/}
                                    {/*        }*/}
                                    {/*    }}>*/}
                                    {/*        <span className="blind">이벤트 공유하기</span>*/}
                                    {/*    </button>*/}
                                    {/*</li>*/}
                                    <li>
                                        <button type="button" className="btnCont03" onClick={this.handleClickCopyRecoCode}>
                                            <span className="blind">추천 코드 보내기 ></span>
                                        </button>
                                    </li>
                                    <li>
                                        <a className="btnCont04" onClick={this.moveToJoin}><span className="blind">비바샘 가입하기 ></span></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="evtCont02">
                    <div className="evtContsWrap">
                        <div className="evtCont">
                            <div className="giftHeader">
                                <div className="inner">
                                    <button type="button" className="btnInfo02" onClick={() => this.showInstructorPop(1)}><span className="blind">포인트 사용 꿀팁!</span></button>
                                    <div className="pointBox">
                                        {/* 로그인 전 */}
                                        {
                                            !logged && (<p><a onClick={this.moveToLogin}>로그인</a>후 내 포인트를 확인하세요. {this.state.reco}</p>)
                                        }

                                        {/* 로그인 후 */}
                                        {
                                            logged && (
                                                <ul className="myPoint cont_flex">
                                                    <li>내 포인트 현황</li>
                                                    <li><strong>{this.formatNumber(this.state.totalPoint)}</strong></li>
                                                    <li><strong>{this.formatNumber(this.state.recommendationCount)}</strong> 명 가입</li>
                                                    <li><button type="button" className="btnInfo03" onClick={() => this.showInstructorPop(2)}><span className="blind">자세히 보기</span></button></li>
                                                </ul>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                            {/* giftCont*/}
                            <div className="giftCont">
                                <div className="inner">
                                    <p className="infogift">선물 이미지 선택하시면, 수량 입력이 가능합니다.</p>
                                    {/*만 단위 기프트 박스 그룹*/}
                                    <div className="gift_box01 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">1만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['10000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box2*/}
                                    <div className="gift_box02 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">3만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['30000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box3*/}
                                    <div className="gift_box03 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">5만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['50000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box4*/}
                                    <div className="gift_box04 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">10만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['100000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box5*/}
                                    <div className="gift_box05 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">20만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['200000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box6*/}
                                    <div className="gift_box06 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">30만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['300000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/*box7*/}
                                    <div className="gift_box07 cont_flex">
                                        <div className="gift_tit">
                                            <span className="blind">50만</span>
                                        </div>
                                        <div className="gift_list">
                                            <ul className="cont_flex">
                                                {
                                                    PRODUCT_LIST_PER_PRICE_MAP['500000'].map(item => {
                                                        const cnt = this.state.productCntMap[item.type];
                                                        return (
                                                            <li key={item.type}>
                                                                <a onClick={() => {this.showProductCntPop(item.type)}}>
                                                                    <figure>
                                                                        <img src={item.imgUrl} alt={item.name} />
                                                                        <span className={(cnt && cnt > 0)? 'on' : ''}>
                                                                            <span className="num">{(cnt && cnt > 0) ? 'x' + cnt : ''}</span>
                                                                        </span>
                                                                        <figcaption dangerouslySetInnerHTML={{__html: item.caption}}></figcaption>
                                                                    </figure>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                    {/* //box7*/}

                                    {/*선택한 총 포인트*/}
                                    <div className="point_box">
                                        <div className="point_box_bottom" dangerouslySetInnerHTML={{__html: this.buildApplyTotalPoint()}}>
                                            {/*<strong><span>0</span><span className="on">1</span><span>0</span><span>0</span><span>0</span><span>0</span></strong>*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="evtbtn">
                        <div className="inner">
                            <button type="button" className="btnApply" onClick={this.handleBtnApply}>
                                <span className="blind">선물 신청 완료</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="notice">
                    <strong>이벤트 안내</strong>
                    <ul className="evtInfoList">
                        <li>① 본 이벤트는 회원가입 마지막 단계인 회원 정보에 추천 코드 입력 및 <br />교사인증 완료 시 초대/신규 선생님께 1만 포인트씩 제공하는 이벤트 입니다. (이벤트 초대 가능 인원수 : 무제한)</li>
                        <li>② 선물은 소지한 포인트 내에서 종류 상관 없이 선택 가능합니다.</li>
                        <li>③ 포인트는 로그인 후 이벤트 페이지 내에서 확인 가능하며, 초대 받은 선생님이 교사인증까지 완료하셔야 지급됩니다.</li>
                        <li>④ 기존 회원이 탈퇴 후 재가입을 하게 될 경우, 기존 포인트 및 활동 이력은 모두 삭제되며 선물 신청이 제한될 수 있으므로 신중히 탈퇴해 주세요.</li>
                    </ul>
                </div>

                <div className="notice02">
                    <strong>유의사항</strong>
                    <ul className="evtInfoList">
                        <li>· 포인트는 선물 교환 기간 내 소진해야 하며, 선물 고르기는 교환 기간 내<br /> 1회만 가능합니다</li>
                        <li>· 본 이벤트에서는 비바콘은 지급되지 않습니다.</li>
                        <li>· 이벤트 종료 또는 기간 내 탈퇴 시, 적립된 포인트는 자동 소멸 됩니다.</li>
                        <li>· 이벤트 기간 내 탈퇴한 아이디의 추천코드는 무효처리 되어, 해당 추천코드를 입력하고 가입한 회원에게 제공된 포인트도 무효 처리됩니다.</li> 
                        <li>· 선물은 6월 12일~16일 순차 배송됩니다.</li>
                        <li>· 개인정보 오기재로 인한 선물 재발송은 불가합니다.</li>
                        <li>· 선물 발송을 위해 개인정보(성명, 주소, 연락처)가 서비스사에 제공됩니다.</li>
                        <li>· ㈜카카오 사업자등록번호 120-81-47521), (㈜모바일이앤엠애드 사업자등록번호 215-87-19169), (㈜CJ대한통운 사업자등록번호 110-81-0503), (㈜다우기술 사업자등록번호: 220-81-02810)</li>
                        <li>· 5만 포인트를 초과하는 경품을 선택하실 경우, (주)비상교육에서 제세공과금 대납을 진행할 예정이며 이에 따라 제세공과금 22%가 포함된 금액으로 기타소득 신고가 진행될 예정입니다. 관련하여 세금 신고에 필요한 개인정보(주민등록번호, 주소 등)를 수급할
                            예정입니다. 주민등록번호는 상품자 정보 처리로 인해 받으며 이벤트 종료 후 일괄 폐기처분 됩니다.</li>
                        <li>· 선물은 이벤트 사정에 따라 동일 조건의 타 상품으로 변경될 수 있습니다.</li>
                        <li>· 이벤트는 상황에 따라 조기 종료될 수 있습니다.</li>
                    </ul>
                </div>
            </section>
        )
    }
}

//=============================================================================
// 댓글 목록 component
//=============================================================================

class EventListApply extends Component {

    constructor(props) {
        super(props);
        this.state = {
            member_id: this.props.member_id, // 멤버 아이디
            event_id: this.props.event_id, // eventId
            event_answer_desc: this.props.event_answer_desc, // 응답문항
            reg_dttm: this.props.reg_dttm, // 등록일
            BaseActions: this.props.BaseActions, // BaseAction
            eventType: "", // 이벤트 타입
            eventName: "", // 이벤트 응모자
            eventRegDate: "", // 이벤트 등록일
            eventContents: "", // 이벤트 내용
            eventLength: "", // 이벤트 길이
            indexNum: this.props.indexNum,
        }
    }

    componentDidMount = () => {
        this.eventListApply();
    };

    eventListApply = () => { // 이벤트 표시 값 세팅

        let eventSetName = JSON.stringify(this.state.member_id)
        eventSetName = eventSetName.substring(1, (eventSetName.length-4)) + "***"; // 이벤트 참여자 아이디
        let eventSetContentLength = JSON.stringify(this.state.event_answer_desc).length;
        let answers = JSON.stringify(this.state.event_answer_desc).substring(1, eventSetContentLength - 1).split('^||^');

        this.setState({
            eventName: eventSetName,
            event_answer_desc : answers[0],
        });
    };

    render() {
        return (
            <div className={"listItem" + " comment"  + " comment0" + this.state.indexNum}>
                <span className="user_name">{this.state.eventName + " 선생님"}</span>
                <p dangerouslySetInnerHTML={{__html: this.state.event_answer_desc}}></p>
            </div>
        );
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