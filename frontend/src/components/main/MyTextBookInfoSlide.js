import React from 'react';
import {Link} from 'react-router-dom';
import Slider from "react-slick";
import {DOWNLOAD_IMAGE_PATH, DOWNLOAD_IMAGE_PATH_22} from '../../constants';

const EmptyBook  = ({handleClick, loginInfo}) => {
    function checkSchoolLvl() {
        return function () {
            alert('중고등 회원 전용 서비스입니다.');
            return false;
        };
    }

    if (loginInfo.schoolLvlCd === 'ES') {
        return (
            <div className="myBook_item no_item">
                <a className="myBook_link block" onClick={checkSchoolLvl()}>
                    <span className="myBook_no">내 교과서 설정</span>
                    <span className="myBook_title"></span>
                </a>
            </div>
        )
    } else {
        return (
            <div className="myBook_item no_item">
                <Link to="/educourse/myclassSetup/textbook">
                    <a className="myBook_link block">
                        <span className="myBook_no">내 교과서 설정</span>
                        <span className="myBook_title"></span>
                    </a>
                </Link>
            </div>
        )
    }
}

const MyBook = ({textbookCd,schoolLvl,labCourse,labTextbook,thumbnailPath,fileCdnYn,eduYear}) => {
    let classNm = labTextbook.substring(0,labTextbook.lastIndexOf("(")).trim(); //과목명
    let teacherNm = labTextbook.substring(labTextbook.lastIndexOf("(")).trim(); //담당자명
    let lvlNm = '';

    if(schoolLvl.indexOf("ES") !==-1) lvlNm = "초등";
    else if(schoolLvl.indexOf("MS") !==-1) lvlNm = "중학";
    else if(schoolLvl.indexOf("HS") !==-1) lvlNm = "고등";
    else lvlNm="";

    let renewer_year = " y15"
    if(eduYear !== '2015') {
        renewer_year = ' y22';
    }

    return (
        <div className={"myBook_item"+renewer_year}>
            <Link
                to={"/educourse/textbook/"+textbookCd}
                className="myBook_link block">
                <span className="myBook_img">
                    <img src={(eduYear === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22)+thumbnailPath} alt={lvlNm + " " +classNm}/></span>
                <em className={"renewer_year"+renewer_year}>{eduYear == '2015' ? '15' : '22'} 개정</em>
                <span className="myBook_title">
                    <span className="classNm">{classNm}</span>
                    <span className="teacherNm">{teacherNm}</span>
                    {/* {classNm + " " + teacherNm} */}
                </span>
            </Link>
        </div>
    )
}

const MyTextBookInfoSlide = ({myBooks, handleClick,loginInfo}) => {
    if(!myBooks) return null;

    //slick option 설정
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        arrows: false,
        //className: 'myBook_list'
    };

    //내교과서 리스트
    const myBookList = myBooks.map(book => {
        const bookProps = {...book, key : book.textbookCd };
        return (<MyBook {...bookProps}/>);
    });

    //빈그림 넣기
    let listSize = 0;
    /*
    if(myBookList.length === 0 ){ //설정된 내교과서 없을때 빈그림3개 넣기
        listSize =3;
    } else  if(myBookList.length !==12 && myBookList.length % 3 !== 0) {
        listSize = 3 - myBookList.length % 3;
    } else if(myBookList.length !==12 && myBookList.length % 3 === 0){
        listSize =1;
    }*/
    if(myBookList.length < 12) {
        listSize = 1;
    }

    if(listSize>0){
         for(let i = 0 ; i <listSize ;i++){
             myBookList.push(<EmptyBook key={i} handleClick={handleClick} loginInfo={loginInfo}/>) ;
         }
    };

    return (
        <div className="myBook_wrap">
            <div id="myBook_list" className="myBook_list">
                {/*<Slider {...settings} >*/}
                        {myBookList}
                {/*</Slider>*/}
            </div>
        </div>
    );
};

export default MyTextBookInfoSlide;
