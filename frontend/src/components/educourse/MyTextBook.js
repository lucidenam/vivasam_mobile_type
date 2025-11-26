import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import {DOWNLOAD_IMAGE_PATH_22} from "../../constants";

class MyTextBook extends Component {
    shouldComponentUpdate(nextProps, nextState){
        return (nextProps.textbookCd !== this.props.textbookCd);
    }
    render() {
        const {schoolLvl,labTextbook,thumbnailPath,eduYear,textbookCd} = this.props;
        let classNm = labTextbook.substring(0,labTextbook.lastIndexOf("(")); //과목명
        let teacherNm = labTextbook.substring(labTextbook.lastIndexOf("(")); //담당자명
        let lvlNm = '';

        if(schoolLvl.indexOf("ES") !==-1) lvlNm = "초등";
        else if(schoolLvl.indexOf("MS") !==-1) lvlNm = "중학";
        else if(schoolLvl.indexOf("HS") !==-1) lvlNm = "고등";
        else lvlNm="";

        let mdClazz = " pointA"
        if(eduYear !== '2015') {
            mdClazz = ' pointB';
        }

        return (
            <div className="myBook_item">
                <Link
                    to={"/educourse/textbook/"+textbookCd}
                    className="myBook_link block"
                >
                    <span className="myBook_img">
                        <img
                            src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22)+thumbnailPath}
                            alt={lvlNm + " " +classNm}
                        />
                    </span>
                    <em className={"myBook_lable"+ mdClazz}>{eduYear} 개정</em>
                    <span
                        className="myBook_title"> {lvlNm + " " +classNm}<br/>{teacherNm}</span>
                </Link>
            </div>
        );
    }
}

export default MyTextBook;