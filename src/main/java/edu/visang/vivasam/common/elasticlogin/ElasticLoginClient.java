package edu.visang.vivasam.common.elasticlogin;

import edu.visang.vivasam.exception.VivasamException;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.HttpParams;
import org.apache.http.ssl.SSLContexts;
import org.codehaus.jackson.map.ObjectMapper;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import javax.net.ssl.SSLContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpSession;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.*;


public class ElasticLoginClient {

    private final Log logger = LogFactory.getLog(ElasticLoginClient.class);

   final static String ELASTIC_LOGIN_SERVER = "https://sso.visang.com/auth/realms/vteacher";
   //  final static String ELASTIC_LOGIN_SERVER = "http://demo.elasticlogin.com:8080/auth/realms/vteacher";
    final static String REALM_CLIENT_ID = "vivasam-mobile-web";
    final static String EL_AUTHORIZATION = "Bearer vivasam-mobile-web:e3a8c08a-a363-4d73-a6b0-bab24a07f068";

    final static String LOGIN_PATH = "/protocol/openid-connect/token";
    final static String LOGOUT_PATH = "/protocol/openid-connect/logout";
    final static String CREATE_USER_PATH = "/visang-api/createUserInfo";
    final static String UPDATE_USER_PATH = "/visang-api/updateUserInfo";
    final static String DELETE_USER_PATH = "/visang-api/deleteUserInfo";
    final static String IS_EXIST_USER_PATH = "/visang-api/findUserByUserId";
    final static String UPDATE_USER_PASSWORD_PATH = "/visang-api/changePassword";


   final static String TSCHOOL_SERVER = "https://www.tschool.net";
   // final static String TSCHOOL_SERVER = "http://localhost:8280";
    private static final String VISANG_API_SECRET_HEADER_NAME = "X-Visang-Api-Key";
    private static final String VISANG_API_SECRET_HEADER_VALUE = "c44b2964-6a98-481d-bde6-f878953b8677";

    final static String CREATE_T_USER_PATH = "/api/v1/users";
    String UPDATE_T_USER_PATH = "/api/v1/users/%s";
    final static String EXIST_T_USER_PATH = "/api/v1/users";
    final static String AVAILABLE_T_USERNAME_PATH = "/api/v1/users/searchID";
    final static String UPDATE_T_USERNAME_PATH = "/api/v1/users/changeid";
    String LEAVE_T_USER_PATH = "/api/v1/users/escape/%s";
    String UPDATE_T_USER_PASSWORD_PATH = "/api/v1/users/%s/reset-password";
    String SYNC_T_USER_LOGIN_DTTM_PATH = "/api/v1/users/login/%s";
    String ROLLBACK_CREATE_T_USER_PATH = "/api/v1/users/rollback/%s";
    String WAKEUP_INACTIVE_T_USER_PATH = "/api/v1/users/active/%s";

    final static String FROM_SITE_NAME = "VIVASAM";

    private AccessTokenResponse token;
    private ObjectMapper mapper;

    boolean createdTschoolUser = false;

    public ElasticLoginClient() {
        this.mapper = new ObjectMapper();
    }

    public String getContent(HttpEntity entity) throws IOException {
        if (entity == null) return null;
        InputStream is = entity.getContent();
        try {
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            int c;
            while ((c = is.read()) != -1) {
                os.write(c);
            }
            byte[] bytes = os.toByteArray();
            String data = new String(bytes);
            return data;
        } finally {
            try {
                is.close();
            } catch (IOException ignored) {

            }
        }
    }

