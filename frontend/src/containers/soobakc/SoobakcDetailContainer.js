import React, { Component } from 'react';
import * as api from 'lib/api';
import * as common from 'lib/common';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import * as popupActions from 'store/modules/popup';
import { SoobakcPopupContainer, SoobakcDownloadPopupContainer } from 'containers/soobakc'
import ContentLoading from 'components/common/ContentLoading';

class SoobakcDetailContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            target: null,
            dataset: null,
            lpIdx: null,
            ldIdx: null,
            type: null,
            downloadLink: 'https://www.soobakc.com/fileup/LECTURE_FILE/',
            starPlyaerLicense: '31856D1F-57EA-415A-8DDA-6B86C978788E'
        };
    }

    onPlayer = (ldIdx, type, e) => {
        e.preventDefault();
        const { PopupActions, lpIdx , loginInfo} = this.props;
        let dataset = e.target.dataset;

        if (loginInfo.mLevel === 'AU400') {
            common.error('인증회원만 이용 가능합니다.');
            return false;
        }

        this.getSoobakcMovs(dataset, ldIdx, lpIdx, type, loginInfo.memberId);
        this.setState({
            target: e.target,
            dataset: dataset,
            lpIdx: lpIdx,
            ldIdx: ldIdx,
            type: type
        });

        let permissionCheck = true;

        api.hasDataNetworkPermission().then((hasPermission)=>{
            if (!hasPermission) {
                if (window.confirm('데이터 네트워크 차단 상태입니다. 데이터 네트워크를 사용하시겠습니까?\n(사용중인 데이터 요금제에 따라 데이터 통화료가 부과될 수 있습니다.)')) {
                    permissionCheck = false;
                }
            }
        });

        if (permissionCheck) {
            PopupActions.openPopup({title: "데이터 사용안내", componet: <SoobakcPopupContainer playViewer={this.streamingStarPlayer}/>});
        }
    }

    streamingStarPlayer = () => {
        const { PopupActions, loginInfo } = this.props;
        PopupActions.closePopup();
        let sp = this.StarPlayerApp();
        sp.license = "31856D1F-57EA-415A-8DDA-6B86C978788E";
        sp.version = "1.0.0"; // iOS, Android에서 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다.
        sp.android_version = "1.0.0"; // 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다. (android 전용)
        sp.ios_version = "1.0.0"; // 실행 가능한 StarPlayer앱의 최소 버전을 설정합니다. (iOS 전용)
        sp.pmp = "true";
        sp.referer_return = "true";
        sp.referer = "mVivasamApp://m.vivasam.com?userId=xxxxxx&result=1";

        const app = function(info_url) {
            sp.executeApp(info_url);
            return false;
        }

        let starStreaming = "mv.vivasam.com";

        let _url2 = this.state.dataset.src;

        //L7 도메인에서 redirect 되어 replace 진행
        _url2 = _url2.replace("soobakc-visangst.lgucdn.com", "msoobakc02-visangmobile01.lgucdn.com")
          .replace("http://", "*\\*http:*\\*")
          .replace("//", "/")
          .replace("*\\*http:*\\*", "http://");

        app("https://" + starStreaming + '/api/soobakc/streamingStarplayer?license=31856D1F-57EA-415A-8DDA-6B86C978788E&memberId=' + loginInfo.memberId + '&content_id=100&content=' + decodeURIComponent(_url2)  +'&test=1&test2=2');
    }

    StarPlayerApp = () => {
        const STARPLAYER_APP_IPHONE_URL = "https://itunes.apple.com/kr/app/axis-starplayer/id598865744?mt=8";
        const STARPLAYER_APP_IPAD_URL = "https://itunes.apple.com/kr/app/axis-starplayerhd/id599892711?mt=8";
        const STARPLAYER_PLUS_APP_IOS_URL = "https://apps.apple.com/kr/app/id1474597276";
        const STARPLAYER_APP_INSTALL_ANDROID_URL = "market://details?id=com.axissoft.starplayer";
        const STARPLAYER_APP_INSTALL_CONFIRM = "[ StarPlayer App 설치 ]\n\n설치 페이지로 이동하시겠습니까?\n\n기존에 앱이 설치되어 있다면\n취소 버튼을 선택해주세요.";
        const STARPLAYER_APP_INSTALL_CONFIRM_IOS = "[ StarPlayer App 설치 ] 설치 페이지로 이동하시겠습니까? 기존에 앱이 설치되어 있다면 취소 버튼을 선택해주세요.";
        const DataType = {
            URL: 1,
            DATA: 2
        };
        let StarPlayerApp = {};
        let uagent = navigator.userAgent.toLocaleLowerCase();
        StarPlayerApp.android = (uagent.search("android") > -1 || uagent.search("linux") > -1);
        StarPlayerApp.mobile_mac = (uagent.search("mac os x") > -1
            && uagent.search("macintosh") > -1 && window.navigator.maxTouchPoints > 1);
        StarPlayerApp.ios = /ip(hone|od|ad)/.test(uagent) || StarPlayerApp.mobile_mac;
        StarPlayerApp.iphone = (uagent.search("iphone") > -1 || uagent.search("ipod") > -1);
        StarPlayerApp.ipad = (uagent.search("ipad") > -1);
        StarPlayerApp.safari = (uagent.search("safari") > -1);
        StarPlayerApp.chrome = (uagent.search("chrome") > -1 || uagent.search("crios") > -1);
        StarPlayerApp.opera = (uagent.search("opera") > -1);
        StarPlayerApp.windows = (uagent.search("windows") > -1 || uagent.search("wow64") > -1);
        StarPlayerApp.ios_sp_min_version = StarPlayerApp.mobile_mac ? "13.0.3" : "13.2.0";
        StarPlayerApp.iosVersion = function() {
            let result = null;
            var b;
            if (/ip(hone|od|ad)/.test(uagent)) {
                b = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                if (b != null) {
                    result = {
                        status: true,
                        major: parseInt(b[1], 10),
                        version: parseInt(b[1], 10) + "." + parseInt(b[2], 10) + "." + parseInt(b[3] || 0, 10)
                    };
                }
            } else {
                if (StarPlayerApp.mobile_mac) {
                    if (uagent.search("version") > -1) {
                        var a = (navigator.appVersion).match(/(version)[/\s]([\d.]+)/ig);
                        b = a[0].match(/(\d+).(\d+).?(\d+)?/);
                        if (b != null) {
                            result = {
                                status: true,
                                major: parseInt(b[1], 10),
                                version: parseInt(b[1], 10) + "." + parseInt(b[2], 10) + "." + parseInt(b[3] || 0, 10)
                            }
                        }
                    }
                }
            }
            if (result == null) {
                result = {
                    status : false,
                    major : 0,
                    version : "0",
                    desc : "디바이스 정보를 가져올 수 없습니다.\n현재 사용하고 있는 브라우저 옵션에서 데스크탑 모드를 off 또는 모바일 모드로 변경하고 페이지를 새로고침 해주세요.\n같은 현상이 지속되면 사파리나 크롬 앱을 이용해 주세요."
                }
            }
            return result;
        };
        StarPlayerApp.iosPlusIsAvailable = function() {
            const iosVersion = StarPlayerApp.iosVersion();
            if (iosVersion.major >= 13) {
                var a = iosVersion.version.replace(/\./gi, "");
                var b = StarPlayerApp.ios_sp_min_version.replace(/\./gi, "");
                if (a >= b) {
                    return true;
                }
            }
            return false;
        };
        StarPlayerApp.executeApp = function(url, b) {
            if (this.ios) {
                const iosVersion = StarPlayerApp.iosVersion();
                if (iosVersion.status === false) {
                    common.info(iosVersion.desc);
                    return false;
                }
            }
            document.addEventListener(getVisibilityValue(), handleVisibilityChange, false);
            if (typeof this.referer == "undefined") {
                this.referer = window.location.href;
            }

            const urlScheme = this.urlscheme(url, b);
            // urlScheme 값이 비어있을 경우 오류로 취급
            if (!common.isStrExistCheck(urlScheme)) {
                return false;
            }
            checkInstalled(urlScheme);

            if (this.android) {
                let androidUrl = "intent://?" + urlScheme + "#Intent;";
                androidUrl += "scheme=starplayer;";
                androidUrl += "action=android.intent.action.VIEW;";
                androidUrl += "category=android.intent.category.BROWSABLE;";
                androidUrl += "package=com.axissoft.starplayer;end";
                window.location.href = androidUrl;
                return false;
            }
            if (this.ios) {
                if (this.opera) {
                    alert("사용하고 계신 환경(OS)에서는 지원되지 않습니다.");
                }
                return false;
            }
            if (this.windows) {
                setTimeout(function () {
                    window.parent.location.href = urlScheme;
                }, 10);
            }
        };

        StarPlayerApp.urlscheme = function (url, dataType = DataType.URL) {
            if (typeof this.license === "undefined") {
                alert("license 값이 설정되지 않았습니다.");
                return "";
            }
            if (typeof url === "undefined") {
                alert("data 값이 설정되지 않았습니다.");
                return "";
            }
            if (dataType === DataType.URL) {
                return this.url(url);
            }
        };

        StarPlayerApp.url = function(paramUrl) {
            let returnUrl = "";
            if (this.ios) {
                if (this.iosPlusIsAvailable()) {
                    returnUrl += "starplayerplus://?";
                } else {
                    returnUrl += "starplayer://?";
                }
            } else {
                if (this.windows) {
                    returnUrl += "starplayer://?";
                }
            }
            returnUrl += "license=" + encodeURIComponent(this.license) + "&url=" + encodeURIComponent(paramUrl);

            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hour = date.getHours();
            let minute = date.getMinutes();
            let second = date.getSeconds();

            month = month >= 10 ? month : '0' + month;
            day = day >= 10 ? day : '0' + day;
            hour = hour >= 10 ? hour : '0' + hour;
            minute = minute >= 10 ? minute : '0' + minute;
            second = second >= 10 ? second : '0' + second;

            const createDate = year + month + day + hour + minute + second;

            returnUrl += "&date=" + createDate;

            if (typeof this.debug !== "undefined") {
                returnUrl += "&debug=" + this.debug;
            } else {
                returnUrl += "&debug=false";
            }
            let isExistVersion = false;
            if (this.android) {
                if (typeof this.android_version !== "undefined") {
                    returnUrl += "&version=" + this.android_version;
                    isExistVersion = true
                }
            } else {
                if (typeof this.ios_version !== "undefined") {
                    returnUrl += "&version=" + this.ios_version;
                    isExistVersion = true;
                }
            }
            if (isExistVersion === false) {
                if (typeof this.version !== "undefined") {
                    returnUrl += "&version=" + this.version;
                } else {
                    returnUrl += "&version=1.0.0";
                }
            }
            if (typeof this.pmp !== "undefined") {
                returnUrl += "&pmp=" + this.pmp;
            } else {
                returnUrl += "&pmp=true";
            }

            if (this.chrome) {
                returnUrl += "&from=chrome";
            } else if (this.safari) {
                returnUrl += "&from=safari";
            } else if (this.opera) {
                returnUrl += "&from=opera";
            } else {
                returnUrl += "&from=none";
            }

            if (typeof this.referer !== "undefined") {
                returnUrl += "&referer=" + encodeURIComponent(this.referer);
            }
            if (this.android) {
                if (this.android_referer_return) {
                    returnUrl += "&android_referer_return=" + this.android_referer_return;
                } else {
                    returnUrl += "&android_referer_return=false";
                }
            } else {
                if (this.referer_return) {
                    returnUrl += "&referer_return=" + this.referer_return;
                } else {
                    returnUrl += "&referer_return=true";
                }
            }
            if (typeof this.offline_check !== "undefined") {
                returnUrl += "&offline_check=" + this.offline_check;
            } else {
                returnUrl += "&offline_check=false";
            }

            if (typeof this.user_id !== "undefined") {
                returnUrl += "&user_id=" + this.user_id;
            }

            return returnUrl;
        };

        const agentCheck = function () {
            if (StarPlayerApp.iosPlusIsAvailable()) {
                return STARPLAYER_PLUS_APP_IOS_URL;
            }
            if (StarPlayerApp.iphone === true) {
                return STARPLAYER_APP_IPHONE_URL;
            }
            if (StarPlayerApp.ipad === true) {
                return STARPLAYER_APP_IPAD_URL;
            }

            return STARPLAYER_APP_INSTALL_ANDROID_URL;
        };

        // 마켓 이동 or 앱 실행
        const checkInstalled = function (iosAppUrl) {
            // IOS만 이동
            if (StarPlayerApp.ios) { //애플 스타플레이어 화면으로 띄움
                let a = new Date;
                setTimeout(
                    function() {
                        let tempT = new Date();
                        if (tempT - a < 1600) {
                            let isPlus = StarPlayerApp.iosPlusIsAvailable();
                            let url = '';
                            if (!isPlus && StarPlayerApp.mobile_mac) {
                                url = STARPLAYER_APP_IPHONE_URL;
                            } else {
                                url = agentCheck();
                            }

                            const data = {value: url};
                            const iosData = {value: iosAppUrl};
                            return new Promise(function (resolve, reject) {
                                window.webViewBridge.send('callLinkingOpenUrl', iosData, (retVal) => {
                                    if(!retVal.value) { //어플 실행 및 다운로드 링크 이동
                                         if (window.confirm(STARPLAYER_APP_INSTALL_CONFIRM_IOS)) {
                                             // 중고등 어플을 실행시킨다.
                                             return new Promise(function (resolve, reject) {
                                                 window.webViewBridge.send('callLinkingOpenUrl', data, (retVal) => {
                                                     resolve(retVal); //
                                                 }, (err) => {
                                                     reject(err);
                                                 });
                                             });
                                         }
                                    }
                                }, (err) => {
                                    reject(err);
                                });
                            });
                        }
                    },1500
                )
            }
        };

        function getHiddenValue() {
            if (typeof document.mozHidden !== "undefined") {
                return "hidden";
            }
            if (typeof document.msHidden !== "undefined") {
                return "msHidden";
            }
            if (typeof document.webkitHidden !== "undefined") {
                return "webkitHidden";
            }
            if (typeof document.hidden !== "undefined") {
                return "hidden";
            }
        }

        function getVisibilityValue() {
            if (typeof document.mozHidden !== "undefined") {
                return "mozvisibilitychange";
            }
            if (typeof document.msHidden !== "undefined") {
                return "msvisibilitychange";
            }
            if (typeof document.webkitHidden !== "undefined") {
                return "webkitvisibilitychange";
            }
            if (typeof document.hidden !== "undefined") {
                return "visibilitychange";
            }
        }
        function handleVisibilityChange() {
            if (!document[getHiddenValue()]) {
                const starPlayerPopup = document.getElementsByClassName("starplayer_popup");
                if (starPlayerPopup.length > 0) {
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
            let starPlayerPopup = document.getElementsByClassName("starplayer_popup");
            if (starPlayerPopup.length > 0) {
                if (typeof this.modal != "undefined" && this.modal != null) {
                    this.modal.remove()
                }
            }
            let a = document.createElement("DIV");
            a.className = "starplayer_popup";
            a.innerHTML = `
                <div class='stpp_content'>
                    <header class='stpp_header'>
                        <h2 class='stpp_title'></h2>
                        <button class='stpp_btn-close'></button>
                    </header>
                <div class='stpp_body'></div>
                <footer class='stpp_footer'>
                    <button class='stpp_btn-no'></button>
                    <button class='stpp_btn-yes'></button>
                </footer>`;
            if (!modalViewStyleSheet) {
                modalViewStyleSheet = document.createElement("style");
                modalViewStyleSheet.innerHTML = `
                    .starplayer_popup {line-height: 1; position: fixed; z-index: 9999; top: 0; left: 0; right: 0; bottom: 0; font-family: arial, sans-serif;}
                    .stpp_content {padding: 10px; background: #fff; border-radius: 4px; -webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.4); box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);}
                    .stpp_header {position: relative; display: flex; justify-content: space-between;}
                    .stpp_title {margin: 0; flex: 1; font-size: 24px; text-align: center;}
                    .stpp_body {margin: 10px; font-size: 16px; text-align: center;}
                    .stpp_btn-close {position: absolute; top: 0; right: 0; width: 20px; height: 20px; padding: 0; font-size: 12px; font-weight: 700; text-align: center;
                        background: none; border: 1px solid #000; border-radius: 50%; cursor: pointer; transition: all 0.4s; line-height: 9px; color: #000;}
                    .stpp_btn-close:hover {opacity: 0.4;}
                    .stpp_btn-close:before {content: 'X';}
                    .stpp_footer {margin-top: 20px; text-align: center; }
                    .stpp_btn-yes, .stpp_btn-no {margin: 0 5px; padding: 4px 14px; font-size: 18px; border-radius: 20px; border: 1px solid #000;
                        cursor: pointer; line-height: 22px; transition: all 0.4s; width: auto!important; height: auto!important; }
                    .stpp_btn-yes {background: #fff; color: #000;}
                    .stpp_btn-no {background: #000; color: #fff;}
                    .stpp_btn-yes:hover, .stpp_btn-no:hover {color: #000; border-color: transparent; background: rgba(0, 0, 0, 0.1); }
                    .stpp_overlay {position: absolute; z-index: -1; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); }`;
                document.body.appendChild(modalViewStyleSheet);
            }
            return a.cloneNode(true);
        }

        return StarPlayerApp;
    }

    getSoobakcMovs = async (dataset, ldIdx, lpIdx, type, memberId) => {
        const response = await api.getSoobakcMovs(ldIdx, lpIdx, type, memberId);
        dataset.src = response.data.url;
    }

    playViewer = () => {
        const { PopupActions, ViewerActions } = this.props;
        const { target, dataset } = this.state;
        PopupActions.closePopup();
        ViewerActions.openViewer({title:dataset.name, target:target});
    }

    onDownload = (param, e) => {
        const { PopupActions, loginInfo } = this.props;
        e.preventDefault();

        if (loginInfo.mLevel === 'AU400') {
            common.error('인증회원만 이용 가능합니다. ');
        }

        PopupActions.openPopup({title:'교수자료 저작권 안내', componet:<SoobakcDownloadPopupContainer doDownload={this.doDownload}/>});
        this.setState({
            downloadLink : param
        });
    }

    doDownload = () => {
        const {PopupActions} = this.props;
        const {downloadLink} = this.state;
        PopupActions.closePopup();
        const link = document.createElement('a');
        link.href = 'http://www.soobakc.com/fileup/LECTURE_FILE/' + downloadLink;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        const {soobakcList, isLoading} = this.props;

        const SoobakcList = ({soobakcList}) => {
            let depthName = "";
            const soobakc = soobakcList.map((soobak, index) => {
                var soobakDownload = false;
                if(common.isStrExistCheck(soobak.TEXT_NAME)) depthName = soobak.TEXT_NAME;
                if(common.isStrExistCheck(soobak.FILE_NAME)) soobakDownload = true;
                return (
                    <li className="lectDtl_item" key={index}>
						<div className="lectDtl_cell">
							<strong className="course"><span className="ellipse">{index+1}강</span>&nbsp;{soobak.LD_TITLE}</strong>
							<span className="book">{depthName}</span>
							<span className="c_num">{soobak.LD_MINUTE}분</span>
                            <span className="c_txt">{soobak.LD_PAGE}P</span>
                            {soobakDownload &&
                            <span className="radio_quad">
                                <input type="checkbox" id={'down'+index} onClick={this.onDownload.bind(this, soobak.FILE_NAME)}/>
                                <label htmlFor={'down'+index}>다운로드</label>
                            </span>
                            }
						</div>
						<div className="lectDtl_cell">
                            <a onClick={this.onPlayer.bind(this, soobak.LD_IDX, 'L')}
                                data-type='video'
                                data-name={soobak.LD_TITLE}
                                data-gubun=''
                                data-src=''
                                className="btn_square_sm">일반</a>
                            <a onClick={this.onPlayer.bind(this, soobak.LD_IDX, 'H')}
                                data-type='video'
                                data-name={soobak.LD_TITLE}
                                data-gubun=''
                                data-src=''
                                className="btn_square_sm post_color">고화질</a>
						</div>
					</li>
                )
            });

            return (
                <ul className="">
                    {soobakc}
                </ul>
            )
        }

        return (
            <section className="soobakc">
                <h2 className="blind">온리원 추천강의</h2>
                <div className="lecture_detail">
                    {isLoading &&
                        <ContentLoading />
                    }
                    <SoobakcList soobakcList={soobakcList}></SoobakcList>
                </div>
            </section>
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
)(withRouter(SoobakcDetailContainer));
