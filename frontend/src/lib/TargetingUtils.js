/**
 * 광고스크립트 처리
 * @param {String} ty
 * @returns
 */
export const callTrackingTag  = (ty) => {
    let img = document.createElement('img');
    let params = 'ti=52428&device=mobile&v=1&im=img&ty='+ty
    if(ty === 'PurchaseComplete'){
        params += '&i0=이벤트&t0=이벤트&p0=1&q0=1';
    }
    img.src = 'https://astg.widerplanet.com/delivery/wpc.php?'+params;
    const wp_tg_cts = document.getElementById("wp_tg_cts");
    wp_tg_cts.appendChild(img);
    while (wp_tg_cts.hasChildNodes()) {
        wp_tg_cts.removeChild(wp_tg_cts.firstChild);
    }
};

/**
 * 운영환경인지 조회
 * @returns {boolean}
 */
export const isProd  = () => {
    let result = false;
    if(window.location.origin == 'https://mv.vivasam.com'){
        result = true;
    }
    return result;
};