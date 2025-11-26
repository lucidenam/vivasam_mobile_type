import React, { Component,Fragment } from 'react';
import ThumbnailItem from 'components/common/ThumbnailItem';
import ContentLoading from 'components/common/ContentLoading';
import RenderLoading from 'components/common/RenderLoading';

class ThumbnailList extends Component {

    shouldComponentUpdate(nexProps, nextState) {
        if(this.props.loading !== nexProps.loading){
            return true;
        }
        return this.props.metaData !== nexProps.metaData;
    }

    render() {
        const { metaData, type, totalElements, handleViewer, hideTotalCount, loading } = this.props;
        let thumbnailList;
        if(loading){
            return <RenderLoading loadingType={"3"}/>
        }else if(Object.keys(metaData).length !== 0){
            thumbnailList = metaData.map(
                (data, index) => {
                    const {contentId, contentGubun, subject, thumbnail, summary, filePath, filename, sourceName, fileType, siteUrl } = data;
                    let src = filePath+filename;
                    return (
                        <ThumbnailItem
                            key={index}
                            contentId={contentId}
                            contentGubun={contentGubun}
                            subject={subject}
                            thumbnail={thumbnail}
                            src={src}
                            summary={summary}
                            sourcename={sourceName}
                            type={type}
                            handleViewer={handleViewer}
                            fileType={fileType}
                            siteUrl={siteUrl}
                            />
                    )
                }
            );
        }else if(totalElements === 0 ){
            return (
                <div className="empty_result_wrap">
                    <span className="integration_icon integration_icon_empty"></span>
                    <p className="empty_info_text1"><span className="highlight">검색 결과가 없습니다.</span></p>
                </div>
            )
        }else{
            return <RenderLoading/>
        }
        return (
            <Fragment>
                {
                    !hideTotalCount && (
                        <p className="categori_search_guide">
                            총 <em className="categori_search_marker">{totalElements}</em>개의 자료가 있습니다.
                        </p>
                    )
                }
                <div className="library_list">
                    {thumbnailList}
                </div>
            </Fragment>
        );
    }
}

export default ThumbnailList;
