import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import { goAppDownload } from 'lib/common'
import { connect } from "react-redux";

class Footer extends Component {
    render() {
        const { location,logged, isHidden, isApp, loginInfo } = this.props;
        let clazz = 'myNavi';
        let hash = window.location.hash;
        if(isHidden) clazz = 'myNavi hide';
        function gtag(){
            window.dataLayer.push(arguments);
        }
        return (
            <div className={clazz} >
                <Link to="/"
                      onClick={() => {
                          gtag('event', '2025 개편', {
                              'parameter': '메인',
                              'parameter_value': '홈',
                              'parameter_url': window.location.origin + "/#/"
                          });
                          if (hash === '#/') {
                              window.scrollTo(0, 0);
                          }
                      }}
                    className={"myNavi_item icon_home" + (hash === '#/' ? ' on' : '')}>홈</Link>
                <a href="javascript:void(0)"
                      onClick={() => {
                          gtag('event', '2025 개편', {
                              'parameter': '메인',
                              'parameter_value': '내 교과서',
                              'parameter_url': window.location.origin + "/#" + (logged ? "/educourse/myclassSetup/textbook" : '/login')
                          });

                          if (logged) {
                              // 교사 인증
                              if (loginInfo.certifyCheck === 'N') {
                                  alert("교사 인증 후 사용 가능합니다.");
                                  window.location.hash = "/login/require";
                                  window.viewerClose();
                                  return;
                              } else {
                                  window.location.hash = "/educourse/myclassSetup/textbook";
                              }
                          } else {
                              window.location.hash = "/login";
                          }
                      }}
                    className={"myNavi_item icon_book" + ((hash === '#/educourse'|| hash === '#/educourse/myclassSetup/textbook') ? ' on' : '')}>내 교과서</a>
                <a href="javascript:void(0)"
                      onClick={() => {
                          gtag('event', '2025 개편', {
                              'parameter': '메인',
                              'parameter_value': '내 자료',
                              'parameter_url': window.location.origin + "/#/mydata"
                          });
                          if (logged) {
                              // 교사 인증
                              if (loginInfo.certifyCheck === 'N') {
                                  alert("교사 인증 후 사용 가능합니다.");
                                  window.location.hash = "/login/require";
                                  window.viewerClose();
                                  return;
                              } else {
                                  window.location.hash = "/mydata";
                              }
                          } else {
                              window.location.hash = "/login";
                          }
                      }}
                    className={"myNavi_item icon_data" + (hash.includes('#/mydata') ? ' on' : '')}>내 자료</a>
                <Link
                    to={logged ? "/cs/qna/new" : '/login'}
                    onClick={() => {
                        logged ?
                            gtag('event', '2025 개편', {
                                'parameter': '메인',
                                'parameter_value': '문의하기',
                                'parameter_url': window.location.origin + "/#" + (logged ? "/cs/qna/new" : '/login')
                            }) : null;
                    }}
                    className={"myNavi_item icon_qna" + (hash === '#/cs/qna/new' ? ' on' : '')} >
                    문의하기
                    <span className="myNavi_up">
                        <span className="blind">
                        최근 업데이트
                        </span>
                    </span>
                </Link>
                {
                    !isApp && <a onClick={goAppDownload} className="myNavi_item icon_appdown">앱 다운로드</a>
                }
            </div>
        );
    }
}

export default connect(
    (state) => ({
        isApp: state.base.get('isApp'),
        logged: state.base.get('logged'),
        loginInfo: state.base.get('loginInfo').toJS(),
    })
)(withRouter(Footer));
