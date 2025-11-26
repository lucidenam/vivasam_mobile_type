import React, {Component} from 'react';
import * as common from 'lib/common'
import {onClickCallLinkingOpenUrl} from "../../lib/OpenLinkUtils";

class DataItem extends Component {

    render() {
        const { contentId, contentGubun ,subject, handleViewer, fileType, saveFileNm, siteUrl } = this.props;
        return (
            <a
                onClick={handleViewer}
                data-id={contentId}
                className="classbytimes_box_link"
            >
                <span className={"file_icon icon_"+common.getFileIconClass(fileType, saveFileNm, contentGubun)}>
                    <span className="blind">{common.getContentIcon(saveFileNm)}</span>
                </span>
                {subject}
            </a>
        );
    }
}

export default DataItem;
