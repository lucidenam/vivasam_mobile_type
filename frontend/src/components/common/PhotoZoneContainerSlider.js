import React, { Component, Fragment } from 'react';
import Slider from "react-slick";
import PhotoZone from "components/common/PhotoZone";

{/* 비바샘 포토존 Container - 2단계 */}
class PhotoZoneContainerSlider extends Component {

    constructor(props) {
        super(props);
    }

    // 포토존 이전 이동
    searchPrevPhotoZoneContainer = () => {
        this.props.searchPhotoZone(this.props.photoZoneData[0].prePhotoIdx);
    };

    // 포토존 다음 이동
    searchNextPhotoZoneContainer = () => {
        this.props.searchPhotoZone(this.props.photoZoneData[0].nextPhotoIdx);
    };



    render() {
        const {photoZoneData} = this.props;
        if(!photoZoneData || photoZoneData.length === 0) return null;

        //slick option 설정
        const settings = {
            dots: true,
            arrows: false,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            centerMode: true,
            variableWidth : true,
            className: 'photozone_slide'
        };


        //이벤트 리스트
        const photoZoneList = photoZoneData.map(photoZone => {
            const photoZoneProps = {...photoZone};
            return (<PhotoZone {...photoZoneProps} />);
        });

        return (
            <div className="photozone">
                <div className="tit">
                    <h3><span className="blind">비바샘 포토존</span></h3>
                    <p>비상교육 전문 사진 작가가 직접 촬영한 사진을 계기 이슈에 맞추어 제공합니다.</p>
                </div>
                <div className="top">
                    <div className="keyword">{this.props.photoZoneData[0].photoKeyWord }</div>
                    <div className="date">
                        <button type="button" className="prev"  onClick={this.searchPrevPhotoZoneContainer}><span className="blind">이전</span></button>
                        {this.props.photoZoneData[0].startDt.substring(4,6) }월  {this.props.photoZoneData[0].startDt.substring(6,8) }일 ~ {this.props.photoZoneData[0].endDt.substring(4,6) }월 {this.props.photoZoneData[0].endDt.substring(6,8) }일
                        <button type="button"  className="next" onClick={this.searchNextPhotoZoneContainer}><span className="blind">다음</span></button>
                    </div>
                </div>
                <div className="photozone_wrap">
                    <Slider {...settings}>
                        {photoZoneList}
                    </Slider>
                </div>
            </div>
        );
    }
}

export default PhotoZoneContainerSlider;
