import React, { Component,Fragment } from 'react';

class ThumbnailItem extends Component {
    render() {
        const { contentId, contentGubun, subject, thumbnail, type, src, summary, sourcename, handleViewer, fileType, siteUrl } = this.props;
        let clazz = '';
        if(fileType === 'FT204'){
            clazz = ' type2';
        } else if(type === 'image'){
            clazz = ' type3';
        }
        return (
            <div className={"library_item item_video" + clazz }>
                <a
                    onClick={handleViewer}
                    className="library_thumb">
                    <img
                        src={thumbnail}
                        data-id={contentId}
                        className="thumb_img"/>
                </a>
                <p className="library_title">
                    {subject}
                </p>
            </div>
        );
    }
}

export default ThumbnailItem;
