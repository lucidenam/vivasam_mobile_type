import React, {Component, Fragment} from 'react';
import {deletePutData, myFolderList, myPutDataList} from 'lib/api';
import * as common from 'lib/common';
import {ContentLoading, RenderLoading} from 'components/common';
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";
import {initializeGtag} from "../../store/modules/gtag";

class MyPutData extends Component {
    state = {
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        myFolders: [],
        myPutDatas: null,
        selectedFolderId: '',
        checkedSet: new Set(),
        visible: false,
        isLoading: false,
        isRendering: false
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleCheckbox = (e) => {
        const {checkedSet} = this.state;
        if(checkedSet.has(e.target.id)){
            checkedSet.delete(e.target.id);
        }else {
            checkedSet.add(e.target.id);
        }

        this.setState({
            checkedSet,
            visible: true
        });
    }

    getMyFolderList = async () => {
        try {
            const response = await myFolderList();
            if(this._isMounted) {
                this.setState({
                    myFolders: response.data
                });
            }
        }catch(e) {
            console.log(e);
        }
    }

    getMyPutDataList = async (folderId, isMore) => {
        const { myPutDatas, page } = this.state;
        const { number, size } = page;

        try {
            this.setState(isMore ? {
                isLoading: true
            } : {
                isRendering: true
            });
            const response = await myPutDataList(folderId, isMore ? number + 1 : 0 , size);
            if(this._isMounted) {
                this.setState({
                    page: response.data.page,
                    myPutDatas: isMore ? [...myPutDatas, ...response.data.content.map(data => data.content)] : response.data.content.map(data => data.content),
                    isLoading: false,
                    isRendering: false
                });
            }
        }catch(e) {
            console.log(e);
        }
    }

    deletePutData = async () => {
        const {checkedSet, selectedFolderId} = this.state;
        try {
            const response = await deletePutData([...checkedSet]);

            if(response.data.resultCode === 'SUCCESS') {
                common.info("삭제하였습니다.");
                this.getMyPutDataList(selectedFolderId);
                checkedSet.clear();
                if(this._isMounted) {
                    this.setState({
                        checkedSet
                    });
                }
            }else {
                common.error("삭제에 실패하였습니다.");
            }
        }catch(e) {
            common.error("삭제에 실패하였습니다.");
            console.log(e);
        }
    }

    handleCloseDeleteLayer = (e) => {
        e.preventDefault();
        this.setState({
            visible:false
        });
    }

    handleShowMore = () => {
        const {selectedFolderId} = this.state;
        this.getMyPutDataList(selectedFolderId, true);
    }

    handleDelete = (e) => {
        e.preventDefault();
        this.deletePutData();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.selectedFolderId !== nextState.selectedFolderId) {
            this.getMyPutDataList(nextState.selectedFolderId);
            return false;
        }
        return (this.state !== nextState);
    }

    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        /*
        gtag('config', 'G-B7GPBXLL3E', {
            'page_path': '/mydata/put',
            'page_title': '담은 자료｜비바샘'
        });
        */

        this._isMounted = true;
        this.getMyFolderList();
        this.getMyPutDataList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { page, myFolders, myPutDatas, selectedFolderId, checkedSet, visible, isLoading, isRendering} = this.state;
        const { handleViewer } = this.props;
        const hasNext = page.number+1 < page.totalPages;

        if(myPutDatas === null || isRendering) {
            return <RenderLoading loadingType={"2"}/>;
        }

        return (
            <Fragment>
                <section className="myData">
                    <h2 className="blind">담은 자료</h2>

                    <div className="myData_wrap">
                        <div className="myData_result">
                            총 <em className="count">{page.totalElements}</em>개
                        </div>
                        <div className="selectbox selTypeA">
                            <select
                                name="selectedFolderId"
                                value={selectedFolderId}
                                onChange={this.handleChange}
                            >
                                <option value="">분류 선택</option>
                                {
                                    myFolders.map(folder => {
                                        return (
                                            <option key={folder.folderId}
                                                    value={folder.folderId}
                                            >{folder.folderName}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>

                        <div className="lecture">
                            <ul>
                                {
                                    myPutDatas.length > 0 ? (
                                        myPutDatas.map(data => {
                                            return (
                                                <li className="lecture_item" key={data.folderId+'-'+data.contentGubun+'-'+data.contentId}>
                                                    <span className="check_item">
                                                        <input type="checkbox"
                                                               className="checkbox"
                                                               id={data.folderId+'-'+data.contentGubun+'-'+data.contentId}
                                                               name="ipt_data"
                                                               onChange={this.handleCheckbox}
                                                        />
                                                        <label htmlFor={data.folderId+'-'+data.contentGubun+'-'+data.contentId}><span className="blind">선택</span></label>
                                                    </span>
                                                    <span className="lecture_content">
                                                        <a onClick={data.saveFileNm.includes("https://")
                                                                    ? onClickCallLinkingOpenUrl.bind(this, data.saveFileNm)
                                                                    : () => handleViewer(data.contentId, data.contentGubun, data.title)
                                                            }
                                                            className="lecture_link"
                                                            data-url={data.saveFileNm}
                                                        >
                                                        <span className={"file_icon icon_" + common.getFileIconClass(data.fileType, data.saveFileNm, data.contentGubun)}>
                                                            <span className="blind">{common.getContentIcon(data.saveFileNm)}</span>
                                                        </span>
                                                        <strong className="course">{data.title}</strong>
                                                        <span className="c_num pointC">{data.schoolLvlNm}</span>
                                                        <span className="c_txt">{data.textbookNm}</span>
                                                        </a>
                                                    </span>
                                                </li>

                                            );
                                        })
                                    ) : (
                                        <li className={"pt100"}>
                                            <p style={{textAlign: 'center'}}>내 자료로 담은 내역이 없습니다.</p>
                                        </li>
                                    )
                                }
                            </ul>
                            {
                                hasNext && (() => {
                                    if (isLoading) {
                                        return <ContentLoading/>;
                                    } else {
                                        return (
                                            <a onClick={this.handleShowMore}
                                               className="btn_full_off"
                                            >더보기</a>
                                        );
                                    }
                                })()
                            }
                        </div>
                    </div>
                </section>
                {
                    checkedSet.size > 0 && visible && (
                        <div className="action_layer">
                            <span
                                onClick={this.handleDelete}
                            >선택한 자료 삭제하기</span>
                            <a onClick={this.handleCloseDeleteLayer}
                               className="btn_close3"><span className="blind">닫기</span></a>
                        </div>
                    )
                }
            </Fragment>
        );
    }
}

export default MyPutData;
