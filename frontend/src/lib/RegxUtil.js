/**
 * 정규식으로 문자열내 특정문자 검사
 *
 * @param isContainSlash slash 포함 검사 true nor false
 * @param letters 검사할 문자들
 * @returns {boolean} 결과 true 검출됨 아니면 false
 */
export const isFindRegxExtraLetter = (isContainSlash  = false, letters) => {
    let regExtra = /[`~!@$%^&*?]/gi;
    let regExtraExceptSlashAndBackSlash = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if(!isContainSlash){
        if(regExtra.test(letters)){
            return true;
        }else{
            return false;
        }
    }else{
        if(regExtraExceptSlashAndBackSlash.test(letters)){
            return true;
        }else{
            return false;
        }
    }
}

/**
 * URL Type Pattern
 */
export const isUrlTypePattern = (url) => {
    let RegExp = /(http(s)):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (RegExp.test(url)) {
        return true;
    }
    return false;
};

/**
 * Path 만 검색
 * @param letters
 * @returns {boolean}
 */
export const isFindPathRegx = (letters) => {
    let rexPath = /^\/([A-z0-9-_+]+\/)*([A-z0-9]+)$/gm;
    return rexPath.test(letters);
};

// /**
//  * 문자열내 영어와 숫자만 있는지 확인
//  * 대소문자 구분
//  */
// export const isFindEngNumeric = (letters) => {
//     let regx = /^[a-zA-Z0-9]*$/g;
//     return regx.test(letters);
// };

/**
 * Hangul Check
 * @param letters
 * @returns {boolean}
 */
export const isFindHangul = (letters) => {
    let regxHangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
    return regxHangul.test(letters);
};

/**
 * Script Tag 검출
 * @param val
 */
export const isFindScriptTag = (val) => {
    let scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    if(scriptRegex.test(val)){
        return true;
    }else{
        return false;
    }
};

// /**
//  * 추출된 쿼리 스트링만 따로 별개 체크
//  * @param qs
//  * @returns {boolean}
//  */
// export const isValidateQueryString = (qs) => {
//     let checkQs = /^\?([\w-]+(=[\w.\-:%+]*)?(&[\w-]+(=[\w.\-:%+]*)?)*)?$/
//     if(checkQs.test(qs)){
//         return true;
//     }else{
//         return false;
//     }
// };

/**
 * 분해된 URL Path 를 한번 더 체크한다.
 * 문제가 없으면 true 문제가 있으면 False 를 반환한다.
 * 유형 > /saemteo///sdfsd/ (False)
 *       /saemteo///sdfsdm (False)
 *       /saemteo/sdfsdf/sdfsdf (True)
 *       /saemteo/sdfsdf/sdfsdf.sdfs (False)
 * 참고로 DeepLink 에서 띄울때만 사용
 * @param val
 * @returns {boolean}
 */
export const isFindClearURLPathDetail = (val) => {
    // 파일 확장자 명 유형까지 기입했을떄를 명시하고 싶으면
    // ^(\/[a-z_\-\s0-9\.]+)+\.(txt|gif|pdf|doc|docx|xls|xlsx|js)$
    // 파일 확장자 명까지는 따지지는 않지만 뒤에 . 이후까지 true 의 결과를 받고 싶다면
    // ^(\/[a-z_\-\s0-9\.]+)+$
    let paCK = /^(\/[a-z_\-\s0-9]+)+$/;
    if(paCK.test(val)){
        return true;
    }else{
        return false;
    }
};