export const ACCESS_TOKEN = 'accessToken';
export const SESSION_LOGGED_KEY = 'logged';
export const DOWNLOAD_IMAGE_PATH = 'https://dn.vivasam.com';
export const DOWNLOAD_IMAGE_PATH_22 = 'https://dn22.vivasam.com';
export const PUBLIC_DOMAIN = 'https://www.vivasam.com';
export const CONVERT_IMAGE_PATH = 'https://www.vivasam.com/vivasamfiledir/';
export const SERVER_LOCAL_IMAGE_PATH = 'https://mv.vivasam.com/vivasamfiledir/';
export const LP_DOMAIN_PATH = 'http://author.vivasam.com/captureImage/';


export const ES_APP_STORE_URL = {
    IOS: 'http://apps.apple.com/kr/app/id1569142311',
    ANDROID: 'market://details?id=com.visang.vivasam.esmobile',
    //ANDROID_INTENT: 'intent://me.vivasam.com#Intent;scheme=mevivasammobile;package=com.visang.vivasam.esmobile;end'
    ANDROID_INTENT: 'intent://intro?url=/#/#Intent;scheme=mevivasammobile;package=com.visang.vivasam.esmobile;end'
};

export const MS_HS_APP_STORE_URL = {
    IOS : 'https://apps.apple.com/kr/app/id1445530612',
    ANDROID : 'market://details?id=com.visang.vivasam.mobile',
    //ANDROID_INTENT : 'intent://mv.vivasam.com#Intent;scheme=mvvivasammobile;package=com.visang.vivasam.mobile;end'
    ANDROID_INTENT : 'intent://intro?url=/#/#Intent;scheme=vivasammobile;package=com.visang.vivasam.mobile;end'
};

// APP Store 에 올라가 있는 최신 배포 버젼 (여기만 수정하면 됨)
export const IOS_VERSION_CURRENT = '1.1.5';
// Google Store 에 올라가 있는 최신 배포 버젼 (여기만 수정하면 됨)
export const ANDROID_VERSION_CURRENT = '1.2.6.8';
// IOS OS TARGET VERSION (여기만 수정하면 됨)
export const IOS_OS_TARGET_VERSION = '13';

// APP Store 배포 심사 버젼
export const IOS_INSPECTOR_VERSION = '1.0.8';
// Google Store 배포 심사 버젼
export const ANDROID_INSPECTOR_VERSION = '1.1.3.7';

// Android FB dynamic Links 버젼 적용 버젼
export const ANDROID_MV_FB_DYN_LINKS_ENABLE_VERSION = '1.2.3.9';
// 향후 IOS 상황에 따라
export const IOS_FB_DYN_LINKS_ENABLE_VERSION = '1.1.0';

// 공용 Cookie Domain
export const COMMON_COOKIE_DOMAIN = '.vivasam.com';
// 공용 Cookie Key MV (중고등)
export const COMMON_COOKIE_KEY_MV = 'mvivav';
// Cover 출력 Page 유형 (MV 는 Document Replace)
export const SIDE_MV = 'MV';
// URL 이 변경되는 시점을 실시간 감지하는 구간 Flag
// 를 이용하여 Cover Page 를 출력한다.
// False 이면 비활성화 / True 이면 활성화
export const isHookWhenCoverShow = false;
// Cover Page On / Off
// 여기서 true 하면 Cover Page 보여짐 적용 아니면 모두 OFF
export const isActivateCoverShield = false;
// Cover MECV
export const COVER_MVCV = 'mvcv';
export const KAKAOTALK = 'mozilla/5.0 (linux; android 11; sm-a908n build/rp1a.200720.012; wv) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/94.0.4606.80 mobile safari/537.36;kakaotalk 2309520';
export const NAVER = 'mozilla/5.0 (linux; android 11; sm-a908n build/rp1a.200720.012; wv) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/80.0.3987.163 whale/1.0.0.0 crosswalk/25.80.14.29 mobile safari/537.36 naver(inapp; search; 1000; 11.6.7)';
export const MOVE_TO_APP_MV = 'MOVE_MV';
export const MOVE_TO_APP_ME = 'MOVE_ME';
export const AOS_BR_TYPE = 'AOS_BR';
export const IOS_BR_TYPE = 'IOS_BR';
export const IS_DOUBLE_BUTTON_USE_ON_HS_COVER = true;
export const COVER_EXPIRED_DATE = 1;
export const IOS_CHOOSE_SCREEN_UP = true;
export const IS_UC_LOCK = false;
export const IS_ALL_DL_LETTERS_CONVERT_AS_LOWER = true;
export const EX_DAYS_END = 365;
export const D_LINK_KEY = 'type';
export const D_LINK_VALUE = 'd';