import React from 'react';
import {DOWNLOAD_IMAGE_PATH} from '../../constants';

const Middle = ({classNo, teacher, classNames, movieUrls, movieIds, openViewer}) => {
    return (
        <li className="live_subject_list">
            <h3 className="live_subject_tit">{classNo}차시<em className="live_subject_marker">{teacher}</em></h3>
            {classNames[0] !== undefined &&
            <div className="live_subject_item"
                    data-type='video'
                    data-name={classNames[0]}
                    data-gubun='CN030'
                    data-nosave='true'
                    data-src={movieUrls[0]} onClick={openViewer}>
                {classNames[0]} 
                <a className="live_subject_link icon_video"><span className="blind">동영상 재생</span></a>
            </div>
            }
            {classNames[1] !== undefined &&
            <div className="live_subject_item"
                    data-type='video'
                    data-name={classNames[1]}
                    data-gubun='CN030'
                    data-nosave='true'
                    data-src={movieUrls[1]} onClick={openViewer}>
                {classNames[1]}
                <a className="live_subject_link icon_video"><span className="blind">동영상 재생</span></a>
            </div>
            }
            {classNames[2] !== undefined &&
            <div className="live_subject_item"
                    data-type='video'
                    data-name={classNames[2]}
                    data-gubun='CN030'
                    data-nosave='true'
                    data-src={movieUrls[2]} onClick={openViewer}>
                {classNames[2]}
                <a className="live_subject_link icon_video"><span className="blind">동영상 재생</span></a>
            </div>
            }
        </li>
    )
}

const MiddleClassAppraisalList = ({tooltipActive, goBack, openLayer, openViewer, doDownload}) => {
    const middleClassLists = [
        {
            classNo : 1,
            teacher : '국광윤',
            classNames : ['교육 환경의 변화', '교육 패러,다임의 흐름'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_1차시_교육 환경의 변화(국광윤).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_1차시_교육 패러다임의 흐름(국광윤).mp4'
            ],
            movieIds : ['158857', '158858']
        },
        {
            classNo : 2,
            teacher : '국광윤',
            classNames: ['자유학기제 교육과정의 이해', '2015 개정 교육과정의 이해'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_2차시_자유학기제 교육과정의 이해(국광윤).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_2차시_2015 개정 교육과정의 이해(국광윤).mp4'
            ],
            movieIds: ['158860', '158859']
        },
        {
            classNo : 3,
            teacher : '국광윤',
            classNames : ['교육과정 재구성의 의미', '교육과정 재구성 방법'],
            movieUrls : [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_3차시_교육과정 재구성의 의미(국광윤).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_3차시_교육과정 재구성 방법(국광윤).mp4'
            ],
            movieIds : ['158861', '158862']
        },
        {
            classNo : 4,
            teacher : '장아름',
            classNames : ['국어과에서 주제 중심 통합 수업의 필요성', '이야기가 있는 공익 광고 만들기'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_4차시_국어과에서 주제 중심 통합 수업의 필요성(장아름).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_4차시_이야기가 있는 공익 광고 만들기(장아름).mp4'
            ],
            movieIds : ['158864', '158863']
        },
        {
            classNo : 5,
            teacher : '최정아',
            classNames : ['학생 참여 수업을 촉진하고 수업 개선에 도움을 주는 평가', '수학과에서의 교육과정 재구성 – 수업 – 평가의 일체화'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_5차시_학생 참여 수업을 촉진하고 수업 개선에 도움을 주는 평가(최정아).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_5차시_수학과에서의 교육과정 재구성-수업-평가의 일체화(최정아).mp4'
            ],
            movieIds: ['158872', '158871']
        },
        {
            classNo : 6,
            teacher : '고혁',
            classNames: ['드라마 기법 기반(DBI) 영어 읽기 수업 과정', '과정중심 읽기 평가 기준 및 사례', '읽기 과정 및 평가 내용의 학교 생활 기록부 기록'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_6차시_드라마 기법 기반(DBI) 영어 읽기 수업 과정(고혁).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_6차시_과정중심 읽기 평가 기준 및 사례(고혁).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_7차시_읽기 과정 및 평가 내용의 학교 생활 기록부 기록(고혁).mp4'
            ],
            movieIds: ['158866', '158865', '158867']
        },
        {
            classNo : 7,
            teacher : '허성연',
            classNames : ['과학의 교육 패러다임', '배움을 위한 안전한 공간 조성 1', '배움을 위한 안전한 공간 조성 2'],
            movieUrls : [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_7차시_과학의 교육 패러다임(허성연).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_8차시_배움을 위한 안전한 공간 조성 1(허성연).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_8차시_배움을 위한 안전한 공간 조성 2(허성연).mp4'
            ],
            movieIds: ['158868', '158869', '158870']
        },
        {
            classNo : 8,
            teacher : '김수길',
            classNames : ['학습자 성장을 위한 학생 참여형 수업과 평가의 필요성', '학습자와 함께하는 사회/도덕과 수업 평가 계획하기 사례'],
            movieUrls: [
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_9차시_학습자 성장을 위한 학생 참여형 수업과 평가의 필요성(김수길).mp4',
                DOWNLOAD_IMAGE_PATH + '/VS/FREESTUDY/movie/contents/[비상교육] 중등 수업 평가 혁신 강의_9차시_학습자와 함께하는 사회도덕과 수업 평가 계획하기 사례(김수길).mp4'
            ],
            movieIds : ['158873', '158874']
        }
    ]

    const middleClass = middleClassLists.map(middle => {
        return (<Middle {...middle} openViewer={openViewer} key={middle.classNo}/>);
    });

    return (
        <div>
            <section className="live_teaching live_teaching_detail">
                <h2 className="blind">창체·수업연구</h2>
                <div className="live_teaching_top">
                    <p className="live_teaching_intro">
                        <em>평가 동향, 설계, 적용, 기록까지!</em> 평가 전문 교사들이
                            교육과정 변화에 따른 평가 <em>패러다임의 변화와 생생한
                            수업 평가 사례</em>를 소개합니다.</p>

                    <button className="btn_square_empty mb25" onClick={doDownload.bind(this, 'CN030-206223')}>2018 자료집 다운로드</button>
                </div>
                <ul className="live_subject">
                    {middleClass}
                </ul>
            </section>
            <br/>
        </div>
    );
};

export default MiddleClassAppraisalList;
