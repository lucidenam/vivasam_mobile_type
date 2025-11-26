import React, { Component, Fragment } from 'react';
import * as api from 'lib/api';
import ContentLoader from "react-content-loader"
import PhotoZoneContainerSlider from "components/common/PhotoZoneContainerSlider";

{/* 비바샘 포토존 Container - 1단계 */}
class PhotoZoneContainer extends Component {
    state = {
        PhotoZoneData : [], // PhotoData
        loading : true // Render 시 바로 실행되지 않도록 적용
    };

    componentDidMount() {
        this._isMounted = true;
        this.photoZone();
    };

    componentWillUnmount() {
        this._isMounted = false;
    };

    // 포토존 검색
    photoZone = async (PHOTO_IDX) => {
        const response =  await api.photoZone(PHOTO_IDX);
        this.setState({
            PhotoZoneData: response.data,
            loading: false
        })

    };

    // 포토존 이전 / 다음 검색
    searchPhotoZone = (PHOTO_IDX) => {
        if(PHOTO_IDX != '' && PHOTO_IDX != null){
            this.photoZone(PHOTO_IDX);
        }
    };

    render() {
        const SliderLoding = props => (
            <ContentLoader
                rtl
                height={750}
                width={750}
                speed={2}
                primaryColor="#f3f3f3"
                secondaryColor="#ecebeb"
                {...props}
            >
                <rect x="0" y="0" rx="5" ry="5" width="750" height="760" />
            </ContentLoader>
        );
        const {loading} = this.state;
        return (
            <Fragment>
                {loading ? <SliderLoding/> : <PhotoZoneContainerSlider photoZoneData={this.state.PhotoZoneData} searchPhotoZone={this.searchPhotoZone}/>}
            </Fragment>
        );
    }
}

export default PhotoZoneContainer;
