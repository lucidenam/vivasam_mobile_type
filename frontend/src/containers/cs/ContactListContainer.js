import React, { Component } from 'react';
import * as api from 'lib/api';
import { ContactList } from 'components/cs';
import ContentLoading from 'components/common/ContentLoading';
import {initializeGtag} from "../../store/modules/gtag";

class ContactListContainer extends Component {

    constructor() {
        super();
        this.map = null;
        this.clusterer = null;
        this.markers = {};
        this.visangHQ = {
            name : '본사',
            addr : '경기 과천시 과천대로2길 54',
            // coords : new window.daum.maps.LatLng(37.48725840062864, 126.89450532184752)
            coords : new window.daum.maps.LatLng(37.4069356108481, 126.984295714902)
        };
        this.hereCoords = null;
        
        this.defaultMarkerImage = new window.daum.maps.MarkerImage(
                                    "https://t1.daumcdn.net/localimg/localimages/07/mapjsapi/2x/default_marker.png", 
                                    new window.daum.maps.Size(40, 42)
                            );
        this.hereMarkerImage = new window.daum.maps.MarkerImage(
                                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", 
                                    new window.daum.maps.Size(24, 35)
                            );
    }

    state = {
        allContact: [],
        sidoCodes : [],
        selectedSido : '',
        totalElements: 0,
        number: 0,
        contacts : [],
        visible : false,
        isLoading: false
    };
    
    
    componentDidMount() {
        initializeGtag();
        function gtag(){
            window.dataLayer.push(arguments);
        }
        gtag('config', 'G-MZNXNH8PXM', {
            'page_path': '/cs/contact',
            'page_title': '주변 지사 찾기｜비바샘'
        });
        // 시/도 select 목록 가져오기
        this.getSidoCodeList();

        // 지사 목록 가져오기(페이징, 필터링)
        this.getContactUsList();
        
        // 지도 생성
        this.initMap();
        
        // 현위치 마커 추가
        var vm = this;
        setTimeout(function(){
            vm.setCurrentPositionMarker();
        }, 3000);
    }

    /* 지도 생성 */
    initMap = () => {
        const mapContainer = document.getElementById('map');
        let mapOption = {
            center: this.visangHQ.coords,
            level: 4
        };
        this.map = new window.daum.maps.Map(mapContainer, mapOption);

        // 지도 확대 축소
        var zoomControl = new window.daum.maps.ZoomControl();
        this.map.addControl(zoomControl, window.daum.maps.ControlPosition.RIGHT);
    }

    /* 지도에 마커&인포윈도우 표시 */
    displayMarker = (isHere, coords, infoMessage) => {
        
        let markerImage = this.defaultMarkerImage;

        // 현위치 마커인 경우 마커이미지를 다르게 설정
        if(isHere) {
            markerImage = this.hereMarkerImage;
        }


        // 마커 생성
        let m = new window.daum.maps.Marker({
            map: this.map,
            position : coords,
            image: markerImage
        });

        // 인포윈도우의 메세지가 있는 경우만 인포윈도우를 생성한다.
        if(infoMessage) {
            // 인포윈도우를 생성
            let isOpened = false;
            let infowindow = new window.daum.maps.InfoWindow({
                content : '<div style="padding:5px;">' + infoMessage + '</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                removable : true // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다
            });
    
            // 마커에 클릭이벤트를 등록
            window.daum.maps.event.addListener(m, 'click', () => {
                if(isOpened) {
                    infowindow.close();
                    isOpened = false;
                } else {
                    infowindow.open(this.map, m);
                    isOpened = true;
                }
            });
        }

        return m;
    }

    /* 현위치 마커 생성 */
    setCurrentPositionMarker = () => {

        let callback = (position) => {
            this.hereCoords = new window.daum.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.displayMarker(true, this.hereCoords);

            // 모든 지사 마커 추가
            //this.setAllContactMarker();
        };

        let defaultCallback = () => {
            // 본사 마커 추가
            this.displayMarker(false, this.visangHQ.coords, '본사');
            this.map.setCenter(this.visangHQ.coords);

            // 모든 지사 마커 추가
            //this.setAllContactMarker();
        }
        defaultCallback();
        if(navigator.geolocation) {
            console.log('Geolocation is supported!');
            //TODO 시나리오 별 테스트 필요
            if (window.__isApp) {
                window.webViewBridge.send('reqPmsGPS', {"value": "true"}, function(res){
                    if (res.value === true) {
                        navigator.geolocation.getCurrentPosition(callback, defaultCallback);
                    }                    
                    else {
                        defaultCallback();    
                    }
                }, function(err){
                    defaultCallback();
                });
            }
            else {
                navigator.geolocation.getCurrentPosition(callback, defaultCallback);
            }            
        } else {
            console.log('Geolocation is not supported for this Browser/OS.'); 
            defaultCallback();
        }
    }