    public AccessTokenResponse login(String id, String pwd) {
        token = null;
        HttpClient client = new DefaultHttpClient();
        try {

            HttpPost post = new HttpPost(ELASTIC_LOGIN_SERVER + LOGIN_PATH);
            List <NameValuePair> formparams = new ArrayList <NameValuePair>();
            formparams.add(new BasicNameValuePair("username", id));
            formparams.add(new BasicNameValuePair("password", pwd));
            formparams.add(new BasicNameValuePair("grant_type", "password"));
            formparams.add(new BasicNameValuePair("client_id", REALM_CLIENT_ID));
            UrlEncodedFormEntity form = new UrlEncodedFormEntity(formparams, "UTF-8");
            post.setEntity(form);
            HttpResponse response = client.execute(post);
            int status = response.getStatusLine().getStatusCode();
            HttpEntity entity = response.getEntity();
            if (status != 200) {
                String json = getContent(entity);

//                throw new IOException("Bad status: " + status + " response: " + json);
                return null;
            }
            if (entity == null) {
//                throw new IOException("No Entity");
                return null;
            }
            String json = getContent(entity);
            //token = JsonSerialization.readValue(json, AccessTokenResponse.class);
            token = mapper.readValue(json, AccessTokenResponse.class);

        } catch (IOException e) {
//            throw new RuntimeException("-----------> failed to login");
            e.printStackTrace();
        } finally {
            client.getConnectionManager().shutdown();
        }

        return token;
    }



    private Map<String, String> getSSOtoken(Cookie[] cookies) {
        List<Cookie> cookieList = Arrays.asList(cookies);

        Map<String, String> tokens = new HashMap<>();

        for(Cookie c : cookieList) {
            if("ELASTIC_REFRESH".equals(c.getName()) || "ELASTIC_IDENTITY".equals(c.getName())) {
                tokens.put(c.getName(), c.getValue());
            }
            if(tokens.size() == 2) break;
        }
        return tokens;
    }

    public boolean logout(Cookie[] cookies) throws IOException {
        List<Cookie> cookie = Arrays.asList(cookies);
        String refreshToken = null;
        for(Cookie c : cookie) {
            if("ELASTIC_REFRESH".equals(c.getName())) {
                refreshToken = c.getValue();
                break;
            }
        }

        return signOut(refreshToken);
    }

    public boolean logout(HttpSession session) throws IOException {

        String refreshToken = (String) session.getAttribute("ELASTIC_REFRESH");
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        logger.debug(refreshToken);
        logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        return signOut(refreshToken);

    }


    private boolean signOut(String refreshToken) throws IOException {
        if(refreshToken != null) {

            HttpClient client = new DefaultHttpClient();
            try {

                HttpPost post = new HttpPost(ELASTIC_LOGIN_SERVER + LOGOUT_PATH);

                List<NameValuePair> formparams = new ArrayList<NameValuePair>();
                formparams.add(new BasicNameValuePair("refresh_token", refreshToken));
                formparams.add(new BasicNameValuePair("client_id", REALM_CLIENT_ID));
                UrlEncodedFormEntity form = new UrlEncodedFormEntity(formparams, "UTF-8");
                post.setEntity(form);
                HttpResponse response = client.execute(post);
                boolean status = response.getStatusLine().getStatusCode() != 204;
                HttpEntity entity = response.getEntity();
                if (entity == null) {
                    return true;
                }
                InputStream is = entity.getContent();
                if (is != null) is.close();
                if (status) {
//                    throw new RuntimeException("failed to logout");
                }
            } finally {
                client.getConnectionManager().shutdown();
            }

        }

        return false;
    }



