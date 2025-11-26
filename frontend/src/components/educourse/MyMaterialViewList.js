import React, {Component, Fragment} from 'react';
import * as common from 'lib/common'

const MaterialView = ({subject, schoolLvlNm, textbookNm, contentId, handleViewer, contentGubun, fileType, saveFileName}) => {
    let pointClazz = "pointC";
    /*if(schoolLvlNm === '초등') {
        pointClazz = "pointD";
    }else if(schoolLvlNm === '중학') {
        pointClazz = "pointC";
    }else if(schoolLvlNm === '고등') {
        pointClazz = "pointE";
    }*/

    return (
        <li className="lecture_item">
            <a
                onClick={() => {
                    handleViewer(contentId,contentGubun,subject);
                }}
                className="lecture_link"/*  style={{padding: "25px 20px 25px 20px"}} */
            >
                <span className={"file_icon icon_"+common.getFileIconClass(fileType, saveFileName, contentGubun)} style={{left: "0px"}}>
                    <span className="blind">pdf</span>
                </span>
                <strong className="course">{subject}</strong>
                <span className={"c_num "+pointClazz}>{schoolLvlNm}</span> <span className="c_txt">{textbookNm}</span>
            </a>
        </li>
    );
}

class MyMaterialViewList extends Component {
    render() {
        const { myMaterialViews, handleViewer } = this.props;
        const myPutDataList = myMaterialViews.map((data, index) => {
            return <MaterialView {...data} key={data.contentId} handleViewer={handleViewer}/>
        });

        return (
            <Fragment>
                {myPutDataList !== null && myPutDataList.size > 0 ?
                    <Fragment>
                        <div className="myclass_readme_top ">
                            <p className="description">가장 최근에 열람하신 10개의 자료가 노출됩니다.</p>
                        </div>
                        <ul className="myclass_readme_box lecture_list">
                            {myPutDataList}
                        </ul>
                    </Fragment>
                    :
                    <Fragment>
                        <div className="myclass_readme_top ">
                            <p className="description">최근 열람하신 자료가 없습니다.</p>
                        </div>
                    </Fragment>
                }
            </Fragment>
        );
    }
}

export default MyMaterialViewList;
