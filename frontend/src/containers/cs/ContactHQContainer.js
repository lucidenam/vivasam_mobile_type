import React, { Component } from 'react';
import {initializeGtag} from "../../store/modules/gtag";

class ContactHQContainer extends Component {

    componentDidMount() {
        try {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/cs/contact/hq',
            'page_title': '본사 찾아오시는 길｜비바샘'
        });
        const mapContainer = document.getElementById('map');
        let mapOption = {
            center: new window.daum.maps.LatLng(37.4073003, 126.9842935),
            level: 4
        };
        let map = new window.daum.maps.Map(mapContainer, mapOption);
            // ReactGA.pageview('/cs/contact/hq', null, '본사 찾아오시는 길｜비바샘');
            // const mapContainer = document.getElementById('map');
            // let mapOption = {
            //     center: new window.daum.maps.LatLng(37.48725840062864, 126.89450532184752),
            //     level: 4
            // };
            // let map = new window.daum.maps.Map(mapContainer, mapOption);

            // 지도 확대 축소
            var zoomControl = new window.daum.maps.ZoomControl();
            map.addControl(zoomControl, window.daum.maps.ControlPosition.RIGHT);

            let geocoder = new window.daum.maps.services.Geocoder();
            let callback = function (result, status) {
                if (status === window.daum.maps.services.Status.OK) {
                    let lan = parseFloat(result[0].y);
                    let lon = parseFloat(result[0].x);
                    let marker = new window.daum.maps.Marker({
                        map: map,
                        position: new window.daum.maps.LatLng(lan, lon)
                    });
                    map.setCenter = new window.daum.maps.LatLng(lan, lon);
                }
            };
            geocoder.addressSearch('경기 과천시 과천대로2길 54', callback);
        }catch (e) {
            //console.log(e);
        }
    }

    render() {
        return (
            <section className="locationAreaWrap">
                <h2 className="blind">본사 찾아오시는 길</h2>
                <div className="locationArea">
                    {/* <!-- 지도영역 --> */}
                    <div className="locationMap">
                        <div id="map" style={{width:'100%', height:'200px'}}></div>
                    </div>
                    {/* <!-- //지도영역 --> */}

                    <strong className="location_sub_title mt65">본사 주소</strong>
                    <p className="location_sub_txt mt5">경기 과천시 과천대로2길 54 그라운드브이 14층</p>
                    
                    <strong className="location_sub_title mt25">문의 및 안내</strong>
                    <div className="table_list mt10">
                        <table>
                            <caption>
                                본사의 전화번호/팩스번호 및 전화걸기 정보제공
                            </caption>
                            <colgroup>
                                <col style={{width:'70%'}} />
                                <col />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className="table_list_th"><span className="table_list_title">전화번호</span></th>
                                    <th scope="col" className="table_list_th"><span className="table_list_title">전화걸기</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="table_list_td">
                                        <p className="location_center_sm">일반문의</p>
                                        <p className="location_num mt5">1544-7714</p>
                                    </td>
                                    <td className="table_list_td">
                                        <a href="tel:1544-7714" className="ico_tel ico_tel_static"></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        );
    }
}

export default ContactHQContainer;