    private boolean getApiResponseSuccessed (String responseBody) {
        try {
            JSONParser parser = new JSONParser();
            JSONObject jsonObj = (JSONObject) parser.parse(responseBody);
            //        Map<String, String> response = new ObjectMapper().readValue(jsonObj.toString(), HashMap.class);

            if(jsonObj.containsKey("error")) {
                boolean successed = !Boolean.valueOf(jsonObj.get("error").toString());
                if(!successed) logger.debug(jsonObj.get("message").toString());
                return successed;
            } else if(jsonObj.containsKey("result")) {
                return "SUCCESS".equals(StringUtils.upperCase(jsonObj.get("result").toString()));
            }
            return false;
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return false;
    }


    public HttpClient createHttpsClient() throws ElasticLoginException {
        try {
            TrustStrategy acceptingTrustStrategy = new TrustStrategy() {
                @Override
                public boolean isTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                    return true;
                }
            };
            SSLContext sslContext = SSLContexts.custom().loadTrustMaterial(null, acceptingTrustStrategy).build();
            SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(sslContext,
                    NoopHostnameVerifier.INSTANCE);

            Registry<ConnectionSocketFactory> socketFactoryRegistry =
                    RegistryBuilder.<ConnectionSocketFactory>create()
                            .register("https", sslsf)
                            .register("http", new PlainConnectionSocketFactory())
                            .build();

            BasicHttpClientConnectionManager connectionManager =
                    new BasicHttpClientConnectionManager(socketFactoryRegistry);
            CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf)
                    .setConnectionManager(connectionManager).build();

            return httpClient;
        } catch (Exception e) {
            throw new ElasticLoginException(e);
        }
    }

    private Map<String, String> get(String url, String params) {

        HttpClient httpClient = null;
        HttpGet httpGet = new HttpGet(url + "?" + params);
        if(url.indexOf(ELASTIC_LOGIN_SERVER) >= 0) {
            httpGet.setHeader("Authorization", EL_AUTHORIZATION);
        } else if(url.indexOf(TSCHOOL_SERVER) >= 0) {
            httpGet.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
        }

        logger.debug(httpGet.getURI());

        Map<String, String> result = new HashMap<>();

        try {
            httpClient = createHttpsClient();
            HttpResponse response = httpClient.execute(httpGet);

            int statusCode = response.getStatusLine().getStatusCode();
            result.put("code", String.valueOf(statusCode));
            logger.debug(">>>>>>>>> code : " + statusCode);
            if(statusCode == 200) {
                ResponseHandler<String> handler = new BasicResponseHandler();
                String responseBody = handler.handleResponse(response);
                logger.debug(">>>>>>>>> body : " + responseBody);
                result.put("result", responseBody);
            }

            return result;

        } catch (IOException e) {
            //e.printStackTrace();
            throw new ElasticLoginException(e);
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
        }

    }

    /**
     *
     * @param url
     * @param params
     * @param json
     * @param errorMsg
     * @return
     */
    private boolean post(String url, List<NameValuePair> params, JSONObject json, String errorMsg) {
        if(null == params && null == json) {
            return false;
        }

        boolean result = false;
        HttpClient httpClient = null;

        try {
            httpClient = createHttpsClient();
            HttpPost httpPost = new HttpPost(url);
            if(url.indexOf(ELASTIC_LOGIN_SERVER) >= 0) {
                httpPost.setHeader("Authorization", EL_AUTHORIZATION);
            } else if(url.indexOf(TSCHOOL_SERVER) >= 0) {
                httpPost.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
            }

            if(null != params) {

                UrlEncodedFormEntity form = new UrlEncodedFormEntity(params, "UTF-8");
                httpPost.setEntity(form);
                logger.debug(params.toString());

            } else if(null != json) {

                httpPost.addHeader("content-type", "application/json");
                httpPost.addHeader("charset", "UTF-8");
                httpPost.setEntity(new StringEntity(json.toString(), "UTF-8"));
                logger.debug(json.toString());
            }

            logger.debug(httpPost.getURI());

            HttpResponse response = httpClient.execute(httpPost);

            int statusCode = response.getStatusLine().getStatusCode();

            logger.debug("post ... " + statusCode);

            if(statusCode == 200) {
                ResponseHandler<String> handler = new BasicResponseHandler();
                String responseBody = handler.handleResponse(response);
                boolean successed = getApiResponseSuccessed(responseBody);
                logger.debug("-------successed : " + successed);
                if(!successed) {
                    throw new ElasticLoginException();
                }
            } else if(statusCode != 200) {
                throw new ElasticLoginException(errorMsg);
            }

            return true;

        } catch (IOException e) {
            e.printStackTrace();
            throw new ElasticLoginException(e);
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
        }
    }

    private boolean post(String url, JSONObject json, String errorMsg) {
        return post(url, null, json, errorMsg);
    }

    private boolean post(String url, List<NameValuePair> params, String errorMsg) {
        return post(url, params, null, errorMsg);
    }


    /**
     *
     * @param url
     * @param params
     * @param json
     * @param errorMsg
     * @return
     */
    private boolean put(String url, List<NameValuePair> params, JSONObject json, String errorMsg) {

        if(null == params && null == json) {
            return false;
        }

        HttpClient httpClient = null;

        try {
            httpClient = createHttpsClient();
            HttpPut httpPut = new HttpPut(url);
            if(url.indexOf(ELASTIC_LOGIN_SERVER) >= 0) {
                httpPut.setHeader("Authorization", EL_AUTHORIZATION);
            } else if(url.indexOf(TSCHOOL_SERVER) >= 0) {
                httpPut.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
            }

            if(null != params) {

                UrlEncodedFormEntity form = new UrlEncodedFormEntity(params, "UTF-8");
                httpPut.setEntity(form);

            } else if(null != json) {

                httpPut.addHeader("content-type", "application/json");
                httpPut.addHeader("charset", "UTF-8");
                httpPut.setEntity(new StringEntity(json.toString(),"UTF-8"));

            }

            logger.debug(httpPut.getURI());

            HttpResponse response = httpClient.execute(httpPut);

            int statusCode = response.getStatusLine().getStatusCode();

            logger.debug("put ... " + statusCode);

            if(statusCode == 200) {
                ResponseHandler<String> handler = new BasicResponseHandler();
                String responseBody = handler.handleResponse(response);
                boolean successed = getApiResponseSuccessed(responseBody);
                logger.debug("-------successed : " + successed);
                if(!successed) {
                    throw new RuntimeException(errorMsg);
                }
            } else if(statusCode != 200) {
                throw new ElasticLoginException(errorMsg);
            }

            return true;

        } catch (IOException e) {
            e.printStackTrace();
            throw new ElasticLoginException(errorMsg);
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
        }
    }


    private boolean delete(String url, HttpParams params, String errorMsg) {


        HttpClient httpClient = null;

        try {
            httpClient = createHttpsClient();
            HttpDelete httpDelete = new HttpDelete(url);
            if(url.indexOf(ELASTIC_LOGIN_SERVER) >= 0) {
                httpDelete.setHeader("Authorization", EL_AUTHORIZATION);
            } else if(url.indexOf(TSCHOOL_SERVER) >= 0) {
                httpDelete.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
            }

            httpDelete.setParams(params);

            HttpResponse response = httpClient.execute(httpDelete);

            logger.debug(httpDelete.getURI());

            int statusCode = response.getStatusLine().getStatusCode();

            logger.debug(params.toString());
            logger.debug("delete ... " + statusCode);

            if(statusCode == 200) {
                ResponseHandler<String> handler = new BasicResponseHandler();
                String responseBody = handler.handleResponse(response);
                boolean successed = getApiResponseSuccessed(responseBody);
                if(!successed) {
                    throw new ElasticLoginException(errorMsg);
                }
            } else if(statusCode != 200) {
                throw new ElasticLoginException(errorMsg);
            }

            return true;

        } catch (IOException e) {
            e.printStackTrace();
            throw new ElasticLoginException(e);
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
        }
    }




    /**
     * 통합회원 생성
     */
    public boolean createUser(Map<String, String> user) {

        logger.debug(">>>>>>>>>>>>>>> create sso user");

        String url = ELASTIC_LOGIN_SERVER + CREATE_USER_PATH;
        JSONObject json = new JSONObject();

        json.put("username", user.get("ssoId"));
        json.put("password", user.get("password"));
        json.put("email", user.get("email"));
        json.put("ci", user.get("ci"));
        json.put("name", user.get("memberName"));
        json.put("gender", user.get("sex"));
        json.put("birthDay", user.get("birth"));
        json.put("phoneNumber", user.get("cellphone"));
        json.put("postNo", user.get("zip"));
        json.put("addr1", user.get("addr1"));
        json.put("addr2", user.get("addr2"));
//        json.put("mailingYn", null);
//        json.put("smsYn", null);
//        json.put("tellingYn", null);
        json.put("collectingYn", user.get("isSsoMember"));
        json.put("marketingYn", user.get("thirdMarketingAgree"));
        json.put("expiryTermNum", user.get("expiryTermNum"));

        logger.debug(json.toString());

        boolean result = false;
        try {
            result = post(url, json, "failed to create user");
            if(!result && createdTschoolUser) {
               // rollbackTuser(user.get("ssoId"));
            }
        } catch (ElasticLoginException e) {
            if(createdTschoolUser) {
             //    rollbackTuser(user.get("ssoId"));
            }
        }
        return result;

    }

    /**
     * 통합회원 정보 수정
     */
    public boolean updateUser(Map<String, String> user) {
        logger.debug(">>>>>>>>>>>>>>> update sso user");
        String url = ELASTIC_LOGIN_SERVER + UPDATE_USER_PATH;
        JSONObject json = new JSONObject();
//        json.put("username", user.get("ssoId"));
//        json.put("password", user.get("password"));
//        json.put("email", user.get("email"));
//        json.put("ci", user.get("ci"));
//        json.put("name", user.get("memberName"));
//        json.put("gender", user.get("sex"));
//        json.put("birthDay", user.get("birth"));
//        json.put("phoneNumber", user.get("cellphone"));
//        json.put("postNo", user.get("zip"));
//        json.put("addr1", user.get("addr1"));
//        json.put("addr2", user.get("addr2"));
//        json.put("mailingYn", null);
//        json.put("smsYn", null);
//        json.put("tellingYn", null);
//        json.put("collectingYn", user.get("isSsoMember"));
        json.put("marketingYn", user.get("thirdMarketingAgree"));
        json.put("expiryTermNum", user.get("expiryTermNum"));


        json.put("username", user.get("ssoId"));
        json.put("password", user.get("password"));
        json.put("email", user.get("email"));
        json.put("ci", user.get("ci"));
        json.put("name", user.get("memberName"));
        json.put("gender", user.get("sex"));
        json.put("birthDay", user.get("birth"));
        json.put("phoneNumber", user.get("cellphone"));
//        json.put("postNo", user.get("zip"));
//       json.put("addr1", user.get("addr1"));
//        json.put("addr2", user.get("addr2"));
        json.put("marketingYn", user.get("thirdMarketingAgree"));
        json.put("expiryTermNum", user.get("expiryTermNum"));



        logger.debug(json.toString());

        boolean result = post(url, json, "failed to update user");


        return result;

    }


    /**
     * 통합회원 비밀번호 변경
     */
    public boolean updateUserPwd(String memberId, String password) {
        logger.debug(">>>>>>>>>>>>>>> update sso user password");
        String url = ELASTIC_LOGIN_SERVER + UPDATE_USER_PASSWORD_PATH;

        JSONObject json = new JSONObject();
        json.put("username", memberId);
        json.put("password", password);

        boolean result = post(url, json, "failed to update sso password");

        return result;
    }


    /**
     * 통합회원 탈퇴
     */
    public boolean leave(String memberId) {
        logger.debug(">>>>>>>>>>>>>>> delete sso user");

        String url = ELASTIC_LOGIN_SERVER + DELETE_USER_PATH;

        JSONObject json = new JSONObject();
        json.put("username", memberId);

        boolean result = post(url, json, "failed to delete sso user");

        return result;
    }


    /**
     * 통합 아이디 사용 가능 여부 확인
     */
    public boolean isAvailableSsoId(String memberId) {

        String url = ELASTIC_LOGIN_SERVER + IS_EXIST_USER_PATH;

        try {

            String params = "id=" + memberId;
            Map<String, String> result = get(url, params);

            if("200".equals(result.get("code")) & !"".equals(result.get("result"))) {
                JSONParser parser = new JSONParser();
                JSONObject jsonObj = (JSONObject) parser.parse(result.get("result"));

                String count = jsonObj.get("count").toString();
                if ("0".equals(count)) {
                    return true;
                } else {
                    return false;
                }
            }

        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return false;
    }



    /**
     * 티스쿨 ID 중복 확인
     */
    public int isExistIdInTschool(String id) {

        try {

            String url = TSCHOOL_SERVER + AVAILABLE_T_USERNAME_PATH;
            String params = "username=" + id;

            Map<String, String> result = get(url, params);
            logger.debug(">>>>>1");
            if(!"200".equals(result.get("code")) & "".equals(result.get("result"))) {
                throw new RuntimeException();
            }

            JSONParser parser = new JSONParser();
            JSONObject jsonObj = null;
            jsonObj = (JSONObject) parser.parse(result.get("result"));

            String isExist = ((JSONObject) jsonObj.get("data")).get("isExists").toString();
            if("Y".equals(isExist)) {
                return 1;
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return 0;

    }

    /**
     * 티스쿨 사용자 존재 확인 및 ID 가져오기
     */
    public List<Map<String, String>> getTschoolUser(String sDupInfo) {
        String url = TSCHOOL_SERVER + EXIST_T_USER_PATH;
        try {
            String params = "ci=" + URLEncoder.encode(sDupInfo, "UTF-8");

            Map<String, String> result = get(url, params);

            if(!"200".equals(result.get("code"))) {
                throw new VivasamException("0000", "티스쿨 가입정보를 조회할 수 없습니다.");
            }

            List<Map<String,String>> users = parserGetTschoolUsers(result.get("result"));
            return users;

        } catch (ParseException e) {
            throw new ElasticLoginException(e);
        } catch (IOException e) {
            throw new ElasticLoginException(e);
        }

    }

    //티스쿨 사용자 확인 json parser
    private List<Map<String, String>> parserGetTschoolUsers(String responseBody) throws ParseException, IOException {
        JSONParser parser = new JSONParser();
        JSONObject jsonObj = (JSONObject) parser.parse(responseBody);
        List<Map<String, String>> tusers = new ArrayList<>();
        Map<String, String> tUser = new HashMap<>();
        if(jsonObj.containsKey("status")) {

            String resultCode = ((JSONObject) jsonObj.get("status")).get("code").toString();

            if("404".equals(resultCode)) {
                //티스쿨에 소유한 아이디 없음.
            } else if("200".equals(resultCode) & jsonObj.containsKey("data")) {
                //티스쿨에 소유한 아이디 존재.
//                JSONArray jsonArr = new JSONArray(jsonObj.get("data").toString());
                JSONArray jsonArr = (JSONArray) parser.parse(jsonObj.get("data").toString());

                if(jsonArr.size() > 0) {
                    for(int i=0; i <jsonArr.size(); i++) {
                        tUser = new ObjectMapper().readValue(jsonArr.get(i).toString(), HashMap.class);
                        tusers.add(tUser);
                    }
                }
            }
        }
        return tusers;
    }


    /**
     * 티스쿨 사용자 생성
     */
    public boolean createTuser(Map<String,String> users) {
        logger.debug(">>>>>>>>>>>>>>> create TSCHOOL user");
        String url = TSCHOOL_SERVER + CREATE_T_USER_PATH;

        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("username", users.get("ssoId")));
        params.add(new BasicNameValuePair("name", users.get("memberName")));
        params.add(new BasicNameValuePair("email", users.get("email")));
        params.add(new BasicNameValuePair("phone_number", users.get("cellphone")));
        params.add(new BasicNameValuePair("ci", users.get("ci")));
        params.add(new BasicNameValuePair("active_year", users.get("expiryTermNum")));
        params.add(new BasicNameValuePair("di", users.get("di")));
        params.add(new BasicNameValuePair("sex", users.get("sex")));
        params.add(new BasicNameValuePair("mktagree", "true".equals(users.get("agree6")) ? "Y" : "N"));
        params.add(new BasicNameValuePair("birthday", users.get("birth")));
        params.add(new BasicNameValuePair("fromSite", FROM_SITE_NAME));
        params.add(new BasicNameValuePair("password", users.get("password")));

        boolean result = post(url, params, "티스쿨 사용자 생성 실패");

        if(result && !createdTschoolUser) {
            createdTschoolUser = true;
        }

        return result;

    }


    /**
     * 티스쿨 사용자 정보 수정
     * @param tid
     * @param users
     * @return
     */
    public boolean updateTuser(String tid, Map<String, String> users, boolean isConversion) {
        logger.debug(">>>>>>>>>>>>>>> update TSCHOOL user");

//        String url = TSCHOOL_SERVER + String.format(UPDATE_T_USER_PATH, users.get("ssoId"));
        String url = TSCHOOL_SERVER + String.format(UPDATE_T_USER_PATH, tid);

        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("username", tid));
        params.add(new BasicNameValuePair("name", users.get("memberName")));
        params.add(new BasicNameValuePair("email", users.get("email")));
        params.add(new BasicNameValuePair("phone_number", users.get("cellphone")));
        params.add(new BasicNameValuePair("ci", users.get("ci")));
        params.add(new BasicNameValuePair("active_year", users.get("expiryTermNum")));
        params.add(new BasicNameValuePair("birthday", users.get("birth")));

        if(isConversion) {
            params.add(new BasicNameValuePair("isSsoMember", "Y"));
            params.add(new BasicNameValuePair("fromSite", FROM_SITE_NAME));
        }

        boolean result = post(url, params, "티스쿨 사용자 정보 수정 실패");

        if(result) {
            if(users.containsKey("password") && !StringUtils.isBlank(users.get("password"))) {
                boolean changePwd = updateTuserPwd(tid, users); //티스쿨 패스워드 변경
            }
        }

        return result;

    }


    /**
     * 티스쿨 비밀번호 변경
     * @param tid
     * @param pass
     * @return
     */
    public boolean updateTuserPwd(String tid, Map<String, String> pass) {
        logger.debug(">>>>>>>>>>>>>>> change TSCHOOL user password");
//        String url = TSCHOOL_SERVER + String.format(UPDATE_T_USER_PASSWORD_PATH, pass.get("ssoId"));
        String url = TSCHOOL_SERVER + String.format(UPDATE_T_USER_PASSWORD_PATH, tid);

        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("password", pass.get("password")));
        params.add(new BasicNameValuePair("password_confirmation", pass.get("password")));

        return post(url, params, "티스쿨 패스워드 변경 실패");

//        JSONObject json = new JSONObject();
//        json.put("password", pass.get("password"));
//        json.put("password_confirmation", pass.get("passwordConfirm"));
//        logger.debug(json.toString());

//        return put(url, null, json,"티스쿨 패스워드 변경 실패");

//        return false;
    }


    /**
     * 티스쿨 아이디 이력 변경
     * @param tid
     * @param users
     * @return
     */
    public boolean updateTusername(String tid, Map<String, String> users) {
        logger.debug(">>>>>>>>>>>>>>> change TSCHOOL user id");
        String url = TSCHOOL_SERVER + UPDATE_T_USERNAME_PATH;

        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("v_BeforeID", tid));
        params.add(new BasicNameValuePair("v_AfterID", users.get("ssoId")));
        params.add(new BasicNameValuePair("v_FromSite", FROM_SITE_NAME));

        boolean result = post(url, params, "티스쿨 사용자 아이디 이력 변경");

        return result;
    }


    /**
     * 통합회원 전환 가능 아이디 확인(티스쿨 ID가 비바샘DB에 존재하는지 확인과정만 빠져있음)
     * @param memberId
     * @param ci
     * @return
     */
    public Map<String, Object> isExistVandT(String memberId, String ci) {

        Map<String, Object> resultMap = new HashMap<>();
        List<Map<String, String>> tuserList = new ArrayList<>();
        Map<String, String> isUsableTuser = null;

        boolean availableT = false;
        boolean availableV = false;
        availableV = isAvailableSsoId(memberId); //비바샘 아이디가 통합DB에 존재하는지 확인

        // 본인인증정보로 티스쿨 아이디 확인
        boolean shouldCheck = true;
        List<Map<String, String>> getTusers = getTschoolUser(ci);
        Map<String, String> tUser = null;

        boolean isActiveT = true; //티스쿨 아이디 목록에 휴면계정이 존재하는지 체크
        for(int i=0; i<getTusers.size(); i++) {
            tUser = getTusers.get(i);
            if(tUser.containsKey("username")) {
                String tId = tUser.get("username");
                String tType = tUser.get("mem_gn"); //A:활성, H:휴면
                // 1. 티스쿨 아이디가 존재하면
                if(!StringUtils.isBlank(tId)) {
                    logger.debug(">> 본인 소유 티스쿨 ID : " + tId);

                    isUsableTuser = new HashMap<>();
                    isUsableTuser.put("tid", tId);

                    if("A".equals(tType)) { //티스쿨 아이디가 휴면회원이 아니면
                        if (memberId.equals(tId)) {
                            // 1-1. 비바샘과 티스쿨 아이디가 동일하면 통합DB에 있는지 한번만 확인
                            availableT = availableV;
                            shouldCheck = false;
                        } else {
                            // 1-2. 비바샘과 티스쿨 아이디가 다르면 통합DB, 각각 상대 디비에 있는지 확인.
                            availableT = isAvailableSsoId(tId); //티스쿨 아이디가 통합DB에 존재하는지 확인
                        }
                        isUsableTuser.put("isusable", String.valueOf(availableT));
                        isUsableTuser.put("inactive", "false");
                    } else { //티스쿨 아이디가 휴면 계정이면
                        isActiveT = false;
                        isUsableTuser.put("isusable", "false");
                        isUsableTuser.put("inactive", "true");
                    }
                    tuserList.add(isUsableTuser);
                }
            }

        }

        if(shouldCheck && availableV) {
            //본인 소유 티스쿨 아이디와 비바샘 아이디가 동일한 경우를 제외하곤 비바샘 아이디가 티스쿨에서 사용 가능한 아이디인지 확인해야한다.
            availableV = isExistIdInTschool(memberId) == 0 ? true : false;
        }

//        Map<String, String> isUsableVuser = new HashMap<>();
//        isUsableVuser.put("usableId", memberId);
//        isUsableVuser.put("isUsable", String.valueOf(availableV));
//        resultMap.put("vivasam", isUsableVuser);

        resultMap.put("isActiveT", String.valueOf(isActiveT));
        Map<String, String> vuser = new HashMap<>();
        vuser.put("vid", memberId);
        vuser.put("isusable", String.valueOf(availableV));
        resultMap.put("vivasam", vuser);
        resultMap.put("tschool", tuserList);

        return resultMap;
    }



    /**
     * 티스쿨 통합회원 탈퇴
     * @param tid
     * @return
     */
    public boolean deleteTuser(String tid) {
        logger.debug(">>>>>>>>>>>>>>> delete TSCHOOL user");
        String url = TSCHOOL_SERVER + String.format(LEAVE_T_USER_PATH, tid);


//            HttpParams params = new BasicHttpParams();
//            params.setParameter("", false);

//        boolean result = delete(url, params,"티스쿨 회원 탈퇴 실패");
        List<NameValuePair> params = new ArrayList<>();
//        params.add(new BasicNameValuePair("", tid));
        boolean result = post(url, params,"티스쿨 회원 탈퇴 실패");

        return result;
    }


    /**
     * 티스쿨 로그인 시간 동기화
     * @param tid
     */
    public void syncTuserLoginDttm(String tid) {
        logger.debug(">>>>>>>>>>>>>>> sync TSCHOOL login dttm");

        String url = TSCHOOL_SERVER + String.format(SYNC_T_USER_LOGIN_DTTM_PATH, tid);

        HttpClient httpClient = null;
        try {
            httpClient = createHttpsClient();
            HttpPost httpPost = new HttpPost(url);
            if(url.indexOf(TSCHOOL_SERVER) >= 0) {
                httpPost.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
            }
            httpClient.execute(httpPost);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
        }
    }

    private void rollbackTuser(String tid) {
        String url = TSCHOOL_SERVER + String.format(ROLLBACK_CREATE_T_USER_PATH, tid);
        HttpClient httpClient = null;
        try {
            httpClient = createHttpsClient();
            HttpPost httpPost = new HttpPost(url);
            if(url.indexOf(TSCHOOL_SERVER) >= 0) {
                httpPost.setHeader(VISANG_API_SECRET_HEADER_NAME, VISANG_API_SECRET_HEADER_VALUE);
            }
            httpClient.execute(httpPost);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (httpClient != null) {
                httpClient.getConnectionManager().shutdown();
            }
            throw new ElasticLoginException();
        }
    }

    public void wakeupInactiveTuser(String tid) {
        String url = TSCHOOL_SERVER + String.format(WAKEUP_INACTIVE_T_USER_PATH, tid);

        List<NameValuePair> params = new ArrayList<>();
        boolean result = post(url, params,"티스쿨 휴면 해지 실패");
        if(!result) throw new ElasticLoginException();
    }

    /**
     * 티스쿨 사용자 ID 휴면회원 판단
     * @param ci
     * @return
     */
    public String getTschoolUserActiveStatus(String ci) {
        List<Map<String, String>> getTusers = getTschoolUser(ci);
        Map<String, String> tUser = null;
        String tType = "";

        if(getTusers.size() > 0) {
            for(int i=0; i<getTusers.size(); i++) {
                tUser = getTusers.get(i);
                if(tUser.containsKey("username")) {
                    tType = tUser.get("mem_gn"); //A:활성, H:휴면
                }
            }
        }

        return tType.toUpperCase();
    }
}
