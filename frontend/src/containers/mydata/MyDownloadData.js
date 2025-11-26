import React, {Component, Fragment} from 'react';
import { myDownDataList, myDownDataTextbookList } from 'lib/api';
import * as common from 'lib/common';
import { ContentLoading, RenderLoading } from 'components/common';
import {initializeGtag} from "../../store/modules/gtag";

class MyDownloadData extends Component {
    state = {
        page: {
            number: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        },
        myDownDataTextbooks: [],
        myDownloadDatas: null,
        selectedTextbookCd: '',
        isLoading: false,
        isRendering: false
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    getMyDownDataTextbookList = async () => {
        try {
            const response = await myDownDataTextbookList();
            if(this._isMounted) {
                this.setState({
                    myDownDataTextbooks: response.data
                });
            }
        }catch(e) {
            console.log(e);
        }
    }

    getMyDownDataList = async (textbookCd, type1Cd, isMore) => {
        const { myDownloadDatas, page } = this.state;
        const { number, size } = page;

        try {
            this.setState(isMore ? {
                isLoading: true
            } : {
                isRendering: true
            });
            const response = await myDownDataList(textbookCd, type1Cd, isMore ? number + 1 : 0 , size);
            if(this._isMounted) {
                this.setState({
                    page: response.data.page,
                    myDownloadDatas: isMore ? [...myDownloadDatas, ...response.data.content.map(data => data.content)] : response.data.content.map(data => data.content),
                    isLoading: false,
                    isRendering: false
                });
            }
        }catch(e) {
            console.log(e);
        }
    }

    handleShowMore = () => {
        const {selectedTextbookCd} = this.state;
        this.getMyDownDataList(selectedTextbookCd, null, true);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.selectedTextbookCd != nextState.selectedTextbookCd) {
            this.getMyDownDataList(nextState.selectedTextbookCd);
            return false;
        }
        return (this.state != nextState);
    }

    componentDidMount() {
        initializeGtag();
        /*
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-B7GPBXLL3E', {
            'page_path': '/mydata/put',
            'page_title': '다운로드 자료｜비바샘'
        });
        */

        this._isMounted = true;
        this.getMyDownDataTextbookList();
        this.getMyDownDataList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { page, myDownDataTextbooks, myDownloadDatas, selectedTextbookCd, isLoading, isRendering } = this.state;
        const { handleViewer } = this.props;
        const hasNext = page.number+1 < page.totalPages;

        if(myDownloadDatas === null || isRendering) {
            return <RenderLoading loadingType={"2"}/>;
        }

        return (
            <section className="myData">
                <h2 className="blind">다운로드 자료</h2>

                <div className="myData_wrap">
                    <div className="myData_result">
                        총 <em className="count">{page.totalElements}</em>개
                    </div>
                    <div className="selectbox selTypeA" style={{width: '140px'}}>
                        <select
                            name="selectedTextbookCd"
                            value={selectedTextbookCd}
                            onChange={this.handleChange}
                        >
                            <option value="">교과서별 보기 선택</option>
                            {
                                myDownDataTextbooks.map(book => {
                                    return (
                                        <option key={book.textbookCd}
                                                value={book.textbookCd}
                                        >{book.schoolLvlNm} > {book.textbookNm}</option>
                                    );
                                })
                            }
                        </select>
                    </div>

                    <div className="lecture my_down">
                        <ul>
                            {
                                myDownDataTextbooks.length > 0 ? (
                                    myDownloadDatas.map(down => {
                                        return (
                                            <li key={down.contentId}
                                                className="lecture_item">
                                                <a
                                                    onClick={()=>{handleViewer(down.contentId,down.contentGubun,down.subject)}}
                                                    className="lecture_link">
                                                    <span className={"file_icon icon_"+common.getFileIconClass(down.fileType, down.saveFileNm, down.contentGubun)}>
                                                        <span className="blind">{common.getContentIcon(down.saveFileNm)}</span>
                                                    </span>
                                                    <strong className="course">{down.subject}</strong>
                                                    <span className="c_num pointC">{down.schoolLvlNm}</span> <span className="c_txt">{down.textbookNm}</span>
                                                </a>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className={"pt100"}>
                                        <p style={{textAlign:'center'}}>자료를 다운로드 하신 내역이 없습니다.</p>
                                    </li>
                                )
                            }

                        </ul>
                        {
                            hasNext && (() => {
                                if(isLoading) {
                                    return <ContentLoading/>;
                                }else {
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
        );
    }
}

export default MyDownloadData;
