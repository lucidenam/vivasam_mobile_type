import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as baseActions from 'store/modules/base';
import * as viewerActions from 'store/modules/viewer';
import { getPeriodListMain, getContentInfo } from 'lib/api';
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import * as common from 'lib/common'
import { RenderLoading, ContentLoading } from 'components/common';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class PeriodDataList extends Component {
    state = {
        page: {
            number: 0,
            size: 3,
            totalElements: 0,
            totalPages: 0
        },
        list: null,
        tooltipVisible: true,
        isLoading: false,
    }

    constructor(props) {
        super(props);
        this.toolTipRef = React.createRef();
    }

    getPeriodListMain = async (class1Cd, isMore) => {
        try {
            const { list, page } = this.state;
            const { number, size } = page;

            this.setState({
                isLoading: true
            });
            const response = await getPeriodListMain(class1Cd, isMore ? number + 1 : 0 , size);
            if(this._isMounted) {
                this.setState({
                    page: response.data.page,
                    list: isMore ? [...list, ...response.data.content.map(cnt => cnt.content)] : response.data.content.map(cnt => cnt.content),
                    isLoading: false
                });
            }
        }catch(e) {
            console.log(e);
        } finally {
            if(this.state.isLoading) {
                this.setState({
                    isLoading: false
                });
            }
        }
    }

    handleTooltip = (e) => {
        const { tooltipVisible } = this.state;
        this.setState({
            tooltipVisible: !tooltipVisible
        });
    }

    handleShowMore = () => {
        const {class1Cd} = this.props;
        this.getPeriodListMain(class1Cd, true);
    }

    handleViewer = async (id) => {
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
            common.info("교사 인증 후 이벤트에 참여해 주세요.");
            window.location.hash = "/login/require";
            window.viewerClose();
            return;
        }

        try {
            const response = await getContentInfo(id);
            const { contentId, contentGubun, filePath, saveFileName, fileType, subject, summary, copyrightName, siteUrl } = response.data;
            let type;
            if(fileType === 'FT201' || fileType === 'FT204'){
                type = 'video';
            }else if(fileType === 'FT202'){
                type = 'audio';
            }else if(fileType === 'FT203'){
                type = 'image';
            }else if(saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))){
                type = 'etc';
            }else if(fileType === 'FT205' ){
                type = 'document';
            }else if(contentGubun === 'CN070'){
                type = 'smart';
            }else{
                type = 'etc';
            }
            //vbook 1이면 외부 URL로 튕김
            let vbook = siteUrl && siteUrl.includes('vbook') ? 1 : 0;

            const target = {
                dataset: {
                    type: type,
                    src: DOWNLOAD_IMAGE_PATH + filePath + saveFileName,
                    name: subject,
                    id: contentId,
                    gubun: contentGubun,
                    summary: summary,
                    sourcename: copyrightName,
                    vbook: vbook,
                    siteurl: siteUrl
                }
            };
            function gtag(){
                window.dataLayer.push(arguments);
            }
            gtag('event', '뷰어 실행', {
                'parameter': '교과서 자료실',
                'parameter value': '차시별 자료'
            });
            // vbook 콘텐츠라면 외부 브라우저로 열기
            // if (target.dataset.vbook === 1) {
            //     onClickCallLinkingOpenUrl(this.generateRedirectUrl(target.dataset.siteurl));
            //     return;
            // }

            ViewerActions.openViewer({title:target.dataset.name, target:target});
        }catch(e) {
            console.log(e);
        }
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

    handleOutSideClick = e => {
        if (this.toolTipRef.current === e.target) {
            return;
        }
        this.setState({
            tooltipVisible: false
        });
    };

    getPeriodUrl = (periodId, textbookCd, unit1) => {
        const lnbCode = "A-"+textbookCd+"-"+unit1;
        const periodPopUrl = "/period/periodPkgPop.do?periodId="+periodId+"&lnbCode="+lnbCode;
        return 'https://www.vivasam.com/member/login.do?source=mobile&goURL=' + encodeURIComponent(periodPopUrl);
    }

    componentDidMount() {
        this._isMounted = true;
        const {class1Cd} = this.props;
        this.getPeriodListMain(class1Cd);
        document.addEventListener("mousedown", this.handleOutSideClick, false);
    }

    componentWillUnmount() {
        this._isMounted = false;
        document.removeEventListener("mousedown", this.handleOutSideClick, false);
    }

    render() {
        const {class1Cd} = this.props;
        const { list, page, tooltipVisible, isLoading } = this.state;
        if(list === null ) {
            return <RenderLoading loadingType={"1"}/>;
        }

        const hasNext = page.number+1 < page.totalPages;

        return (
            <Fragment>

                {
                    list.map((data, index) => {
                        return (
                            <Fragment key={data.periodId}>
                                <div className="classbytimes_box">
                                    {
                                        index === 0 && (
                                            <h2 className="myclass_title_type1">차시별 자료
                                                <span className="myclass_marker">({page.totalElements})</span>
                                                <div className="help_box">
                                                    <button
                                                        type="button"
                                                        className={"icon_help"+(tooltipVisible ? " active" : "")}
                                                        ref={this.toolTipRef}
                                                        onClick={this.handleTooltip}
                                                    ><span className="blind">도움말</span></button>

                                                    <div className="layer_help type4" hidden={!tooltipVisible}>
                                                        <div className="layer_help_box">
                                                            <p className="layer_help_ment">차시별 자료는 비바샘 PC에서 확인 가능합니다.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </h2>
                                        )
                                    }
                                    <div className="classbytimes_box_depth">
                                        <a
                                            /*href={this.getPeriodUrl(data.periodId, data.textbook, data.unit1)}*/
                                            onClick={() => {common.info('차시별 자료는 비바샘 PC에서\n확인 가능합니다.')}}
                                            target="_blank"
                                            className="classbytimes_box_tit"
                                        >{data.periodName}</a>
                                        {
                                            data.docDataList.length > 0 && data.docDataList.map(doc => {
                                                return (
                                                    <a
                                                        onClick={() => {this.handleViewer(doc.contentId)}}
                                                        className="classbytimes_box_link"
                                                        key={doc.contentId}
                                                        /*data-type={type}
                                                        data-src={src}
                                                        data-name={subject}
                                                        data-id={contentId}
                                                        data-summary={summary}*/
                                                    >
                                                    <span className={"file_icon icon_"+common.getFileIconClass(doc.fileType, doc.saveFileName, doc.contentGubun)}>
                                                        <span className="blind">{common.getContentIcon(doc.saveFileName)}</span>
                                                    </span>{doc.title}
                                                    </a>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                {
                                    (list.length > index + 1) && <div className="guideline"></div>
                                }
                            </Fragment>
                        )
                    })
                }
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
        ViewerActions: bindActionCreators(viewerActions, dispatch),
    })
)(withRouter(PeriodDataList));
