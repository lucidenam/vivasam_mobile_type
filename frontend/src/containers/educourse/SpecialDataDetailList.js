import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import {getContentInfo, getEducourseSpecialDataList} from 'lib/api';
import { DataList } from 'components/common';
import { ContentLoading, RenderLoading } from 'components/common';
import {getContentTarget} from "../../components/common/utils";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import * as common from 'lib/common'
import * as baseActions from 'store/modules/base';

class SpecialDataDetailList extends Component {
    state = {
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        list: null
    }

    getEducourseUnitDataList = async (textbookCd, class2Cd, isMore) => {
        try {
            const { list, page } = this.state;
            const { number, size } = page;

            this.setState({
                isLoading: true
            });
            const response = await getEducourseSpecialDataList(textbookCd, class2Cd, isMore ? number + 1 : 0 , size);
            if(this._isMounted) {
                this.setState({
                    page: response.data.page,
                    list: isMore ? [...list, ...response.data.content.map(cnt => cnt.content)] : response.data.content.map(cnt => cnt.content),
                    isLoading: false
                });
            }
        }catch(e) {
            console.error(e);
        }finally {
            if(this.state.isLoading) {
                this.setState({
                    isLoading: false
                });
            }
        }
    }

    handleShowMore = () => {
        const {textbookCd, class2Cd} = this.props;
        this.getEducourseUnitDataList(textbookCd, class2Cd, true);
    }


    handleViewer = async (e) => {
        e.preventDefault();
        const { ViewerActions, BaseActions, loginInfo, logged, history } = this.props;

        // 로그인 여부
        if (!logged) {
            common.info("로그인 후 이용 가능합니다.");
            BaseActions.pushValues({type: "returnUrl", object: history.location.pathname});
            history.push("/login");
            return false;
        }

        // 교사 인증
        if (loginInfo.certifyCheck === 'N') {
            BaseActions.pushValues({type: "returnUrl", object: window.location.hash.replace('#', '')});
            common.info("교사 인증 후 사용 가능합니다.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }

        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('event', '뷰어 실행', {
            'parameter': '교과서 자료실',
            'parameter value': '특화자료'
        });

        const target = getContentTarget((await getContentInfo(e.target.dataset.id)).data);

        if (target.dataset.type != "document" && target.dataset.siteurl && (target.dataset.siteurl.includes('vbook') || target.dataset.siteurl.includes("https://"))) {
            if (target.dataset.vbook === 1) {
                onClickCallLinkingOpenUrl.bind(this, this.generateRedirectUrl(target.dataset.siteurl));
            } else {
                onClickCallLinkingOpenUrl(target.dataset.siteurl);
            }
            return;
        } else if (target.dataset.saveFileNm && target.dataset.saveFileNm.includes('https://')) {
            onClickCallLinkingOpenUrl.bind(this,target.dataset.saveFileNm);
            return;
        }

        // vbook 콘텐츠라면 외부 브라우저로 열기
        // if (target.dataset.vbook === 1) {
        //     onClickCallLinkingOpenUrl(this.generateRedirectUrl(target.dataset.siteurl));
        //     return;
        // }

        ViewerActions.openViewer({title: target.dataset.name, target: target});
    }

    generateRedirectUrl = (siteUrl) => {
        let url = new URL(siteUrl, window.location.origin);

        // skin 파라미터 없으면 추가
        if (!url.searchParams.has('skin')) {
            url.searchParams.append('skin', 'vivasam_t_01');
        }
        // token 파라미터 없으면 추가
        if (!url.searchParams.has('token')) {
            url.searchParams.append('token', localStorage.getItem('exSsToken'));
        }

        return url.toString();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.class2Cd !== nextProps.class2Cd) {
            this.getEducourseUnitDataList(nextProps.textbookCd, nextProps.class2Cd);
            if(this._isMounted) {
                this.setState({
                    list: null,
                })
            }
            return false;
        }
        return ( this.state !== nextState );
    }

    componentDidMount() {
        this._isMounted = true;
        const {textbookCd, class2Cd} = this.props;
        this.getEducourseUnitDataList(textbookCd, class2Cd);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        const { list, page, isLoading } = this.state;

        if(list === null ) {
            return <RenderLoading loadingType={"1"}/>;
        }

        const hasNext = page.number+1 < page.totalPages;
        return (
            <Fragment>
                <div className="classbytimes_box">
                    <div className="classbytimes_box_depth">
                        <DataList
                            metaData={list}
                            handleViewer={this.handleViewer}
                        />
                    </div>
                </div>
                {
                    hasNext && (() => {
                        if(isLoading) {
                            return <ContentLoading/>;
                        }else {
                            return (
                                <button
                                    type="button"
                                    className="btn_full_off"
                                    onClick={this.handleShowMore}
                                >더보기</button>
                            );
                        }
                    })()
                }

            </Fragment>
        );
    }
}

export default connect(
    (state) => ({
        loginInfo: state.base.get('loginInfo').toJS(),
        logged: state.base.get('logged'),
    }),
    (dispatch) => ({
        BaseActions: bindActionCreators(baseActions, dispatch),
        ViewerActions: bindActionCreators(viewerActions, dispatch)
    })
)(withRouter(SpecialDataDetailList));