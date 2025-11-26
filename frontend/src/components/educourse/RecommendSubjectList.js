import React, { Component } from 'react';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';

const RecommendSubject = ({contentId, subject, thumbnailPath, handleViewer}) => {
    const background = DOWNLOAD_IMAGE_PATH + thumbnailPath;
    return (
        <li className="myclass_favor_list">
            <a
                onClick={() => {
                    handleViewer(contentId);
                }}
                className="myclass_favor_video icon_video_type2"
            >
                <img src={background} alt={subject} />
                <span className="blind">{subject} 동영상 보기</span>
            </a>
            <div className="myclass_favor_item_tit">
                <h3 className="myclass_favor_item_title">
                    {subject}
                </h3>
            </div>
        </li>
    );
}

class RecommendSubjectList extends Component {
    render() {
        const { recommendSubjects, handleViewer } = this.props;
        const recommentSubjectList = recommendSubjects.map((subject, index) => {
            return <RecommendSubject {...subject} key={subject.contentId} handleViewer={handleViewer}/>;
        });
        return (
            <ul className="myclass_favor_box">
                {recommentSubjectList}
            </ul>
        );
    }
}

export default RecommendSubjectList;