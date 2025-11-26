package edu.visang.vivasam.common.utils;
import edu.visang.vivasam.common.constant.VivasamConstant;

import edu.visang.vivasam.common.model.FileUploadWhiteList;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.security.SecureRandom;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VivasamUtil {
    public static final String rowsep = "\f";     // 행 분리자
    public static final String colsep = "!^"; // 열 분리자
    public static final String arrsep = "\b"; // 배열 분리자
    public static final String rssep = "!@";  // 레코드셋 분리자

    public static final String splitrowsep = "\\f";           // java의 split 메소드에서 사용할때 행 분리자
    public static final String splitcolsep = "\\!\\^";        // java의 split 메소드에서 사용할때 열 분리자
    public static final String splitarrsep = "\\b";           // java의 split 메소드에서 사용할때 배열 분리자
    public static final String splitrssep = "\\!\\@"; // java의 split 메소드에서 사용할때 레코드셋 분리자

    private static final int TOKEN_LENGTH = 32; // 세션 검증용 토큰 길이
    private static final int EXPIRY_MINUTES = 240; // 세션 검증용 토큰 유효시간 (24시간)
    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // 세션 검증용 토큰 생성용 문자열

    public static String isNullCheck(String str) {
        if ((str == null) || (str.trim().equals("")) || (str.trim().equalsIgnoreCase("null")) || (str.trim().length() == 0) || (str.equalsIgnoreCase("undefined")))
            return "";
        else
            return str.trim();
    }

    public static String isNull(String str) {
        if ((str == null) || (str.trim().equals("")) || (str.trim().equalsIgnoreCase("null")) || (str.trim().length() == 0) || (str.equalsIgnoreCase("undefined")))
            return "";
        else
            return str.trim();
    }

    public static String isNullWithNull(String str) {
        if ((str == null) || (str.trim().equals("")) || (str.trim().equalsIgnoreCase("null")) || (str.trim().length() == 0) || (str.equalsIgnoreCase("undefined")))
            return null;
        else
            return str.trim();
    }

    public static String isNull(String str, String str2) {
        if ((str == null) || (str.trim().equals("")) || (str.trim().equalsIgnoreCase("null")) || (str.trim().length() == 0) || (str.equalsIgnoreCase("undefined")))
            return str2;
        else
            return str.trim();
    }

    public static String isNullNumber(String str) {
        if ((str == null) || (str.trim().equals("")) || (str.trim().equalsIgnoreCase("null")) || (str.trim().length() == 0) || (str.equalsIgnoreCase("undefined")))
            return "1";
        else
            return str.trim();
    }

    public static int isNumber(int num) {
        if (num < 0 || num == 0) {
            return 1;
        } else {
            return num;
        }
    }

    public static int isNumber(int num, int _num) {
        if (num < 0 || num == 0) {
            return _num;
        } else {
            return num;
        }
    }

    public static int isNumber(String num, int _num) {
        int tmpNum = 0;

        try {
            tmpNum = Integer.parseInt(num);
        } catch (NumberFormatException nfe) {
            tmpNum = _num;
        }

        return tmpNum;
    }
    
    /*
     * 두 날짜 사이의 차이를 숫자 일수로  리턴, 심원보, 20150821
     */
    public static long doDiffOfDate(String startDt, String endDt) {
    	try {
    		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    		
    		Date date1 = sdf.parse(startDt);
    		Date date2= sdf.parse(endDt);
    		
    		long diff = date1.getTime() - date2.getTime();
    		long diffDays = diff / (24 * 60 * 60 * 1000);
    		
    		return diffDays;
    	} catch (Exception e) {
        	System.out.println("doDiffOofDate Exception =================================");
        	System.out.println(e.getMessage());
        	System.out.println("doDiffOofDate Exception =================================");
            return -1;
        }
    }

    public static int isNewButtonCheck(String date) {
        try {
        	//DateFormat fmt=DateFormat.getDateInstance();
        	SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        	
        	Date date1 = sdf.parse(sdf.format(new Date()));
        	Date date2 = sdf.parse(date); 
        	
        	long a = date1.getTime();
        	long b = date2.getTime();
        	long c = a - b;
        	
        	int term = (int)(c / (1000 * 60 * 60 * 24));

            if (term >= 0 && term <= 7) {
                return 1;
            }
            return 0;
        } catch (Exception e) {
        	System.out.println("isNewButtonCheck Exception =================================");
        	System.out.println(e.getMessage());
        	System.out.println("isNewButtonCheck Exception =================================");
            return -1;
        }

    }

    public static String getKenString(String str, int len) throws UnsupportedEncodingException {

        String fStr = str;
        int sLen = str.length();

        if (sLen > len) {
            fStr = str.substring(0, len) + "...";
        }

        return fStr;
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
     * Function : getDateFormat
     * Parameter : String format - 반환 받고자하는 데이터 형식(yyyyMMdd/yyyy-MM-dd 등)
     * Description : 입력된 format Parameter와 일치하는 형식으로 현재날짜를 반환한다.
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getDateFormat(String format) {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
     * Function : getDateFormat
     * Parameter : String format - 반환 받고자하는 데이터 형식(yyyyMMdd/yyyy-MM-dd 등)
    	   Date date_val - 반환될 날짜 데이터값
     * Description : 입력된 format Parameter와 일치하는 형식으로 입력된 날짜를 반환한다.
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getDateFormat(String format, Date date_val) {
        Date dt = date_val;
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 날짜를 반환한다. (yyyyMMdd)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayFormat() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 날짜를 반환한다. (yyyy-MM-dd)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayFormat2() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 날짜를 반환한다. (yyyy-MM-dd-hh-mm-ss)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayFormat3() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd-hh-mm-ss");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 날짜를 반환한다. (yyyyMMddhhmmss)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayFormat4() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddhhmmss");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 날짜를 반환한다. (yyyy-MM-dd hh:mm:ss)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayFormat5() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayYear Parameter + Description + 오늘 년도를 반환한다. (yyyy) ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayYear() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayMonth Parameter + Description + 오늘 월를 반환한다. (MM) ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayMonth() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("MM");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayDay Parameter + Description + 오늘 날짜를 반환한다. (dd) ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayDay() {
        Date dt = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("dd");
        return sdf.format(dt);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 요일을 반환한다.(문자형식) (월요일)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayCalendar() {
        Calendar cal = Calendar.getInstance();
        String[] week = { "일", "월", "화", "수", "목", "금", "토" };

        return week[cal.get(Calendar.DAY_OF_WEEK) - 1] + "요일";
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 오늘 요일을 반환한다.(숫자형식) (1)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static int getTodayCalendar2() {
        Calendar cal = Calendar.getInstance();
        int[] week = { 1, 2, 3, 4, 5, 6, 7 };   // 참조 : 일요일은 1 토요일은 7

        return week[cal.get(Calendar.DAY_OF_WEEK) - 1];
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getTodayFormat Parameter + Description + 숫자형식 요일을 문자형식 요일로 변환하여 반환한다 (1:일요일~~~)
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getTodayCalendar(int i_week) {
        // String[] week = {"일","월","화","수","목","금","토"};
        String week = "";
        if (i_week == 1) {
            week = "일";
        } else if (i_week == 2) {
            week = "월";
        } else if (i_week == 3) {
            week = "화";
        } else if (i_week == 4) {
            week = "수";
        } else if (i_week == 5) {
            week = "목";
        } else if (i_week == 6) {
            week = "금";
        } else if (i_week == 7) {
            week = "토";
        }

        return week + "요일";
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getSelected Parameter + param1, param2 Description + 두 값을 비교해서 같으면 "Selected" 를 반환한다.
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getSelected(String param1, String param2) {
        if (param1.equals(param2))
            return "Selected";
        else
            return "";
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getChecked Parameter + param1, param2 Description + 두 값을 비교해서 같으면 "Checked" 를 반환한다.
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String getChecked(String param1, String param2) {
        if (param1.equals(param2))
            return "Checked";
        else
            return "";
    }

    /*
     * 파일 업로드취약점
     */
    public int fileUploadCheck(String fileName) {
        int result = 0;
        String check = fileName.substring(fileName.lastIndexOf("."));

        if (check.equalsIgnoreCase(".php") || check.equalsIgnoreCase(".php3") || check.equalsIgnoreCase(".asp") || check.equalsIgnoreCase(".jsp") || check.equalsIgnoreCase(".cgi")
                || check.equalsIgnoreCase(".inc") || check.equalsIgnoreCase(".pl") || check.equalsIgnoreCase(".exe") || check.equalsIgnoreCase(".sh") || check.equalsIgnoreCase(".bat")) {
            result = 1;
        } else {
            result = 0;
        }

        return result;
    }

    /*
     * 이미지파일업로드 체크
     */
    public int fileUploadCheckJpg(String fileName) {
        int result = 0;
        String check = fileName.substring(fileName.lastIndexOf("."));

        if (check.equalsIgnoreCase(".jpg") || check.equalsIgnoreCase(".jpeg") || check.equalsIgnoreCase(".gif")) {
            result = 1;
        } else {
            result = 0;
        }

        return result;
    }

    /*
     * 동영상파일업로드 체크
     */
    public int fileUploadCheckMovie(String fileName) {
        int result = 0;
        String check = fileName.substring(fileName.lastIndexOf("."));

        if (check.equalsIgnoreCase(".wmv") || check.equalsIgnoreCase(".avi")) {
            result = 1;
        } else {
            result = 0;
        }

        return result;
    }

    /*
     * 파일 확장자 가져오기
     */
    public String fileUploadExt(String fileName) {
        String check = fileName.substring(fileName.lastIndexOf("."));
        check = VivasamUtil.replace(check, ".", "");

        return check;
    }

    /*
     * 문자 치환 replace "123" ,"2", "" -> "13"
     */
    public static String replace(String _src, String _target, String _dest) {
        if (_src == null || _src.trim().length() == 0)
            return _src;
        if (_target == null)
            return _src;

        StringBuffer tmpBuffer = new StringBuffer();

        int nStart = 0;
        int nEnd = 0;
        int nLength = _src.length();
        int nTargetLength = _target.length();

        while (nEnd < nLength) {
            nStart = _src.indexOf(_target, nEnd);
            if (nStart < 0) {
                tmpBuffer.append(_src.substring(nEnd, nLength));

                break;
            } else {
                tmpBuffer.append(_src.substring(nEnd, nStart)).append(_dest);

                nEnd = nStart + nTargetLength;
            }
        }

        return tmpBuffer.toString();
    }

    /**
     * 데이터 형이 숫자인지 문자인지 체크하는 메소드
     * 
     * @param value
     *            숫자면 true 문자면 false
     * @return boolean
     */
    public static boolean checkInt(String value) {
        boolean returnVal = false;
        int a = 0;
        int b = 0;
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (0x30 <= c && c <= 0x39) {
                a++;
            } else {
                b++;
            }
        }
        if (a > 0) {
            returnVal = true;
        } else if (b > 0) {
            returnVal = false;
        }
        return returnVal;
    }

    /**
     * 영문/ 숫자 존재 여부 체크 메서드 *
     * 
     * @param value
     * @return 0:영문/숫자 미존재 1:영문/숫자 존재 2:영문 존재 3:숫자 존재
     */
    public static int checkStrInt(String value) {
        int type = 0;   // 0:영문/숫자 미존재 1:영문/숫자 존재 2:영문 존재 3:숫자 존재
        int type1 = 0; // 영문
        int type2 = 0; // 숫자
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            // 영문
            if ((0x61 <= c && c <= 0x7A) || (0x41 <= c && c <= 0x5A)) {
                type1 = 1;
                // 숫자
            } else if (0x30 <= c && c <= 0x39) {
                type2 = 1;
            }
        }

        if (type1 == 0 && type2 == 0) {   // 영문 숫자 미존재
            type = 0;
        } else if (type1 == 1 && type2 == 0) {             // 영문만 존재
            type = 2;
        } else if (type1 == 0 && type2 == 1) {             // 숫자만 존재
            type = 3;
        } else {  // 영문/숫자 존재
            type = 1;
        }

        return type;
    }

    /**
     * System.out.print를 줄이기 위한 메소드
     * 
     * @param value
     */
    public static void nPrint(String value) {
        //logger.info(value);
    }

    /*
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Function + getSplit Parameter + str, param Description + str 문자를 param 구분자로 Split 한 후 배열로 반환한다.
     * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     */
    public static String[] getSplit(String str, String param) {
        StringTokenizer st = new StringTokenizer(str, param);
        String[] split = new String[st.countTokens()];
        int i = 0;

        while (st.hasMoreTokens()) {
            split[i] = st.nextToken();
            i++;
        }
        return split;
    }

    /**
     * session NULL 체크
     */
    public String getSession(HttpSession session, String attrName) {
        return session.getAttribute(attrName) != null ? (String) session.getAttribute(attrName) : "";
    }

    public static String getUniqueFileName(String path, String file) {
        File tmp = new File(path + file.toLowerCase());
        String fileName = file.toLowerCase();
        int i = 0;

        //logger.info("------------------>exist" + tmp.exists());
        if (tmp.exists()) {
            while (tmp.exists()) {
                if (fileName.indexOf(".") != -1) {
                    String lcTemp = "(" + i + ").";
                    fileName = file.toLowerCase().replaceAll(".", lcTemp);
                } else {
                    fileName = file.toLowerCase() + "(" + i + ")";
                    tmp = new File(path + fileName);
                    i++;
                }
            }
        }
        return fileName;
    }

    /**
     * 이메일 주소 유효성 체크
     * 
     * @param email
     * @return boolean
     */
    public static boolean isEmail(String email) {
        if (email == null)
            return false;
        boolean b = Pattern.matches("[\\w\\~\\-\\.]+@[\\w\\~\\-]+(\\.[\\w\\~\\-]+)+", email.trim());
        return b;
    }

    /**
     * 현재 유닉스 타임 가져오기
     * 
     * @return
     */
    public static long getTodayUnixtime() {
        return System.currentTimeMillis() / 1000;
    }

    /**
     * 현재 유닉스 타임 + 초
     * 
     * @param secend
     * @return
     */
    public static long getTodayUnixtime(int secend) {
        return System.currentTimeMillis() / 1000 + secend;
    }

    /**
     * 날짜 더하기 메서드
     * 
     * @param dateString
     *            YYYYMMDD
     * @param addDate
     *            더할 날짜 (3 -> 3일)
     * @return YYYYMMDD
     */
    public static String getTodayAddDate(String dateString, int addDate) {
        String result = "";

        // String dateString = "20120301";
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
        try {
            Date date = formatter.parse(dateString);
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(date);
            calendar.add(Calendar.DAY_OF_MONTH, +(addDate - 1));
            result = formatter.format(calendar.getTime());
        } catch (ParseException e) {
        }

        return result;
    }

    /**
     * 전체 자릿수와 숫자형 데이터를 입력받아 앞에 0을 붙인다 ex) appendLeftZero("1", 4) -> 0001
     * 
     * @param number
     *            숫자형 데이터
     * @param size
     *            전체 자릿수
     * @return
     */
    public static String appendLeftZero(String number, int size) {
        String result = number;
        int end = size - number.length();
        for (int i = 0; i < end; i++) {
            result = "0" + result;
        }

        return result;

    }

    /**
     * 프로퍼티 파일 경로와 프로퍼티 키를 입력받아 해당 프로퍼티 파일 안에 있는 키에 해당하는 값을 읽어온다
     * 
     * @param filepath
     *            프로퍼티 파일 경로
     * @param key
     *            입력받은 프로퍼티 파일 경로에 있는 프로퍼티 파일에 있는 프로퍼티 키
     * @return 프로퍼티 값
     */
    public static String getProperties(String filepath, String key) {
        String result = "";
        Properties props = null;
        FileInputStream fis = null;

        try {
            props = new Properties();
            fis = new FileInputStream(filepath);
            props.load(new java.io.BufferedInputStream(fis));
            result = props.getProperty(key).trim();
        } catch (Exception e) {

        } finally {
            try {
                fis.close();
            } catch (Exception e) {

            }
        }

        return result;
    }

    /**
     * 프로퍼티 파일 경로를 입력받아 해당 프로퍼티 파일의 key 값들을 가져온다
     * 
     * @param filepath
     *            프로퍼티 파일 경로
     * @return 프로퍼티 key값들
     */
    public static List<String> getPropertiesKeyset(String filepath) {
        List<String> result = new ArrayList<String>();
        Properties props = null;
        FileInputStream fis = null;

        try {
            props = new Properties();
            fis = new FileInputStream(filepath);
            props.load(new java.io.BufferedInputStream(fis));
            Set keyset = props.keySet();
            Iterator iter = keyset.iterator();
            while (iter.hasNext()) {
                String key = (String) (iter.next());
                result.add(key);
            }
        } catch (Exception e) {

        } finally {
            try {
                fis.close();
            } catch (Exception e) {

            }
        }

        return result;
    }

    /**
     * 파일명을 받아서 파일 타입을 리턴.
     * 
     * @param file_name
     * @return file_type : VS_CODE 테이블의 FT200 하위 코드
     */
    public static String getFileType(String file_name) {

        // 확장자를 구한다
        String ext = file_name.substring(file_name.lastIndexOf(".") + 1, file_name.length()).toUpperCase();
        String file_type = "";

        if ("GIF".equals(ext) || "PNG".equals(ext) || "JPG".equals(ext) || "JPEG".equals(ext) || "BMP".equals(ext)) {     // 이미지 파일이면
            file_type = VivasamConstant.IMAGETYPE;
        } else if ("DOC".equals(ext) || "DOCX".equals(ext) || "PPT".equals(ext) || "PPTX".equals(ext) || "XLS".equals(ext) || "XLSX".equals(ext) || "HWP".equals(ext) || "PDF".equals(ext)
                || "TXT".equals(ext)) { // 문서이면
            file_type = VivasamConstant.DOCTYPE;
        } else if ("MPG".equals(ext) || "AVI".equals(ext) || "MOV".equals(ext) || "MP4".equals(ext)) { // 동영상이면
            file_type = VivasamConstant.VIDEOTYPE;
        } else if ("MP3".equals(ext) || "OGG".equals(ext) || "WAV".equals(ext) || "WMA".equals(ext)) {  // 오디오면
            file_type = VivasamConstant.AUDIOTYPE;
        } else if ("SWF".equals(ext) || "FLA".equals(ext)) {  // Flash면
            file_type = VivasamConstant.FLASHTYPE;
        } else {  // 기타
            file_type = VivasamConstant.ETCTYPE;
        }
        return file_type;
    }
    
    /***************************************************
     * 작성자 : 김남배
     * 작성일 : 2012.07.26
     * 내  용 : 공백문자 제거용 함수 (예 : 키워드 검색시 사용)
     ***************************************************/
    public static String getWithoutSpace(String str) {
    	String tmp = str.trim();
    	tmp	= tmp.replace(" ", "");
    	return tmp;
    }
    
    /***************************************************
     * 작성자 : 이홍
     * 작성일 : 2012.08.13
     * 내  용 : 콤마(,) 를 제외한 모든 특수문자(Character Entities) 제거함수
     ***************************************************/    
    public static String replaceCEstr(String str){
        int str_length = str.length();
        String strlistchar = "";
        String str_imsi = "";
        String[] filter_word = {"","\\.","\\?","\\/","\\~","\\!","\\@","\\#","\\$","\\%","\\^","\\&","\\*","\\(","\\)","\\_","\\+","\\=","\\|","\\\\","\\}","\\]","\\{","\\[","\\\"","\\'","\\:","\\;","\\<","\\>","\\.","\\?","\\/"};
        
        for(int i=0;i<filter_word.length;i++){
            str_imsi = str.replaceAll(filter_word[i],"");
            str = str_imsi;
        }
    
        return str;
        
    }
    
    public static String listToString(List<String> src, String seperator) {
        StringBuffer sb = new StringBuffer();

        for (String tb : src) {
            if ((tb != null) && (!tb.equals(""))) {
                sb.append(tb);
                sb.append(seperator);
            }
        }

        if (sb.length() != 0)
            sb.deleteCharAt(sb.length() - 1);

        return (sb.length() == 0) ? null : sb.toString();
    }

    /**
     * 자료유형값에 따른 이미지명 리턴
     * @param gubun
     * @param key
     * @return
     */
    public static String getMediaKindValue(String gubun, String mediaKind){
        String result = "";
        
        if(gubun.equals("NAME")){
            if (mediaKind.equals("FT320")) {
                result = "/flag_formative_evaluation.gif";
            } else if (mediaKind.equals("FT321")) {
                result = "/flag_state.gif";
            } else if (mediaKind.equals("FT322")) {
                result = "/flag_description.gif";
            } else if (mediaKind.equals("FT323")) {
                result = "/flag_evaluation_mp3.gif";
            } else if (mediaKind.equals("FT324")) {
                result = "/flag_quiz.gif";
            } else if (mediaKind.equals("FT325")) {
                result = "/flag_performance_assessment.gif";
            } else if (mediaKind.equals("FT326")) {
                result = "/flag_unit_assessment.gif";
            } else if (mediaKind.equals("FT327")) {
                result = "/flag_home-study_materials.gif";
            } else if (mediaKind.equals("FT328")) {
                result = "/flag_item_pool.gif";
            } else if (mediaKind.equals("FT329")) {
                result = "/flag_summative_evaluation.gif";
            } else if (mediaKind.equals("FT330")) {
                result = "/flag_scholastic_ability_test.gif";
            } else if (mediaKind.equals("FT331")) {
                result = "/flag_5minute_test.gif";
                
            } else if (mediaKind.equals("FT332")) { // 고난도문제
                result = "/flag_high_level_question.gif";
            } else if (mediaKind.equals("FT333")) { // 어휘시험
                result = "/flag_vocabulary_test.gif";
            } else if (mediaKind.equals("FT334")) { // 중간고사
                result = "/flag_midterm.gif";
            } else if (mediaKind.equals("FT335")) { // 기말고사
                result = "/flag_final_exams.gif";
            } else if (mediaKind.equals("FT336")) { // 소단원문제
                result = "/flag_low_level_class.gif";
            } else if (mediaKind.equals("FT337")) { // 정답과해설
                result = "/flag_qna.gif";
            }
        } else if (gubun.equals("CLASS")) {
            if (mediaKind.equals("FT301")) {    // 수업PPT
                result = "thumbtype_ppt";
            } else if (mediaKind.equals("FT302")) { // 활동지
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT303")) { // 학습지
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT304")) { // 생각을 넓게
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT305")) { // 튼튼 배경지식
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT306")) { // 사진으로보는 학습
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT307")) { // 지도
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT308")) { // 백지도
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT309")) { // 단원요약
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT310")) { // 한자카드
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT311")) { // 보충자료
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT312")) { // 제재 학습지
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT313")) { // 이론 PPT
                result = "thumbtype_ppt";
            } else if (mediaKind.equals("FT314")) { // 이론 학습지
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT315")) { // 참고자료
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT316")) { // 문법정리
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT317")) { // 본문학습자료
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT318")) { // 글쓴이 알기
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT320")) { // 형성평가
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT321")) { // 논술형
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT322")) { // 서술형
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT323")) { // 평가 MP3
                result = "thumbtype_sound";
            } else if (mediaKind.equals("FT324")) { // 쪽지시험
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT325")) { // 수행평가
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT326")) { // 단원평가
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT327")) { // 학습지
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT328")) { // 문제은행
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT329")) { // 총괄평가
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT330")) { // 수능기출
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT331")) { // 5분테스트
                result = "thumbtype_etc";
            } else if (mediaKind.equals("FT332")) { // 고난도문제
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT333")) { // 어휘시험
                result = "thumbtype_move";
            } else if (mediaKind.equals("FT334")) { // 중간고사
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT335")) { // 기말고사
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT336")) { // 소단원문제
                result = "thumbtype_doc";
            } else if (mediaKind.equals("FT337")) { // 정답과해설
                result = "thumbtype_doc";
            }
        }else{
            if (mediaKind.equals("FT320")) {
                result = "형성평가";
            } else if (mediaKind.equals("FT321")) {
                result = "논술형";
            } else if (mediaKind.equals("FT322")) {
                result = "서술형";
            } else if (mediaKind.equals("FT323")) {
                result = "평가mp3";
            } else if (mediaKind.equals("FT324")) {
                result = "쪽지시혐";
            } else if (mediaKind.equals("FT325")) {
                result = "수행평가";
            } else if (mediaKind.equals("FT326")) {
                result = "단원평가";
            } else if (mediaKind.equals("FT327")) {
                result = "학습지";
            } else if (mediaKind.equals("FT328")) {
                result = "문제은행";
            } else if (mediaKind.equals("FT329")) {
                result = "총괄평가";   
            } else if (mediaKind.equals("FT330")) {
                result = "수능기출";              
            } else if (mediaKind.equals("FT331")) {
                result = "5분테스트";
            } else if (mediaKind.equals("FT336")) {
                result = "소단원문제";
            } else if (mediaKind.equals("FT337")) {
                result = "정답과해설";
            }
        }
        return result;
    }
    
    public static boolean isSecure(HttpServletRequest request) {
        boolean isSecure = false;

        /*
        logger.info("=[REFERER]===========================================[MEMBER -> LOGIN]=====");
        logger.info("PATH_INFO => " + request.getPathInfo());
        logger.info("AUTH_TYPE => " + request.getAuthType());
        logger.info("CONTEXT_PATH => " + request.getContextPath());
        logger.info("METHOD => " + request.getMethod());
        logger.info("REFERER => " + request.getHeader("Referer"));
        logger.info("PATH_INFO => " + request.getPathInfo());
        logger.info("QUERY_STRING => " + request.getQueryString());
        logger.info("URI => " + request.getRequestURI());
        logger.info("URL => " + request.getRequestURL());
        logger.info("SERVLET_PATH => " + request.getServletPath().toString());
        logger.info("PATH_TRANSLATED => " + request.getPathTranslated());
        logger.info("=[REFERER]===========================================[MEMBER -> LOGIN]=====");
         */

        try {
            URL url = new URL(request.getRequestURL().toString());
            String hostName = url.getHost();

            if (hostName.equals(VivasamConstant.SITE_DOMAIN)) {
                isSecure = request.isSecure();
            } else {
                isSecure = true;
            }

        } catch (Exception e) {

        }


        return isSecure;
    }

    public static boolean isLocal(HttpServletRequest request) {
        boolean isLocal = false;

        try {
            URL url = new URL(request.getRequestURL().toString());
            String hostName = url.getHost();

            if (!hostName.equals(VivasamConstant.SITE_DOMAIN)) {
                isLocal = true;
            }

        } catch (Exception e) {

        }

        return isLocal;
    }
    
    /***************************************************
     * 작성자 : 심원보
     * 작성일 : 2012.12.26
     * 내  용 : HTML 태그 제거함수
     ***************************************************/    
    public static String getClearHtmlStr(String content){
    	Pattern SCRIPTS = Pattern.compile("<(no)?script[^>]*>.*?</(no)?script>",Pattern.DOTALL);  
    	Pattern STYLE = Pattern.compile("<style[^>]*>.*</style>",Pattern.DOTALL);  
    	Pattern TAGS = Pattern.compile("<(\"[^\"]*\"|\'[^\']*\'|[^\'\">])*>");  
    	Pattern nTAGS = Pattern.compile("<\\w+\\s+[^<]*\\s*>");  
    	Pattern ENTITY_REFS = Pattern.compile("&[^;]+;");  
    	Pattern WHITESPACE = Pattern.compile("\\s\\s+");  

    	Matcher m;
    	m = SCRIPTS.matcher(content);  
    	content = m.replaceAll("");  
    	m = STYLE.matcher(content);  
    	content = m.replaceAll("");  
    	m = TAGS.matcher(content);  
    	content = m.replaceAll("");  
    	m = ENTITY_REFS.matcher(content);  
    	content = m.replaceAll("");  
    	m = WHITESPACE.matcher(content);  
    	content = m.replaceAll(" ");
    
        return content;
        
    }

    public static void showSubView(HttpServletRequest request, Model model) {
        String subUrl = VivasamUtil.isNullWithNull(request.getParameter("subUrl"));

        model.addAttribute("subUrl", subUrl);
    }
    
    /**
     * 
     * 이미지 사이즈 줄이기!!!
     * 
     * @param originalImage
     * @param imgWidth
     * @param imgHeight
     * @param type
     * @return
     */
    public static BufferedImage resizeImage(BufferedImage originalImage, int imgWidth, int imgHeight,  int type){
		BufferedImage resizedImage = new BufferedImage(imgWidth, imgHeight, type);
		Graphics2D g = resizedImage.createGraphics();
		g.drawImage(originalImage, 0, 0, imgWidth, imgHeight, null);
		g.dispose();
	 
		return resizedImage;
    }
    
    /***************************************************
     * 작성자 : 심원보
     * 작성일 : 2013.09.10
     * 내  용 : request가 모바일인지 PC인지 체크
     ***************************************************/    
    public static String getMobileAgentYn(HttpServletRequest request) {
    	String mobileAgentYn = "N";
    	String userAgent = request.getHeader("user-agent");    	
    	String[] browser = {"iPhone", "iPod", "BlackBerry", "Android", "Windows CE", "LG", "MOT", "SAMSUNG", "SonyEricsson", "HTC", "Server_KO_SKT", "SKT", "IEMobile"};
    	   
    	for (int i = 0; i < browser.length; i++) {
    		if(userAgent.matches(".*" + browser[i] + ".*")) {
    			mobileAgentYn = "Y";
    	     
    			break;
    	    }
    	}
    	
    	return mobileAgentYn;
    }
    
    /***************************************************
     * 작성자 : 심원보
     * 작성일 : 2013.12.16
     * 내  용 : 내부 로컬 아이피 여부(Y : 내부 로컬 아이피 / N : 외부 아이피)
     ***************************************************/    
    public static String getRemoteAddrYn(HttpServletRequest request) {
    	String remoteAddrYn = "N";
    	String remoteAddr = request.getRemoteAddr();
    	
    	if (remoteAddr.substring(0, 8).equals("10.30.0.") || remoteAddr.substring(0, 9).equals("106.241.5")) {
    		remoteAddrYn = "Y";
    	}    	
    	
    	return remoteAddrYn;
    }    
    
    /***************************************************
     * 작성자 : 심원보
     * 작성일 : 2014.04.10
     * 내  용 : request Parameter 출력
     ***************************************************/  
    public static void printRequestParam(HttpServletRequest request) {
    	String name = "";
    	
    	Enumeration param = request.getParameterNames();
    	
    	System.out.println("============================================================================================");
    	System.out.println("================================ request 전체 출력 ===============================================");
    	System.out.println("============================================================================================");
    	
    	while (param.hasMoreElements()) {
    		name = (String)param.nextElement();
    		
    		System.out.println(name + " : " + request.getParameter(name));
    	}
    	
    	System.out.println("============================================================================================");
    	System.out.println("============================================================================================");
    	System.out.println("============================================================================================");
    	
    }
    
    //서비스 페이지 도메인 리턴, 심원보, 20151203
    public static String getServerDomain(HttpServletRequest request) {
    	String serverDomain = "";
    	String serverName = request.getServerName();
    	int serverPort = request.getServerPort();
    	
    	//기본 포트 80 및 https(443 포트) 인 경우 포트 번호 제외
    	if (serverPort == 80 || request.isSecure()) {
    		serverDomain = serverName;
    	}
    	else {
    		serverDomain = serverName + ":" + serverPort;
    	}
    	
    	return serverDomain;
    }
    
    // Map 에서 값을 꺼낼때 Object 형을 String 으로 변환 하여 Get
    public static String getStringOfObject(Object obj){
    	String result = "";
    	if(obj != null && !"".equals(obj.toString())){
    		result = obj.toString();
    	}
    	return result;
    }

    public static boolean isApp(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");

        if(StringUtils.hasText(userAgent)) {
            userAgent = userAgent.toLowerCase();

            boolean isSafari = userAgent.matches(".*safari.*");
            boolean ios = userAgent.matches(".*iphone.*|.*ipod.*|.*ipad.*");

            //ios app
            if (ios && !isSafari) {
                return true;
            }else {
                //android app
                if("com.visang.vivasam.mobile".equals(request.getHeader("X-Requested-With"))){
                    return true;
                }
            }
        }

        return false;
    }

    public static String getClientIP(HttpServletRequest request) {

        String ip = request.getHeader("X-FORWARDED-FOR");

        if (ip == null || ip.length() == 0) {
            ip = request.getHeader("Proxy-Client-IP");
        }

        if (ip == null || ip.length() == 0) {
            ip = request.getHeader("WL-Proxy-Client-IP");  // 웹로직
        }

        if (ip == null || ip.length() == 0) {
            ip = request.getRemoteAddr() ;
        }

        if(ip != null && !"".equals(ip) && ip.indexOf(",") > -1){
            ip = ip.split(",")[0];
        }

        return ip;

    }

    public static String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7, bearerToken.length());
        }
        return null;
    }

    public static boolean isFileUploadWhiteList(String ext){
        boolean result = false;
        try {
            for (FileUploadWhiteList value : FileUploadWhiteList.values()) {
                if (value.getExt().toLowerCase().equals(ext.toLowerCase())) {
                    result = true;
                    break;
                }
            }
        }catch(Exception e) {
            result = false;
        }
        return result;
    }

    /**
     * 랜덤 토큰 생성
     */
    public static String generateRandomToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}



