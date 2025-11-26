import React, {Component} from 'react';
import * as common from 'lib/common';

class TextBookDataList extends Component {
    handleShowDetail = (textbookInfo, data) => {
        const { handleShowDetail } = this.props;
        if(data.useYn == "Y"){
            handleShowDetail(data);
        }else{
            common.info("추후 제공될 예정입니다.\n감사합니다.");
            return false;
        }

        function gtag(){
            window.dataLayer.push(arguments);
        }

        gtag('event', '2025 개편', {
            'parameter': '교과서 상세',
            'parameter_value': textbookInfo.textbookNm + "_" + data.unitNum + '. ' + data.class1Nm,
            'parameter_url': window.location.href
        });
    }

    render() {
        const { textbookInfo, gubunCd, dataList } = this.props;
        return (
            <div className="classdetail_box">
                <ul>
                    {
                        dataList.map(data => {
                            return (
                                <li key={data.class1Cd + data.class2Cd} className="classdetail_box_list">
                                    <a
                                        onClick = {() => {
                                            this.handleShowDetail(textbookInfo, data);
                                        }}
                                        className={"classdetail_box_link" + (data.newIcon != undefined ? data.newIcon : '')}>
                                        { gubunCd === 'L' && data.unitNum + '. ' + data.class1Nm }
                                        { gubunCd === 'C' && data.class2Nm }
                                        { gubunCd === 'S' && data.class2Nm+"("+data.dataCnt+")" }
                                    </a>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
}

export default TextBookDataList;