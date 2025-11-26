/**
 * LocalStorage Set Up By Key
 * @param key
 * @param value
 */
export const setItemIntoLocalStorage = (key , value) => {
    try {
        localStorage.setItem(key, value);
    }catch (e) {
        //console.log(`setItemIntoLocalStorage Exception : ${e}`);
    }
};

/**
 * LocalStorage Get Value By Key
 * @param key
 */
export const getItemFromLocalStorage = (key) => {
    try {
        if(isExistDataInLocalStorageByItems(key)){
            return localStorage.getItem(key);
        }
    }catch (e) {
        //console.log(`getItemFromLocalStorage Exception : ${e}`);
        return '';
    }
};

/**
 * LocalStorage Remove Value By Key
 * @param key
 */
export const removeItemFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    }catch (e) {
        //console.log(`removeItemFromLocalStorage Exception : ${e}`);
    }
};

/**
 * Reset Saved All Data in LocalStorage
 * You should not use in usual cases
 * Just in Case get it?
 */
export const clearAllResetFromLocalStorage = () => {
    try {
        localStorage.clear();
    }catch (e) {
        //console.log(`clearAllResetFromLocalStorage Exception : ${e}`);
    }
};

/**
 * get Value By Index
 * @param index
 */
export const getSavedLocalStorageDataKey = (index) => {
    try {
        return localStorage.key(index);
    }catch (e) {
        //console.log(`getSavedLocalStorageDataKey Exception : ${e}`);
        return '';
    }
};

/**
 * LocalStorage Property 값 키로
 * 해당 Item 존재여부 확인
 * @param key
 * @returns {boolean}
 */
export const isExistDataInLocalStorageByProperty = (key) => {
    try {
        if (localStorage.hasOwnProperty(key)) {
            return true;
        } else {
            return false;
        }
    }catch (e) {
        return false;
    }
};

/**
 * 저장된 Key 로 해당 아이템 존재여부 확인
 * @param key
 */
export const isExistDataInLocalStorageByItems = (key) => {
    try {
        let items = localStorage.getItem(key);
        //console.log(`isExistDataInLocalStorageByItems : ${items}`);
        if(items){
            return true;
        }else{
            return false;
        }
    }catch (e) {
        return false;
    }    
};

/**
 * LocalStorage 안에 저장된 모든 Key 조회후
 * 여기서 조회된 Key 와 Value 일체를 script 
 * dictionary 로 반환
 */
export const getSavedAllDataFromLocalStorage = () => {
    let dicObj = {};
    try{
        for(let i = 0 ; i < localStorage.length; i++){
            let key = localStorage.key(i);
            //console.log(`getSavedKeysInLocalStorage :: ${key} ${localStorage.getItem(key)}`);
            dicObj[key] = localStorage.getItem(key);
        }

        if(dicObj){
            //console.log(`getSavedKeysInLocalStorage :: ${JSON.stringify(dicObj)}`);
        }
        return dicObj;
    }catch (e) {
        //console.log(`getSavedKeysInLocalStorage Exception :: ${e}`);
        return {};
    }
};

/**
 * LocalStorage 안에 저장된 모든 값(Value)을 가져온다.
 * 참고 : key index 와 매칭되는 값(Value)을 가져오는것이다.
 */
export const getSavedAllDataValueFromLocalStorage = () => {
    // let dicObj = {};
    // let val = localStorage.key(i);
    // console.log(`getSavedAllDataLocalStorage :: ${val}`);
};

/**
 * when take place event from localstorage
 * @param e
 */
export const onStorageEvent = (callB) => {
    try {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
        window.onstorage = (e) => {
            callB({
                key: e.key,
                url: e.url,
                oldValue: e.oldValue,
                newValue: e.newValue,
                storageType: e.storageArea
            });
        }
    }catch (e) {
        //console.log(`onStorageEvent Exception : ${e}`);
        callB({extState: true});
    }
};

