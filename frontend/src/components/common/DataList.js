import React, {Component} from 'react';
import { DataItem } from 'components/common';

class DataList extends Component {
    render() {
        const { metaData, handleViewer } = this.props;
        return (
            <div className="classbytimes_box_depth">
                {
                    metaData.map(data => {
                        const { contentId, contentGubun, subject, fileType, saveFileNm, siteUrl} = data;
                        return <DataItem
                                    key={contentId}
                                    subject={subject}
                                    contentId={contentId}
                                    contentGubun={contentGubun}
                                    saveFileNm={saveFileNm}
                                    fileType={fileType}
                                    siteUrl={siteUrl}
                                    handleViewer={handleViewer}/>;
                    })
                }
            </div>
        );
    }
}

export default DataList;
