export const sendDLink = () => {
    return new Promise((resolve, reject) => {
        window.webViewBridge.send('sendDynamicUrl', '', (res) => {
            //console.log('sendDynamicUrl return value : ' + JSON.stringify(res));
            if (res.value) {
                // 응답값이 정상일경우
                resolve(res.value);
            }else{
                reject();
            }
        }, (err) => {
            //console.log(err);
            // 응답값이 비정상일경우
            reject(err);
        });
    });
};

export const resetDLink = () => {
    return new Promise((resolve, reject) => {
        window.webViewBridge.send('resetDynamicUrl', '', (res) => {
            if (res.value) {
                // 확인만
                //console.log('resetDLink Function Called');
                resolve(res.value);
            }else{
                reject();
            }
        }, (err) => {
            //console.log(`resetDLink Url Function Error While calling ${err.toString()}`);
            reject(err);
        });
    });
}