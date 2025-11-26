import {DOWNLOAD_IMAGE_PATH} from "../../constants";
import {DOWNLOAD_IMAGE_PATH_22} from "../../constants";

const notUndefOrNull = val => val !== undefined && val !== null;
const getClientRect = elem => {
  const { x, left, width } = elem.getBoundingClientRect();
  return { width, x: !isNaN(x) ? +x : +left };
};

const testPassiveEventSupport = () => {
  let passiveSupported = false;

  try {
    let options = {
      get passive() { // This function will be called when the browser
        // attempts to access the passive property.
        passiveSupported = true;
        return false;
      }
    };

    window.addEventListener('testPassiveEventSupport', options, options);
    window.removeEventListener('testPassiveEventSupport', options, options);
  } catch(err) {
    passiveSupported = false;
  }
  return passiveSupported;
};

export const getContentTarget = (content) => {

  try {
    let {
      contentId,
      contentGubun,
      filePath,
      saveFileName,
      fileType,
      subject,
      summary,
      sourceName,
      copyrightName,
      siteUrl,
      downYn,
      mdValue
    } = content;
    let type;
    if (fileType === 'FT201' || fileType === 'FT204') {
      type = 'video';
    } else if (fileType === 'FT202') {
      type = 'audio';
    } else if (fileType === 'FT203') {
      type = 'image';
    } else if (saveFileName && (saveFileName.includes('.zip') || saveFileName.includes('.ZIP'))) {
      type = 'etc';
    } else if (fileType === 'FT205') {
      type = 'document';
    } else if (contentGubun === 'CN070') {
      type = 'smart';
    } else if (fileType === 'FT207') {
      type = 'html';
    } else if (fileType === 'FT206') {
      type = 'ibook';
    } else {
      type = 'etc';
    }

    //vbook 1이면 외부 URL로 튕김
    let vbook = siteUrl && siteUrl.includes('vbook') ? 1 : 0;

    return {
      dataset: {
        type: type,
        src: (mdValue === '2015' ? DOWNLOAD_IMAGE_PATH : DOWNLOAD_IMAGE_PATH_22) + filePath + saveFileName,
        name: subject,
        id: contentId,
        gubun: contentGubun,
        summary: summary,
        sourcename: sourceName || copyrightName,
        siteurl: siteUrl,
        downYn: downYn,
        fileType: fileType,
        vbook: vbook
      }
    };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export { notUndefOrNull, getClientRect, testPassiveEventSupport };
