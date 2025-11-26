import React, { Component, Fragment } from 'react';
import { MyTextBookInfoSlide } from 'components/main'
import {Link, withRouter} from "react-router-dom";
import * as myclassActions from 'store/modules/myclass';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as api from 'lib/api';
import ContentLoader from "react-content-loader"
import {MyTextBookSetupPopup} from 'containers/educourse';
import * as popupActions from "../../store/modules/popup";

class MyTextBookInfoContainer extends Component {
    state = {
        rendered: false
    }
    getMyTextBookInfoList = async () => {
        const { MyclassActions } = this.props;

        try {
            await MyclassActions.myTextBooks();
            if(this._isMounted) {
                this.setState({
                    rendered: true
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        const { logged } = this.props;
        if(logged) {
            this.getMyTextBookInfoList();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleOpenTextBookSetupPopup = () => {
        const { PopupActions} = this.props;

        PopupActions.openPopup({title:"내 교과서 설정", componet:<MyTextBookSetupPopup />, wrapClassName: "pop_type2", counter: this.state.counter});
    }

    render() {
        const { logged, myTextBooks, loginInfo } = this.props;

        let component;
        if(logged) {
            if(this.state.rendered) {
                component = (
                    <Fragment>
                        <h2 className="title">
                            내 교과서 바로가기
                        </h2>
                        <MyTextBookInfoSlide myBooks={myTextBooks} handleClick={this.handleOpenTextBookSetupPopup} loginInfo={loginInfo}/>
                    </Fragment>
                );
            } else {
                component = (
                    <ContentLoader
                        rtl
                        height={290}
                        width={375}
                        speed={2}
                        primaryColor="#f3f3f3"
                        secondaryColor="#ecebeb"
                    >
                        <rect x="4.69" y="38.67" rx="0" ry="0" width="96" height="122" />
                        <rect x="81.69" y="100.67" rx="0" ry="0" width="0" height="0" />
                        <rect x="111.69" y="38.67" rx="0" ry="0" width="96" height="122" />
                        <rect x="217.69" y="39.67" rx="0" ry="0" width="96" height="122" />
                        <rect x="324.69" y="39.67" rx="0" ry="0" width="96" height="122" />
                        <rect x="3" y="8.67" rx="4" ry="4" width="131" height="17.03" />
                        <rect x="9" y="176.67" rx="4" ry="4" width="85" height="17.03" />
                        <rect x="9" y="205.67" rx="4" ry="4" width="85" height="34.06" />
                        <rect x="116" y="178.67" rx="4" ry="4" width="85" height="17.03" />
                        <rect x="222" y="179.67" rx="4" ry="4" width="85" height="17.03" />
                        <rect x="329" y="179.67" rx="4" ry="4" width="85" height="17.03" />
                        <rect x="116" y="205.67" rx="4" ry="4" width="85" height="34.06" />
                        <rect x="222" y="204.67" rx="4" ry="4" width="85" height="34.06" />
                        <rect x="329" y="204.67" rx="4" ry="4" width="85" height="34.06" />
                    </ContentLoader>
                )
            }

        }else {
            component = (
                <Fragment>
                    <h2 className="title">비바샘 회원이 되시면?</h2>
                    <div className="myBook_guide_box">
                        <ul>
                            <li className="myBook_guide_list">1. 온리원 온라인 강의 할인쿠폰</li>
                            <li className="myBook_guide_list">2. 시험 대비 문제은행 자료 제공 서비스</li>
                            <li className="myBook_guide_list">3. 차별화된 비바샘 만의 멤버십 혜택</li>
                        </ul>
                        <Link to="/join/select" className="myBook_btn_join">회원가입</Link>
                    </div>
                    <div className="myBook_exception">
                        <p className="myBook_exception_ment">비바샘에 로그인하시면 더 많은 자료를 이용하실 수 있습니다.</p>
                        <Link to="/login" className="myBook_login_tn">로그인</Link>
                    </div>
                </Fragment>
            );
        }
        return (
            <div className="section myBook">            
                {component}
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
        PopupActions: bindActionCreators(popupActions, dispatch)
    })
)(withRouter(MyTextBookInfoContainer));