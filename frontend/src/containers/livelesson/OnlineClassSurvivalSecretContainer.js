import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import * as viewerActions from 'store/modules/viewer';
import * as popupActions from 'store/modules/popup';
import {LiveLessonPopupContainer} from 'containers/livelesson';
import {fromJS} from "immutable";
import $ from "jquery";
import SubTabMenuOnlineClass from 'components/menu/SubTabMenuOnlineClass';
import {ScrollMenu} from 'components/common';
import * as common from 'lib/common'
import * as baseActions from 'store/modules/base';
import {SoobakcPopupContainer} from 'containers/soobakc'
import * as api from 'lib/api';

class OnlineClassSurvivalSecretContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            target : null,
            dataset : null,
            lpIdx : null,
            ldIdx : null,
            type : null,
            starPlyaerLicense : '31856D1F-57EA-415A-8DDA-6B86C978788E',
            tooltipActive: false,
            tabMenus: [],
            blindName: '',
            logged: false,
            translate: 0,
            liveScrollMenu: '',
            inFlexible:false,
            isOn: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.getTabMenu('all');
    }

    componentWillUpdate = () => {

    }

    getTabMenu = (tabName) => {
        let tabMenus;
        tabMenus = [{tabName:'all',text:'전체보기',isActive:false},
            {tabName:'zoom',text:'줌(Zoom) 활용',isActive:false},
            {tabName:'google',text:'구글 활용',isActive:false},
            {tabName:'vod',text:'동영상 제작',isActive:false},
            {tabName:'image',text:'이미지 제작',isActive:false},
            {tabName:'etc',text:'기타',isActive:false}];

        if(tabMenus){
            tabMenus = fromJS(tabMenus);
            tabMenus = tabMenus.update(
                tabMenus.findIndex(function(item) {
                    return item.get("tabName") === tabName;
                }), function(item) {
                    return item.set("isActive", true);
                }
            );
            if(this._isMounted){
                this.setState({
                    tabMenus : tabMenus.toJS()
                });
            }
        }

        let translate;
        let inFlexible;
        const selected = tabMenus.toJS().findIndex(el => el.isActive === true);

        this.setState({
            translate: translate,
            inFlexible: inFlexible
        });
    }

    handleSubTabMenuClick = (tabName) => {
        let tabMenus = this.state.tabMenus;
        for (let i=0; i<this.state.tabMenus.length; i++){
            let key = tabMenus[i].tabName;
            if (key === tabName){
                tabMenus[i].isActive = true;
            }else{
                tabMenus[i].isActive = false;
            }
        }
        this.setState({tabMenus: tabMenus});

        // 데이터 필터링 zoom google vod image etc
        $('.ocsw_tbl .zoom').hide();
        $('.ocsw_tbl .google').hide();
        $('.ocsw_tbl .vod').hide();
        $('.ocsw_tbl .image').hide();
        $('.ocsw_tbl .etc').hide();

        if(tabName === 'all'){
            $('.ocsw_tbl li').show();
        }else{
            $('.ocsw_tbl .'+tabName).show();
        }

        $('.ocsw_tbl_top').hide();

        if(tabName === 'all'){
            $('.ocsw_tbl_top.'+tabName).show();
        }else{
            $('.ocsw_tbl_top.'+tabName).show();
        }

        // 스크롤 위치 초기화
        window.scrollTo(0, 180);
    }

    handleTooltip = () => {
        const { isOn } = this.state;
        this.setState({
            isOn: !isOn
        })
    }

    openViewer = (e) => {
        const { logged , history, PopupActions, BaseActions} = this.props;
        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        } else {
            let targetNode = e.target;
            if(targetNode.tagName.toUpperCase() === 'SPAN' || targetNode.tagName.toUpperCase() === 'BUTTON') {
                targetNode = targetNode.parentNode;
            }
            e.preventDefault();
            gtag('event', '온라인 교실 생존비법', {
                'parameter': '수업혁신',
                'parameter value': targetNode.dataset.name
            });
            this.setState({
                target : targetNode,
                dataset : targetNode.dataset
            })
            PopupActions.openPopup({title:'데이터 사용안내', componet:<LiveLessonPopupContainer activeViewer={this.activeViewer}/>});
        }
    }

    activeViewer = () => {
        const {PopupActions, ViewerActions} = this.props;
        const {target, dataset} = this.state;
        PopupActions.closePopup();
        ViewerActions.openViewer({title:dataset.name, target:target});
    }

    openLayer = (e) => {
        var targetNode = ReactDOM.findDOMNode(e.target);
        if("allMenu_back_help icon_help" === targetNode.className) {
            targetNode.className = "allMenu_back_help icon_help active";
        } else {
            targetNode.className = "allMenu_back_help icon_help";
        }

        if(this.state.tooltipActive) {
            this.setState({
                tooltipActive : false
            })
        } else {
            this.setState({
                tooltipActive : true
            })
        }
    }

    onPlayer = (e) => {
        e.preventDefault();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        let vm = this;
        const { logged, PopupActions, loginInfo, history, BaseActions} = this.props;

        if(!logged) {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
        } else {

            let targetNode = e.target;
            if (targetNode.tagName.toUpperCase() === 'SPAN' || targetNode.tagName.toUpperCase() === 'BUTTON') {
                targetNode = targetNode.parentNode;
            }

            // 권한 체크
            // 준회원일 경우 신청 안됨.
            if(loginInfo.mLevel != 'AU300'){
                common.info("준회원은 이용이 불가능합니다.\n비바샘으로 문의해 주세요. (1544-7714)");
                return false;
            }
            // 교사 인증
            if(loginInfo.certifyCheck === 'N'){
                BaseActions.pushValues({type:"returnUrl", object:window.location.hash.replace('#','')});
                common.info("교사 인증 후 이벤트 참여를 해주세요.");
                window.location.hash = "/login/require";
                window.viewerClose();
                return false;
            }

            gtag('event', '온라인 교실 생존비법', {
                'parameter': '수업혁신',
                'parameter_value': targetNode.dataset.name
            });

            this.setState({
                target: targetNode,
                dataset: targetNode.dataset,
                type: 'L'
            });

            let permissionCheck = true;

            api.hasDataNetworkPermission().then((hasPermission) => {
                if (!hasPermission) {
                    if (window.confirm('데이터 네트워크 차단 상태입니다. 데이터 네트워크를 사용하시겠습니까?\n(사용중인 데이터 요금제에 따라 데이터 통화료가 부과될 수 있습니다.)')) {
                        //TODO 설정 창으로 이동시켜 줘야 함. 혹은 메시지 변경
                        permissionCheck = false;
                    }
                } else {

                }
            });

            if (permissionCheck) PopupActions.openPopup({
                title: "데이터 사용안내",
                componet: <SoobakcPopupContainer playViewer={this.streamingStarPlayer}/>
            });
        }
    }

    streamingStarPlayer = () => {
        const { PopupActions, loginInfo } = this.props;
        PopupActions.closePopup();
        var sp = this.StarPlayerApp();
        sp.license = "31856D1F-57EA-415A-8DDA-6B86C978788E";
        sp.version = "1.0.0"; // iOS, Android에서 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다.
        sp.android_version = "1.0.0"; // 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다. (android 전용)
        sp.ios_version = "1.0.0"; // 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다. (iOS 전용)
        sp.pmp = "true";
        sp.referer_return = "true";
        sp.referer = "mVivasamApp://m.vivasam.com?userId=xxxxxx&result=1";

        var app = function(info_url) {
            sp.executeApp(info_url);
            return false;;
        }

        var starStreaming = "";
        starStreaming = window.location.hostname;

        if(window.location.port !== 80 && window.location.port !== '')
        {
            starStreaming += ":" + window.location.port;
        }

        var _url2 = this.state.dataset.src;

        //L7 도메인에서 redirect 되어 replace 진행
        //_url2 =  _url2.replace("mi-visangst.xcdn.uplus.co.kr","soobakc-visang.cdn.x-cdn.com");
        _url2 =  _url2.replace("mi-visangst.xcdn.uplus.co.kr","msoobakc02-visangmobile01.x-cdn.com");
        _url2 =  _url2.replace("http://","*\\*http:*\\*");
        _url2 =  _url2.replace("//","/");
        _url2 =  _url2.replace("*\\*http:*\\*","http://");

        app("https://" + starStreaming + '/api/soobakc/streamingStarplayer?license=31856D1F-57EA-415A-8DDA-6B86C978788E&memberId=' + loginInfo.memberId + '&content_id=100&content=' + decodeURIComponent(_url2)  +'&test=1&test2=2');
    }

    StarPlayerApp = () => {
        var STARPLAYER_APP_IPHONE_URL = "https://itunes.apple.com/kr/app/axis-starplayer/id598865744?mt=8";
        var STARPLAYER_APP_IPAD_URL = "https://itunes.apple.com/kr/app/axis-starplayerhd/id599892711?mt=8";
        var STARPLAYER_PLUS_APP_IOS_URL = "https://apps.apple.com/kr/app/id1474597276";
        var STARPLAYER_APP_INSTALL_ANDROID_URL = "market://details?id=com.axissoft.starplayer";
        var STARPLAYER_APP_INSTALL_CONFIRM = "[ StarPlayer App 설치 ]\n\n설치 페이지로 이동하시겠습니까?\n\n기존에 앱이 설치되어 있다면\n '취소'버튼을 선택해주세요.";
        var DataType = {};
        DataType.URL = 1;
        DataType.DATA = 2;
        var StarPlayerApp = {};
        var uagent = navigator.userAgent.toLocaleLowerCase();
        StarPlayerApp.android = (uagent.search("android") > -1 || uagent
            .search("linux") > -1);
        StarPlayerApp.mobile_mac = (uagent.search("mac os x") > -1
            && uagent.search("macintosh") > -1 && window.navigator.maxTouchPoints > 1);
        StarPlayerApp.ios = /ip(hone|od|ad)/.test(uagent) || StarPlayerApp.mobile_mac;
        StarPlayerApp.iphone = (uagent.search("iphone") > -1 || uagent.search("ipod") > -1);
        StarPlayerApp.ipad = (uagent.search("ipad") > -1);
        StarPlayerApp.safari = (uagent.search("safari") > -1);
        StarPlayerApp.chrome = (uagent.search("chrome") > -1 || uagent.search("crios") > -1);
        StarPlayerApp.opera = (uagent.search("opera") > -1);
        StarPlayerApp.windows = (uagent.search("windows") > -1 || uagent
            .search("wow64") > -1);
        StarPlayerApp.ios_sp_min_version = StarPlayerApp.mobile_mac ? "13.0.3"
            : "13.2.0";
        StarPlayerApp.iosVersion = function() {
            var c = null;
            var b;
            if (/ip(hone|od|ad)/.test(uagent)) {
                b = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                if (b != null) {
                    c = {
                        status : true,
                        major : parseInt(b[1], 10),
                        version : parseInt(b[1], 10) + "." + parseInt(b[2], 10) + "."
                            + parseInt(b[3] || 0, 10)
                    }
                }
            } else {
                if (StarPlayerApp.mobile_mac) {
                    if (uagent.search("version") > -1) {
                        var a = (navigator.appVersion)
                            .match(/(version)[/\s]([\d.]+)/ig);
                        b = a[0].match(/(\d+).(\d+).?(\d+)?/);
                        if (b != null) {
                            c = {
                                status : true,
                                major : parseInt(b[1], 10),
                                version : parseInt(b[1], 10) + "." + parseInt(b[2], 10)
                                    + "." + parseInt(b[3] || 0, 10)
                            }
                        }
                    }
                }
            }
            if (c == null) {
                c = {
                    status : false,
                    major : 0,
                    version : "0",
                    desc : "디바이스 정보를 가져올 수 없습니다.\n현재 사용하고 있는 브라우저 옵션에서 데스크탑 모드를 off 또는 모바일 모드로 변경하고 페이지를 새로고침 해주세요.\n같은 현상이 지속되면 사파리나 크롬 앱을 이용해 주세요."
                }
            }
            return c
        };
        StarPlayerApp.iosPlusIsAvailable = function() {
            var c = StarPlayerApp.iosVersion();
            if (c.major >= 13) {
                var a = c.version.replace(/\./gi, "");
                var b = StarPlayerApp.ios_sp_min_version.replace(/\./gi, "");
                if (a >= b) {
                    return true
                }
            }
            return false
        };
        StarPlayerApp.executeApp = function(d, b) {
            if (this.ios) {
                var e = StarPlayerApp.iosVersion();
                if (e.status == false) {
                    common.info(e.desc);
                    return false
                }
            }
            document.addEventListener(getVisibilityValue(), handleVisibilityChange,
                false);
            if (typeof this.referer == "undefined") {
                this.referer = window.location.href
            }
            var a = this.urlscheme(d, b);
            checkInstalled2();
            if (this.android) {
                var c = "starplayer://?" + a + "#Intent;";
                c += "scheme=starplayer;";
                c += "action=android.intent.action.VIEW;";
                c += "category=android.intent.category.BROWSABLE;";
                c += "package=com.axissoft.starplayer;end";
                window.parent.location.href = c
            } else {
                if (this.ios) {
                    if (this.opera) {
                        alert("사용하고 계신 환경(OS)에서는 지원되지 않습니다.")
                        //common.info("사용하고 계신 환경(OS)에서는 지원되지 않습니다.")
                    } else {
                        setTimeout(function() {
                            window.parent.location.href = a
                        }, 10)
                    }
                } else {
                    if (this.windows) {
                        setTimeout(function() {
                            window.parent.location.href = a
                        }, 10)
                    }
                }
            }
        };
        StarPlayerApp.urlscheme = function(c, b) {
            if (typeof b === "undefined") {
                b = DataType.URL
            }
            if (typeof this.license === "undefined") {
                alert("license 값이 설정되지 않았습니다.");
                return
            }
            if (typeof c === "undefined") {
                alert("data 값이 설정되지 않았습니다.");
                return
            }
            var a = "";
            if (b == DataType.URL) {
                a = this.url(c)
            } else {
                if (b == DataType.DATA) {
                }
            }
            return a
        };
        StarPlayerApp.url = function(c) {
            var a = "";
            if (this.ios) {
                if (this.iosPlusIsAvailable()) {
                    a += "starplayerplus://?"
                } else {
                    a += "starplayer://?"
                }
            } else {
                if (this.windows) {
                    a += "starplayer://?"
                }
            }
            a += "license=" + encodeURIComponent(this.license) + "&url="
                + encodeURIComponent(c);
            if (typeof this.referer !== "undefined") {
                a += "&referer=" + encodeURIComponent(this.referer)
            }
            if (typeof this.debug !== "undefined") {
                a += "&debug=" + this.debug
            } else {
                a += "&debug=false"
            }
            var b = false;
            if (this.android) {
                if (typeof this.android_version !== "undefined") {
                    a += "&version=" + this.android_version;
                    b = true
                }
            } else {
                if (typeof this.ios_version !== "undefined") {
                    a += "&version=" + this.ios_version;
                    b = true
                }
            }
            if (b == false) {
                if (typeof this.version !== "undefined") {
                    a += "&version=" + this.version
                } else {
                    a += "&version=1.0.0"
                }
            }
            if (typeof this.pmp !== "undefined") {
                a += "&pmp=" + this.pmp
            } else {
                a += "&pmp=true"
            }
            if (this.chrome) {
                a += "&from=chrome"
            } else {
                if (this.safari) {
                    a += "&from=safari"
                } else {
                    if (this.opera) {
                        a += "&from=opera"
                    } else {
                        a += "&from=none"
                    }
                }
            }
            if (this.android) {
                if (this.android_referer_return) {
                    a += "&android_referer_return=" + this.android_referer_return
                } else {
                    a += "&android_referer_return=false"
                }
            } else {
                if (this.referer_return) {
                    a += "&referer_return=" + this.referer_return
                } else {
                    a += "&referer_return=true"
                }
            }
            if (typeof this.offline_check !== "undefined") {
                a += "&offline_check=" + this.offline_check
            } else {
                a += "&offline_check=false"
            }
            if (typeof this.user_id !== "undefined") {
                a += "&user_id=" + this.user_id
            }
            return a
        };
        var checkInstalled = function() {
        };
        var agentCheck = function() {
            var a = "";
            if (StarPlayerApp.iosPlusIsAvailable()) {
                a = STARPLAYER_PLUS_APP_IOS_URL
            } else {
                if (StarPlayerApp.iphone === true) {
                    a = STARPLAYER_APP_IPHONE_URL
                } else {
                    if (StarPlayerApp.ipad === true) {
                        a = STARPLAYER_APP_IPAD_URL
                    } else {
                        if (StarPlayerApp.android === true) {
                            a = STARPLAYER_APP_INSTALL_ANDROID_URL
                        }
                    }
                }
            }
            return a
        };
        var checkInstalled2 = function() {
            if (StarPlayerApp.ios || StarPlayerApp.android) {
                var a = new Date;
                setTimeout(
                    function() {
                        var tempT = new Date();
                        if (tempT - a < 1600) {
                            var b = StarPlayerApp.iosPlusIsAvailable();
                            if (window.confirm(STARPLAYER_APP_INSTALL_CONFIRM)) {
                                if (!b && StarPlayerApp.mobile_mac) {
                                    window.location.href = STARPLAYER_APP_IPHONE_URL
                                } else {
                                    window.location.href = agentCheck()
                                }
                            }
                        }
                    }, 1500
                )
            }
        };
        function getHiddenValue() {
            if (typeof document.mozHidden !== "undefined") {
                return "hidden"
            } else {
                if (typeof document.msHidden !== "undefined") {
                    return "msHidden"
                } else {
                    if (typeof document.webkitHidden !== "undefined") {
                        return "webkitHidden"
                    } else {
                        if (typeof document.hidden !== "hidden") {
                            return "hidden"
                        }
                    }
                }
            }
        }
        function getVisibilityValue() {
            if (typeof document.mozHidden !== "undefined") {
                return "mozvisibilitychange"
            } else {
                if (typeof document.msHidden !== "undefined") {
                    return "msvisibilitychange"
                } else {
                    if (typeof document.webkitHidden !== "undefined") {
                        return "webkitvisibilitychange"
                    } else {
                        if (typeof document.hidden !== "hidden") {
                            return "visibilitychange"
                        }
                    }
                }
            }
        }
        function handleVisibilityChange() {
            if (!document[getHiddenValue()]) {
                var a = document.getElementsByClassName("starplayer_popup");
                if (a.length > 0) {
                    if (spDialog != null) {
                        spDialog.hide()
                    }
                }
            }
        }
        var isModalshowing = false;
        var modalViewStyleSheet;
        var spDialog;
        function StarPlayerDialog(q, h, b, r, g, p, d) {
            if (!arguments.length) {
                throw "StarPlayerDialog: No arguments were passed"
            }
            var m = this;
            var n = getModalTemplate();
            var a = n.querySelector(".stpp_title");
            var k = n.querySelector(".stpp_btn-close");
            var e = n.querySelector(".stpp_btn-yes");
            var l = n.querySelector(".stpp_btn-no");
            var f = n.querySelector(".stpp_body");
            a.innerHTML = q;
            f.innerHTML = h;
            e.innerHTML = b;
            l.innerHTML = r;
            k.addEventListener("click", i);
            l.addEventListener("click", j);
            e.addEventListener("click", c);
            if (d) {
                var o = document.createElement("DIV");
                n.appendChild(o);
                o.className = "stpp_overlay";
                o.addEventListener("click", i)
            }
            function i(s) {
                s.preventDefault();
                m.hide()
            }
            function c(s) {
                s.preventDefault();
                m.hide();
                if (typeof g === "function") {
                    g()
                }
            }
            function j(s) {
                s.preventDefault();
                m.hide();
                if (typeof p === "function") {
                    p()
                }
            }
            m.modal = n
        }
        StarPlayerDialog.prototype.show = function() {
            if (isModalshowing) {
                return
            }
            isModalshowing = true;
            document.body.appendChild(this.modal)
        };
        StarPlayerDialog.prototype.hide = function() {
            isModalshowing = false;
            this.modal.remove()
        };
        function getModalTemplate() {
            var b = document.getElementsByClassName("starplayer_popup");
            if (b.length > 0) {
                if (typeof this.modal != "undefined" && this.modal != null) {
                    this.modal.remove()
                }
            }
            var a;
            a = document.createElement("DIV");
            a.className = "starplayer_popup";
            a.innerHTML = " <div class='stpp_content'>		<header class='stpp_header'>			<h2 class='stpp_title'></h2>				<button class='stpp_btn-close'></button>		</header>		<div class='stpp_body'>	 </div> <footer class='stpp_footer'>		<button class='stpp_btn-no'></button>		<button class='stpp_btn-yes'></button> </footer>";
            if (!modalViewStyleSheet) {
                modalViewStyleSheet = document.createElement("style");
                modalViewStyleSheet.innerHTML = ".starplayer_popup { 		line-height: 1; 		position: fixed; 		z-index: 9999; 		top: 0; 		left: 0; 		right: 0; 		bottom: 0; 		font-family: arial, sans-serif; } .stpp_content { 		padding: 10px; 		background: #fff; 		border-radius: 4px; 		-webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.4); 		box-shadow: 0 0 10px rgba(0, 0, 0, 0.4); } .stpp_header { 		position: relative; 		display: flex; 		justify-content: space-between; } .stpp_title { 		margin: 0; 		flex: 1; 		font-size: 24px; 		text-align: center; } .stpp_body { 		margin: 10px; 		font-size: 16px; 		text-align: center; } .stpp_btn-close { 		position: absolute; 		top: 0; 		right: 0; 		width: 20px; 		height: 20px; 		padding: 0; 		font-size: 12px; 		font-weight: 700; 		text-align: center; 		background: none; 		border: 1px solid #000; 		border-radius: 50%; 		cursor: pointer; 		transition: all 0.4s;     line-height: 9px;     color: #000; } .stpp_btn-close:hover { 		opacity: 0.4; } .stpp_btn-close:before { 		content: 'X'; } .stpp_footer { 		margin-top: 20px; 		text-align: center; } .stpp_btn-yes, .stpp_btn-no { 		margin: 0 5px; 		padding: 4px 14px;  		font-size: 18px; 		border-radius: 20px; 		border: 1px solid #000; 		cursor: pointer;     line-height: 22px; 		transition: all 0.4s; 		width: auto!important; 		height: auto!important; } .stpp_btn-yes { 		background: #fff; 		color: #000; } .stpp_btn-no { 		background: #000; 		color: #fff; } .stpp_btn-yes:hover, .stpp_btn-no:hover { 		color: #000; 		border-color: transparent; 		background: rgba(0, 0, 0, 0.1); } .stpp_overlay { 		position: absolute; 		z-index: -1; 		top: 0; 		left: 0; 		right: 0; 		bottom: 0; 		background: rgba(0, 0, 0, 0.5); }";
                document.body.appendChild(modalViewStyleSheet)
            }
            return a.cloneNode(true)
        };

        return StarPlayerApp;
    }

    render() {
        const { tooltipActive } = this.state;
        const { tabName } = this.props;
        const { tabMenus, translate, inFlexible } = this.state;
        const tabMenuList = tabMenus.map(
            (tabMenu, index) => {
                const {tabName, text, isActive} = tabMenu;
                return (
                    <SubTabMenuOnlineClass
                        key = {tabName}
                        tabName={tabName}
                        text={text}
                        onTabMenuClick ={this.handleSubTabMenuClick}
                        isActive={isActive}
                    />
                )
            }
        );
        return (
            <div>
                <section className="online_class_survive_way">
                    <div className="ocsw_top">
                        <p className="top">재미있고 효과적인 온라인 수업 비법!</p>
                        <p>
                            미래교실네트워크의 전문가 선생님들이 온라인 수업에 유용하게 활용할 수 있는
                            핵심 팁을 직접 안내합니다.
                        </p>
                        {/* <a href="#">미래교실네트워크란?</a> */}
                        <div className="a_wrapper">
                            <div className="rightMenu">
                                <button type="button" className={`allMenu_back_help icon_help ${ this.state.isOn ? 'active' : '' }`} onClick={ this.handleTooltip }></button>
                            </div>
                            <div className="layer_help" style={{ display: this.state.isOn ? 'block': 'none' }}>
                                <div className="layer_help_box">
                                    <b>미래교실네트워크</b>
                                    <p className="layer_help_ment">
                                        “모두가 교육의 위기를 걱정할 때
                                        우린 그냥 희망을 만들기로 했습니다”
                                        미래교실네트워크는 수업을 통해 교육 혁신의 길을 만들어 가는 대한민국 선생님들의 모임입니다.
                                        바로 지금 교실에 적용 가능한 미래 교육 기법을 먼저 실현하고 널리 나누고 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab_wrap">
                        <ul className="tab tabMulti">
                            <ScrollMenu
                                ref="scrollmenu"
                                data={tabMenuList}
                                translate={translate}
                                innerWrapperClass={'scrollmenu'}
                            />
                        </ul>
                    </div>
                    <div className="ocsw_tbl_top all">
                        <b>전체보기</b>
                        (<span>50</span>)
                    </div>
                    <div className="ocsw_tbl_top zoom" style={{display:'none'}}>
                        <b>줌(Zoom) 활용</b>
                        (<span>10</span>)
                    </div>
                    <div className="ocsw_tbl_top google" style={{display:'none'}}>
                        <b>구글 활용</b>
                        (<span>18</span>)
                    </div>
                    <div className="ocsw_tbl_top vod" style={{display:'none'}}>
                        <b>동영상 제작</b>
                        (<span>6</span>)
                    </div>
                    <div className="ocsw_tbl_top image" style={{display:'none'}}>
                        <b>이미지 제작</b>
                        (<span>6</span>)
                    </div>
                    <div className="ocsw_tbl_top etc" style={{display:'none'}}>
                        <b>기타</b>
                        (<span>15</span>)
                    </div>

                    <ul className="ocsw_tbl">
                        <li className="google">
                            <h3 className="fir">1차시<em className="marker">박성광</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'쌍방향 온라인 수업 맛보기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비01_박성광_쌍방향 온라인 수업 맛보기 0921.m4v'} onClick={this.openViewer}>
                                <span className="tl">쌍방향 온라인 수업 맛보기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">2차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'익스플레인 에브리싱(Explain Everything) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비02_정명근_익스플레인 에브리싱 사용법_0921.m4v'} onClick={this.openViewer}>
                                <span className="tl">익스플레인 에브리싱(Explain Everything) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="image">
                            <h3 className="fir">3차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'미리캔버스 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비03_정명근_미리캔버스 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">미리캔버스 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="image">
                            <h3 className="fir">4차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'캔바(Canva) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비04_정명근_캔바 사용법.m4v'} onClick={this.openViewer}>
                                <span className="tl">캔바(Canva) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">5차시<em className="marker">장우성</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'유선생이 되어보자'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비05_장우성_유선생이 되어보자_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">유선생이 되어보자</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">6차시<em className="marker">장우성</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'스크린캐스트오매틱(Screencast-O-Matic) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비06_장우성_Screencast-O-Matic 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">스크린캐스트오매틱(Screencast-O-Matic) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">7차시<em className="marker">장우성</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'뱁믹스(Vapmix) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비07_장우성_Vapmix 사용법_0921.m4v'} onClick={this.openViewer}>
                                <span className="tl">뱁믹스(Vapmix) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">8차시<em className="marker">장우성</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'브루(Vrew) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비08_장우성_VREW 사용법.m4v'} onClick={this.openViewer}>
                                <span className="tl">브루(Vrew) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">9차시<em className="marker">백영경</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'온라인 모둠 활동 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비09_백연경_온라인 모둠활동01.m4v'} onClick={this.openViewer}>
                                <span className="tl">온라인 모둠 활동 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">10차시<em className="marker">백영경</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'온라인 모둠 활동 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비10_백연경_온라인 모둠활동02_0921.m4v'} onClick={this.openViewer}>
                                <span className="tl">온라인 모둠 활동 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">11차시<em className="marker">김호선</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 설문지 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비11_김호선_구글 설문지 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 설문지 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">12차시<em className="marker">김호선</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 프레젠테이션 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비12_김호선_구글 프레젠테이션 사용법_1007.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 프레젠테이션 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">13차시<em className="marker">김호선</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 스프레드시트로 숨은 그림 찾기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비13_김호선_구글 스프레드시트 숨은그림찾기_0921.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 스프레드시트로 숨은 그림 찾기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">14차시<em className="marker">박유화</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'패들렛(Padlet) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비14_박유화_패들렛 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">패들렛(Padlet) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom etc">
                            <h3 className="fir">15차시<em className="marker">김희자</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom)으로 인성교육하기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비15_김희자_줌으로 인성교육하기_01 0925.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom)으로 인성교육하기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom etc">
                            <h3 className="fir">16차시<em className="marker">김희자</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom)으로 인성교육하기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비16_김희자_줌으로 인성교육하기_02 1007.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom)으로 인성교육하기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">17차시<em className="marker">최규영</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom), 온택트 교실수업 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비17_최규영_온택트 교실수업_01 0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom), 온택트 교실수업 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">18차시<em className="marker">최규영</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom), 온택트 교실수업 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비18_최규영_온택트 교실수업_02 0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom), 온택트 교실수업 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">19차시<em className="marker">최규영</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom), 온택트 교실수업 3'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비19_최규영_온택트 교실수업_03 0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom), 온택트 교실수업 3</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="vod">
                            <h3 className="fir">20차시<em className="marker">조은호</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'장롱 속 아이패드 살리기, 아이무비(iMovie)'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비20_조은호_장롱 속 아이패드 살리기_iMovie 0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">장롱 속 아이패드 살리기, 아이무비(iMovie)</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">21차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 뽀개기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비21_안민_구글 클래스룸 뽀개기_01_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 뽀개기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">22차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 뽀개기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비22_안민_구글 클래스룸 뽀개기_02_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 뽀개기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">23차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 뽀개기 3'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비23_안민_구글 클래스룸 뽀개기_03_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 뽀개기 3</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">24차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'PPT로 콘텐츠 예쁘게 꾸미기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비24_안민_PPT로 콘텐츠 예쁘게 꾸미기_01_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">PPT로 콘텐츠 예쁘게 꾸미기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc image">
                            <h3 className="fir">25차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'PPT로 콘텐츠 예쁘게 꾸미기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비25_안민_PPT로 콘텐츠 예쁘게 꾸미기_02_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">PPT로 콘텐츠 예쁘게 꾸미기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">26차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 크롬 확장 프로그램 활용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비26_안민_구글 크롬 확장 프로그램 활용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 크롬 확장 프로그램 활용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc image">
                            <h3 className="fir">27차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'워드 클라우드(Word Cloud) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비27_안민_워드클라우즈 사용법_1005.m4v'} onClick={this.openViewer}>
                                <span className="tl">워드 클라우드(Word Cloud) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="image">
                            <h3 className="fir">28차시<em className="marker">안민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'망고보드(MangoBoard) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비28_안민_망고보드 사용법_1005.m4v'} onClick={this.openViewer}>
                                <span className="tl">망고보드(MangoBoard) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom google">
                            <h3 className="fir">29차시<em className="marker">김선수</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 드라이브를 활용한 원격수업 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비29_김선수_구글 드라이브를 활용한 원격수업 01.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 드라이브를 활용한 원격수업 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">30차시<em className="marker">김선수</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 드라이브를 활용한 원격수업 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비30_김선수_구글 드라이브를 활용한 원격수업2_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 드라이브를 활용한 원격수업 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">31차시<em className="marker">이주연</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 학급 운영 맛보기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비31_이주연_구글 클래스룸_학급 운영 맛보기 0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 학급 운영 맛보기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">32차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 설문지로 방탈출 게임 만들기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비32_정명근_구글 설문지로 방탈출 게임 만들기.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 설문지로 방탈출 게임 만들기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">33차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 사이트 도구로 홈페이지 만들기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비33_정명근_구글 사이트 도구로 홈페이지 만들기.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 사이트 도구로 홈페이지 만들기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="image">
                            <h3 className="fir">34차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'플랫아이콘(Flaticon) 활용하기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비34_정명근_Flaticon 사용법.m4v'} onClick={this.openViewer}>
                                <span className="tl">플랫아이콘(Flaticon) 활용하기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">35차시<em className="marker">조은호</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'오피스 365, 스마트한 학교생활'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비35_조은호_Office 365, 스마트한 학교생활.m4v'} onClick={this.openViewer}>
                                <span className="tl">오피스 365, 스마트한 학교생활</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">36차시<em className="marker">조은호</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'마이크로소프트 팀즈(Teams)로 수업하기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비36_조은호_Microsoft Teams로 수업하기_01.m4v'} onClick={this.openViewer}>
                                <span className="tl">마이크로소프트 팀즈(Teams)로 수업하기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">37차시<em className="marker">조은호</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'마이크로소프트 팀즈(Teams)로 수업하기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비37_조은호_Microsoft Teams로 수업하기_02.m4v'} onClick={this.openViewer}>
                                <span className="tl">마이크로소프트 팀즈(Teams)로 수업하기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">38차시<em className="marker">이화민</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'비캔버스(BeeCanVas) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비38_이화민_비캔버스 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">비캔버스(BeeCanVas) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">39차시<em className="marker">성기백</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'멘티미터(Mentimeter) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비39_성기백_멘티미터 사용법_0924.m4v'} onClick={this.openViewer}>
                                <span className="tl">멘티미터(Mentimeter) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">40차시<em className="marker">성기백</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'플립그리드(Flipgrid) 사용법'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비40_성기백_플립그리드 사용법_1007.m4v'} onClick={this.openViewer}>
                                <span className="tl">플립그리드(Flipgrid) 사용법</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">41차시<em className="marker">윤이나</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'줌(Zoom)으로 아이스브레이킹 하기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비41_윤이나_zoom으로 아이스브레이킹 하기_1006.m4v'} onClick={this.openViewer}>
                                <span className="tl">줌(Zoom)으로 아이스브레이킹 하기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">42차시<em className="marker">윤이나</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'온라인 학습지 만들기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비42_윤이나_온라인 학습지 만들기 1.m4v'} onClick={this.openViewer}>
                                <span className="tl">온라인 학습지 만들기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">43차시<em className="marker">윤이나</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'온라인 학습지 만들기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비43_윤이나_온라인 학습지 만들기2_1006.m4v'} onClick={this.openViewer}>
                                <span className="tl">온라인 학습지 만들기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="etc">
                            <h3 className="fir">44차시<em className="marker">윤이나</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'온라인 학습지 만들기 3'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비44_윤이나_온라인 학습지 만들기 3.m4v'} onClick={this.openViewer}>
                                <span className="tl">온라인 학습지 만들기 3</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">45차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 활용하기 1'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비45_정명근_구글 클래스룸 활용하기_01_1006.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 활용하기 1</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">46차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 활용하기 2'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비46_정명근_구글 클래스룸 활용하기_02.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 활용하기 2</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="google">
                            <h3 className="fir">47차시<em className="marker">정명근</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'구글 클래스룸 활용하기 3'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비47_정명근_구글 클래스룸 활용하기_03_1006.m4v'} onClick={this.openViewer}>
                                <span className="tl">구글 클래스룸 활용하기 3</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">48차시<em className="marker">김준형</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'블렌디드 러닝 시작해보기'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비48_김준형_블렌디드 러닝 시작해보기.m4v'} onClick={this.openViewer}>
                                <span className="tl">블렌디드 러닝 시작해보기</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">49차시<em className="marker">김준형</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'블렌디드 러닝 온라인 수업 모형'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비49_김준형_블렌디드 러닝 온라인 수업 모형 1007.m4v'} onClick={this.openViewer}>
                                <span className="tl">블렌디드 러닝 온라인 수업 모형</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                        <li className="zoom">
                            <h3 className="fir">50차시<em className="marker">김준형</em></h3>
                            <div className="lt"
                                 data-type='video'
                                 data-name={'블렌디드 러닝 오프라인 수업 모형'}
                                 data-gubun='CN030'
                                 data-nosave='true'
                                 data-src={'https://dn.vivasam.com/VS/EVENT/movie/contents/온생비50_김준형_블렌디드 러닝 오프라인 수업 모형.m4v'} onClick={this.openViewer}>
                                <span className="tl">블렌디드 러닝 오프라인 수업 모형</span>
                                <button className="viewing"><span className="blind">동영상 재생</span></button>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS()
    }),
    (dispatch) => ({
        ViewerActions: bindActionCreators(viewerActions, dispatch),
        PopupActions: bindActionCreators(popupActions, dispatch),
        BaseActions: bindActionCreators(baseActions, dispatch)
    })
)(withRouter(OnlineClassSurvivalSecretContainer));
//export default OnlineClassSurvivalSecretContainer;