    /* 모든 지사 마커 생성 */
    setAllContactMarker = async() => {
        try {
            const geocoder = new window.daum.maps.services.Geocoder();
            const response = await api.allContactList();

            this.clusterer = new window.daum.maps.MarkerClusterer({
                map : this.map,
                averageCenter: true,
                minLevel: 12
            });
            
            let markerCnt = response.data.length;
            let closestMarker = null;
            let closestDistance = 0;
            let mapMarkers = [];
            response.data.map((marker) => {
                geocoder.addressSearch(marker.addr, (result, status) => {
                    markerCnt--;
                    if (status === window.daum.maps.services.Status.OK) {
                        let coords = new window.daum.maps.LatLng(result[0].y, result[0].x);

                        let m = this.displayMarker(false, coords, marker.ptnLn);
                        
                        marker = {...marker, position:coords, marker:m};
                        this.markers = {...this.markers, [marker.ptnCd]:m};

                        mapMarkers = [...mapMarkers, m];

                        if(this.hereCoords) { //현위치 좌표가 존재하면 가까운 지사를 함께 보여준다
                            let linePath = [this.hereCoords, coords];
                            let lineLine = new window.daum.maps.Polyline({path : linePath});
                            let distance = Math.round(lineLine.getLength());

                            if(closestDistance == 0 || closestDistance > distance) {
                                closestDistance = distance;
                                closestMarker = m;
                            }
                        }

                        if(markerCnt == 0) {
                            if(closestMarker) {
                                let bounds = new window.daum.maps.LatLngBounds();
                                bounds.extend(this.hereCoords);
                                bounds.extend(closestMarker.getPosition());
                                //closestMarker.setImage(this.hereMarkerImage);
                                this.map.setBounds(bounds);
                            }
                            this.clusterer.addMarkers(mapMarkers);
                        }
                    }
                });
            });
        } catch(e) {
            console.log(e);
        }
    }


    getSidoCodeList = async() => {
        try {
            const response = await api.sidoList();
            this.setState({
                sidoCodes : response.data
            })
        } catch (e) {
            console.log(e);
        }
    }

    getContactUsList = async(pageNo, changeSido) => {
        this.setState({isLoading: true});
        try {
            const isChangeFilter = typeof changeSido === 'undefined' ? false : (this.state.selectedSido === changeSido ? false : true);
            if(!isChangeFilter) changeSido = this.state.selectedSido;

            const response = await api.contactList(pageNo, changeSido);
            const result = response.data;
            const contacts = result.content ? result.content : [];
            const {totalElements, totalPages, number} = result.page;

            let visible = false;
            if(totalElements > 0 && totalPages > number+1) visible = true;

            this.setState({
                contacts : isChangeFilter ? [...contacts.map(n => n.content)] : [...this.state.contacts, ...contacts.map(n => n.content)],
                visible,
                totalElements,
                number,
                selectedSido : changeSido
            })
        } catch (e) {
            console.log(e);
        } finally {
            this.setState({isLoading: false});
        }
    }
    
    handleMoreButton = () => {
        this.getContactUsList(this.state.number+1);
    }

    handleChangeSido = (e) => {
        this.getContactUsList(1, e.target.value);
    }
    
    handleChangeMapCenter = (partnerCd) => (e) => {        
        let selectedPartner = this.markers[partnerCd];
        this.map.setLevel(4, {anchor: selectedPartner.getPosition()});
        this.map.setCenter(selectedPartner.getPosition());
        window.scrollTo(0, 0);
    } 

    render() {
        const sidoCodeOption = this.state.sidoCodes.map(code => {
            return <option key={code.code} value={code.code}>{code.name}</option>;
        });

        const {contacts, visible, selectedSido, isLoading} = this.state;

        return (
            <section className="locationAreaWrap">
                <h2 className="blind">주변지사 찾기</h2>
                <div className="locationArea">
                    {/* <!-- 지도영역 --> */}
                    <div className="locationMap">
                        <div id="map" style={{width:'100%', height:'200px'}}></div>
                    </div>
                    {/* <!-- //지도영역 --> */}

                    <div className="join_notice_simple icon_noti_type2">
                        <p className="join_notice_txt">지사명을 클릭하시면 지도로 위치를 확인할 수 있습니다.</p>
                    </div>
                    <div className="selectbox select_sm">
                        <select name='sido' value={selectedSido} onChange={this.handleChangeSido}>
                            <option value="">전체</option>
                            {sidoCodeOption}
                        </select>
                    </div>
                    <div className="table_list mt30">
                        <ContactList contacts={contacts} isLoading={isLoading} handleClick={this.handleChangeMapCenter} />
                    </div> 
                    {isLoading && contacts && contacts.length > 0 &&
                        <ContentLoading  />
                    }
                    <a onClick={this.handleMoreButton} className="btn_full_off btn_full_sm btn_txt_bold" style={{display: visible ? 'block' : 'none'}}>더보기</a>
                </div>
            </section>
        );
    }
}


export default ContactListContainer;