/**
 *  파일 화이트 리스트 체크
 * @param ext
 * @returns {boolean}
 */
export const isFileUploadWhiteList = (ext) => {
	let result = false;
	let whiteList = ['jpg','png','jpeg','gif','bmp','wav','avi','mp3','mp4','asf','mpeg','hwp','txt','doc','docx','xls','xlsx','ppt','pptx','pdf','zip','7z'];
	for(let i=0; i<whiteList.length; i++){
		if(whiteList[i].toLowerCase() === ext.toLowerCase()){
			result = true;
			break;
		}
	}
	return result;
};