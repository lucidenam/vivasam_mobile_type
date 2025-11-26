import React, {Component} from 'react';
import {deleteMyTextbook, insertMyTextbook} from 'lib/api';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import * as myclassActions from 'store/modules/myclass';
import {Link, withRouter} from "react-router-dom";
import {DOWNLOAD_IMAGE_PATH, DOWNLOAD_IMAGE_PATH_22} from '../../constants';
import * as common from 'lib/common'
import {isAndroid, isIOS} from 'react-device-detect';
import {initializeGtag} from "../../store/modules/gtag";
import * as baseActions from "../../store/modules/base";

class TextBookDetail extends Component {
    state = {
        textbookInfo: {},
        textbookDvdCnt: '',
        moreBtn: false,
        saveTextbook: false
    }

    constructor(props) {
        super(props);
        this.moreBtnRef = React.createRef();
    }

    handleMore = (e) => {
        e.preventDefault();
        const { moreBtn } = this.state;

        this.setState({
            moreBtn: !moreBtn
        })
    }

    handleSaveTextBook = async () => {

        const { logged, history, location, textbookCd, myTextBooks, MyclassActions, loginInfo } = this.props;

        if(!logged) {
            history.push({
                pathname: "/login",
                state: { prevPath: location.pathname }
            });
            return;
        }

        // 교사 인증 여부
        if (loginInfo.certifyCheck === 'N') {
            common.info("교사 인증 후 이용 가능합니다.");
            window.location.hash = "/login/require";
            return;
        }

        let isTextbookRegister = false;
        if(myTextBooks.find(b => b.textbookCd === textbookCd)) {
            const response = await deleteMyTextbook(this.props.textbookCd);
            if (response.data === 'SUCCESS') {
                isTextbookRegister = false;
                this.getMyTextBookInfoList();
            } else {
                common.error('내 교과서 삭제가 실패하였습니다.');
                isTextbookRegister = true;
            }
        } else {
            try {
                const response = await insertMyTextbook(this.props.textbookCd);

                if(response.data === 'SUCCESS') {
                    common.info('내 교과서로 등록되었습니다. 메인에서 빠르게 내 교과서로 이동하실 수 있습니다.');
                    this.getMyTextBookInfoList();
                    isTextbookRegister = true;
                } else if(response.data === 'LIMIT') {
                    common.error('선택교과서가 12개를 초과했습니다. 내 교과서는 12개까지 등록 가능합니다.');
                } else {
                    common.error('선택교과가 추가 되지 않았습니다.');
                }
            } catch(e) {
                common.error('선택교과가 추가 되지 않았습니다.');
                console.log(e);
            }
        }


        this.setState({
            saveTextbook: isTextbookRegister
        });
    }

    handleOutSideClick = e => {
        if (this.moreBtnRef.current === e.target || e.target.name === 'reqData') {
            return;
        }
        this.setState({
            moreBtn: false
        });
    };

