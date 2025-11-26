import React from 'react';

const SurveyBanner = ({surveyList,handleClick}) => {
    if(!surveyList) return null;
    return (
        <div className="section viva_promote">
            <a
                href=""
                onClick={handleClick}
                className="block">
                <h2 className="title promote_title">
                    {Number(surveyList.surveyMonth)}월 비바샘 설문조사
                </h2>
                <span className="label_ing promote_lable">진행중</span>
                <p className="promote_desc">
                    <span dangerouslySetInnerHTML={{__html: surveyList.subject}}></span>
                </p>
            </a>
        </div>
    )
}

export default SurveyBanner;
