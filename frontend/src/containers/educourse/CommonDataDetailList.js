import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import * as viewerActions from 'store/modules/viewer';
import {getContentInfo, getEducourseCommonDataList, getEducourseCommonDataTypeList} from 'lib/api';
import { ThumbnailList, DataList } from 'components/common';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';
import {DOWNLOAD_IMAGE_PATH_22} from '../../constants';
import { ContentLoading, RenderLoading } from 'components/common';
import {getContentTarget} from "../../components/common/utils";
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import * as baseActions from 'store/modules/base';
import * as common from 'lib/common'

class CommonDataDetailList extends Component {
    state = {
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        list: null,
        type2Cd: '',
        type1Nm:'',
        type2Cds: [],
        isLoading: false
    }

    getEducourseCommonDataList = async (textbookCd, classCd, type2Cd, isMore) => {
        try {
            const { list, page } = this.state;
            const { number, size } = page;

            this.setState({
                isLoading: true
            });
            const response = await getEducourseCommonDataList(textbookCd, classCd, type2Cd, isMore ? number + 1 : 0 , size);
            if(this._isMounted) {
                this.setState({
                    page: response.data.page,
                    list: isMore ? [...list, ...response.data.content.map(cnt => cnt.content)] : response.data.content.map(cnt => cnt.content),
                    isLoading: false
                });
            }
        }catch (e) {
            console.error(e);
        } finally {
            if(this.state.isLoading) {
                this.setState({
                    isLoading: false
                });
            }
        }
    }

    getEducourseCommonDataTypeList = async (textbookCd, class2Cd) => {
        const response = await getEducourseCommonDataTypeList(textbookCd, class2Cd);
        if(this._isMounted) {
            this.setState({
                type2Cds: response.data
            });

            if (response.data.length > 0) {
                this.setState({
                    type1Nm: response.data[0].type1Nm
                });
            }
        }
    }

    handleShowMore = () => {
        const {textbookCd, class2Cd} = this.props;
        const {type2Cd} = this.state;
        this.getEducourseCommonDataList(textbookCd, class2Cd, type2Cd, true);
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
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
            'parameter value': '공통자료'
        });

        const target = getContentTarget((await getContentInfo(e.target.dataset.id)).data);

        if (target.dataset.type != "document" && target.dataset.siteurl && (target.dataset.siteurl.includes('vbook') || target.dataset.siteurl.includes("https://"))) {
            if (target.dataset.vbook === 1) {
                onClickCallLinkingOpenUrl.bind(this, this.generateRedirectUrl(target.dataset.siteurl));
            } else {
                onClickCallLinkingOpenUrl(target.dataset.siteurl);
            }
            return;
        } else if (target.saveFileNm && target.saveFileNm.includes('https://')) {
            onClickCallLinkingOpenUrl.bind(this, target.saveFileNm);
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
        const {textbookCd, class2Cd} = nextProps;
        if(this.props !== nextProps) {
            this.getEducourseCommonDataTypeList(textbookCd, class2Cd);
            this.getEducourseCommonDataList(textbookCd, class2Cd, null);
            if(this._isMounted) {
                this.setState({
                    list: null,
                })
            }
            return false;
        }
        if(this.state.type2Cd !== nextState.type2Cd) {
            this.getEducourseCommonDataList(textbookCd, class2Cd, nextState.type2Cd);
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
        const {type2Cd} = this.state;
        this.getEducourseCommonDataTypeList(textbookCd, class2Cd);
        this.getEducourseCommonDataList(textbookCd, class2Cd, type2Cd);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { list, page, type1Nm, type2Cd, type2Cds, isLoading } = this.state;
        const {textbookCd, class2Cd} = this.props;
        if(list === null) {
            return <RenderLoading loadingType={"1"}/>;
        }

        const hasNext = page.number+1 < page.totalPages;
        let container;

        //멀티미디어자료, 이미지자료
        if(class2Cd === '1110003' || class2Cd === '1110005') {
            const metaData = list.map(item => ({
                contentId: item.contentId,
                contentGubun: item.contentGubun,
                subject: item.subject,
                thumbnail: (item.mdValue === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22)+item.thumbnailPath,
                summary: item.subject,
                filePath: (item.mdValue === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22)+item.filePath,
                filename: item.saveFileNm,
                fileType: item.fileType,
                siteUrl: item.siteUrl
            }));

            container = <ThumbnailList
                metaData={metaData}
                type={class2Cd === '1110005' ? 'image' : 'video'}
                totalElements={page.totalElements}
                handleViewer={this.handleViewer}
                hideTotalCount={true}/>;
        }
        //수업자료, 평가자료
        else {
            container = (
                <div className="classbytimes_box_depth">
                    {
                        <DataList
                            metaData={list}
                            handleViewer={this.handleViewer}
                        />
                    }
                </div>
            );
        }

        return (
            <Fragment>
                <div className="classbytimes_box">
                    <h2 className="myclass_title_type1">{type1Nm}
                        <span className="myclass_marker">({page.totalElements})</span>
                    </h2>
                    <div className="selectbox selTypeB">
                        <select
                            name="type2Cd"
                            value={type2Cd}
                            onChange={this.handleChange}
                            id="dataDe"
                        >
                            <option
                                value=""
                            >{type1Nm} 분류</option>
                            {
                                type2Cds.map(type => {
                                    return (
                                        <option
                                            key={type.type2Cd}
                                            value={type.type2Cd}
                                        >{type.type2Nm}</option>
                                    );
                                })

                            }
                        </select>
                    </div>

                    {container}

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
)(withRouter(CommonDataDetailList));