    handleGoDvd = e => {
        const { logged, history, loginInfo, BaseActions } = this.props;
        e.preventDefault();
        if(logged) {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                common.info("교사 인증 후 이용 가능합니다.");
                window.location.hash = "/login/require";
                return false;
            }

            if(isAndroid) {
                document.location.href="market://details?id=com.visang.smart_teaching";
                //console.log('비상교육 스마트 교수자료 앱으로 연결 (미다운로드시에는 스토어로, 다운로드시에는 앱으로)');
            }else if(isIOS) {
                common.info('IOS에서는 이용하실 수 없습니다.');
            }
        } else {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return null;
        }
    }

    handleGoSmartTextbook = (e, thisUrl) => {
        e.preventDefault();
        const { logged, history, loginInfo,BaseActions } = this.props;
        if (logged) {
            // 교사 인증 여부
            if (loginInfo.certifyCheck === 'N') {
                common.info("교사 인증 후 이용 가능합니다.");
                window.location.hash = "/login/require";
                return false;
            }

            if(isAndroid) {
                window.open(thisUrl, 'ibook', "_blank")
            } else {
                document.location.href=thisUrl;
            }
        } else {
            BaseActions.pushValues({type:"returnUrl", object:history.location.pathname});
            history.push("/login");
            return null;
        }
    }

    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;

        try {
            const response = await MyclassActions.myTextBooks();
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        const { logged, myTextBooks, textbookCd, BaseActions} = this.props;
        initializeGtag();
        BaseActions.openLoading();

        function gtag(){
            window.dataLayer.push(arguments);
        }
        if(logged) {
            this.getMyTextBookInfoList();
        }
        document.addEventListener("mousedown", this.handleOutSideClick, false);

        //내 교과서 등록 확인
        if(myTextBooks.find(b => b.textbookCd === textbookCd)) {
            this.setState({
                saveTextbook: true
            })
        }

        let schoolLvlNm 
            = this.props.schoolLvlCd === 'ES' ? '초등' : 
            this.props.schoolLvlCd === 'MS' ? '중학' :
            this.props.schoolLvlCd === 'HS' ? '고등' : '';

        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/educourse/textbook/' + this.props.textbookCd,
            'page_title': schoolLvlNm + ' - ' + this.props.textbookNm + ' | 비바샘'
        });

        setTimeout(() => {
            BaseActions.closeLoading();
        }, 1000);//의도적 지연.
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleOutSideClick, false);
    }

    render() {
        const { moreBtn } = this.state;
        const { textbookCd, eduYear, courseNm, thumbnailPath, textbookNm, schoolLvlCd, textbookDvdCnt, logged, smartTextbookInfo, textbookUrlInfo } = this.props;
        if(!textbookCd) return false;
        let classNm = textbookNm.substring(0,textbookNm.lastIndexOf("(")).trim(); //과목명
        let teacherNm = textbookNm.substring(textbookNm.lastIndexOf("(")).trim(); //담당자명

        let renewer_year = " y15"
        if(eduYear !== '2015') {
            renewer_year = ' y22';
        }

        let schoolLvlNm = "";
        switch(schoolLvlCd) {
            case 'ES':
                schoolLvlNm = '초등';
                break;
            case 'MS':
                schoolLvlNm = '중학';
                break;
            case 'HS':
                schoolLvlNm = '고등';
                break;
            default:
                schoolLvlNm = '';
        }

        function gtag(){
            window.dataLayer.push(arguments);
        }

        return (
          <div className="classdetail_top pt36">
              <div className="classdetail_top_add icon_add">
                  <label className="switch"><input type="checkbox" id="input-member-textbook" value="Y" onChange={this.handleSaveTextBook} checked={this.state.saveTextbook}/><span className="chk_bookmark"></span></label>
                  <span className="blind">내 교과서 등록</span>
              </div>
              <div className="bookmaker">
                  <img
                    src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + thumbnailPath}
                    className="bookmaker_item" alt={courseNm}/>
              </div>

              <div className="classdetail_top_flag">
                  <em className={"renewer_year" + renewer_year}>{eduYear == '2015' ? '15' : '22'} 개정</em>
              </div>
              <h3 className="classdetail_top_tit">{classNm} {teacherNm}</h3>
              <span className="classdetail_top_category"><span className="classdetail_grade">{schoolLvlNm}</span> {courseNm}</span>
              {/*{
                  (textbookDvdCnt === 'Y' && isAndroid) ? (
                    <a
                      className="classdetail_top_link"
                      onClick={this.handleGoDvd}
                    >
                        <span className="classdetail_top_conts">
                            {eduYear === '2015' ? '스마트 교수자료(DVD)' : '스마트 교과서'} 스마트 교수자료(DVD)
                        </span>
                    </a>
                  ) : (smartTextbookInfo !== null && typeof smartTextbookInfo !== 'undefined' && smartTextbookInfo.length > 0) ? (
                    <a
                      className="classdetail_top_link"
                      onClick={(e) => {
                          this.handleGoSmartTextbook(e, smartTextbookInfo[0].DVD_LINK_URL);
                          gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '스마트 교과서', 'parameter_url': smartTextbookInfo[0].DVD_LINK_URL});
                      }}
                      target="_blank"
                    >
                        <span className="classdetail_top_conts">
                            {eduYear === '2022' ? smartTextbookInfo[0].DVD_BTN_TP === 'SmartPpt' ? '스마트 PPT' : '스마트 교과서' : ''} 스마트 교수자료(DVD)
                        </span>
                    </a>
                  ) : ''
              }*/}
              {/*{
                  Array.isArray(smartTextbookInfo) &&
                  smartTextbookInfo.length > 1 &&
                  smartTextbookInfo[1].DVD_BTN_TP === 'SmartPpt' ? (
                      <a
                          className="classdetail_top_link"
                          onClick={(e) => {
                            this.handleGoSmartTextbook(e, smartTextbookInfo[1].DVD_LINK_URL)
                            let parameterValue = (textbookCd !== '106423' && textbookCd !== '106455' && textbookCd !== '106456')
                                ? '스마트 PPT' : '스마트 교수자료(WEB)';
                            gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': parameterValue, 'parameter_url': smartTextbookInfo[0].DVD_LINK_URL});
                          }}
                      >
                        <span className="classdetail_top_conts">
                            {(textbookCd !== '106423' && textbookCd !== '106455' && textbookCd !== '106456') ? '스마트 PPT' : '스마트 교수자료(WEB)'}
                        </span>
                      </a>
                  ) : ''
              }*/}
              {textbookUrlInfo !== null && typeof textbookUrlInfo !== 'undefined' && textbookUrlInfo.length > 0 ? (
                  (textbookUrlInfo[0].siteUrl !== '') ?
                      <a
                          className="classdetail_top_link"
                          onClick={(e) => {
                              const { BaseActions, loginInfo } = this.props;
                              // 교사 인증
                              if (loginInfo.certifyCheck === 'N') {
                                  BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                                  common.info("교사 인증 후 사용 가능합니다.");
                                  window.location.hash = "/login/require";
                                  window.viewerClose();
                                  return;
                              }

                              this.handleGoSmartTextbook(e, textbookUrlInfo[0].siteUrl);
                              gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '스마트 교과서', 'parameter_url': textbookUrlInfo[0].siteUrl});
                          }}
                      >
                        <span className="classdetail_top_conts">
                            {'스마트 교과서'}
                        </span>
                      </a>
                      : ''
              ) : ''}
              {textbookUrlInfo !== null && typeof textbookUrlInfo !== 'undefined' && textbookUrlInfo.length > 0 ? (
                  (textbookUrlInfo[1].siteUrl !== '') ?
                      <a
                          className="classdetail_top_link"
                          onClick={(e) => {
                              const { BaseActions, loginInfo } = this.props;
                              // 교사 인증
                              if (loginInfo.certifyCheck === 'N') {
                                  BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                                  common.info("교사 인증 후 사용 가능합니다.");
                                  window.location.hash = "/login/require";
                                  window.viewerClose();
                                  return;
                              }

                              this.handleGoSmartTextbook(e, textbookUrlInfo[1].siteUrl);
                              gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '스마트 PPT', 'parameter_url': textbookUrlInfo[1].siteUrl});
                          }}
                      >
                        <span className="classdetail_top_conts">
                            {'스마트 PPT'}
                        </span>
                      </a>
                      : ''
              ) : ''}
              {textbookUrlInfo !== null && typeof textbookUrlInfo !== 'undefined' && textbookUrlInfo.length > 0 ? (
                  (textbookUrlInfo[2].siteUrl !== '') ?
                      <a
                          className="classdetail_top_link"
                          onClick={(e) => {
                              const { BaseActions, loginInfo } = this.props;
                              // 교사 인증
                              if (loginInfo.certifyCheck === 'N') {
                                  BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
                                  common.info("교사 인증 후 사용 가능합니다.");
                                  window.location.hash = "/login/require";
                                  window.viewerClose();
                                  return;
                              }

                              this.handleGoSmartTextbook(e, textbookUrlInfo[2].siteUrl);
                              gtag('event', '2025 개편', {'parameter': '교과서 상세', 'parameter_value': '스마트 교수자료(WEB)', 'parameter_url': textbookUrlInfo[2].siteUrl});
                          }}
                          target="_blank"
                      >
                        <span className="classdetail_top_conts">
                            {'스마트 교수자료(WEB)'}
                        </span>
                      </a>
                      : ''
              ) : ''}

              {/*<button
                    type="button"
                    className="classdetail_top_menu icon_menu"
                    name={"moreBtn"}
                    ref={this.moreBtnRef}
                    onClick={this.handleMore}
                >
                    <span className="blind">단원별자료 더보기</span>
                </button>*/}

              {/*더보기 탭시 레이어 노출*/}
              <div className="layer_help type3" hidden={!moreBtn}>
                  <div className="layer_help_box">
                      <Link
                        to="/cs/qna/new"
                        name="reqData"
                        className="layer_help_txt"
                      >교과서 자료 요청</Link>
                  </div>
              </div>
          </div>
        );
    }
}

export default connect(
  (state) => ({
      logged: state.base.get('logged'),
      loginInfo: state.base.get('loginInfo').toJS(),
      myTextBooks: state.myclass.get('myTextBooks')
  }),
  (dispatch) => ({
      MyclassActions: bindActionCreators(myclassActions, dispatch),
      BaseActions: bindActionCreators(baseActions, dispatch)
  })
)(withRouter(TextBookDetail));