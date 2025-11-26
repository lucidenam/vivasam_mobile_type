package edu.visang.vivasam.api;

import com.google.gson.Gson;
import edu.visang.vivasam.api.data.ApiInputData;
import edu.visang.vivasam.api.data.ApiOutputData;
import edu.visang.vivasam.api.data.ApiOutputListData;
import edu.visang.vivasam.api.data.ApiResponseStatusData;
import edu.visang.vivasam.api.url.ApiUrlInfo;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.SocketConfig;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.http.ssl.TLS;
import org.apache.hc.core5.net.URIBuilder;
import org.apache.hc.core5.pool.PoolConcurrencyPolicy;
import org.apache.hc.core5.pool.PoolReusePolicy;
import org.apache.hc.core5.ssl.SSLContexts;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.apache.hc.core5.util.TimeValue;
import org.apache.hc.core5.util.Timeout;
import org.springframework.core.env.Environment;

import javax.net.ssl.SSLContext;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

/**
 * API 서버 처리 유틸
 *
 * @author
 */
public class ApiConnectionUtil {

    String API_VER;
    String API_KEY;
    String API_URL;

    public ApiConnectionUtil(String key, String ver, String url) {
        this.API_KEY = key;
        this.API_VER = ver;
        this.API_URL = url;
    }

    /**
     * 회원 로그인 처리
     * @param param
     * @return
     */

    public ApiOutputData loginUser(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {
            System.out.println("api call start");
            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.USER_LOGIN.getApiUrl(), "application/json", param);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("loginUser result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }


    /**
     * 회원 가입 처리
     * @param param
     * @return
     */

    public ApiOutputData createUser(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {

            //HttpClient client = createHttpsClient();
            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.CREATE_USER.getApiUrl(), "application/json", param);

            //HttpResponse response = client.execute(post);
            //HttpEntity entity = response.getEntity();
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("createUser result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }
    /** 통합 회원 여부 조회
     *
     * @param param
     * @return
     * @throws Exception
     */
    public ApiOutputData isSsoMemberCheck(ApiInputData param) throws Exception{

        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();
            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.IS_SSO_MEMBER_CHECK.getApiUrl(), "application/json", param);
            System.out.println(param.toString());
            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("isSsoMemberCheck result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }
    /** 회원 정보 조회 (CI 이용)
     *
     * @param param
     * @return
     * @throws Exception
     */
    public ApiOutputListData selectUserCiInfoList(ApiInputData param) throws Exception{

        ApiOutputListData output;

        try {
            //HttpClient client = createHttpsClient();
            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.SEARCH_USER_CI_INFO.getApiUrl(), "application/json", param);
            System.out.println(param.toString());
            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("selectUserCiInfoList result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputListData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputListData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }

    /** 아아디 중복 체크
     *
     * @param param
     * @return
     * @throws Exception
     */
    public ApiOutputData duplicateUserIdCheck(ApiInputData param) throws Exception{

        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();
            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.DUPLICATE_USER_ID_CHECK.getApiUrl(), "application/json", param);
            System.out.println(param.toString());
            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("duplicateUserIdCheck result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }

    /**
     * 통합회원 SNS 연동 처리
     * @param param
     * @return
     */

    public ApiOutputData insertSnsMemberInfo(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.INSERT_SNS_MEMBER_INFO.getApiUrl(), "application/json", param);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();
            System.out.println(param.toString());
            String json = getContent(entity);
            System.out.println("insertSnsMemberInfo result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }

    /**
     * 통합회원 SNS 연동 해제 처리
     * @param param
     * @return
     */
    public ApiOutputData deleteSnsMemberInfo(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.DELETE_SNS_MEMBER_INFO.getApiUrl(), "application/json", param);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();
            System.out.println(param.toString());
            String json = getContent(entity);
            System.out.println("deleteSnsMemberInfo result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }
    /**
     * 통합회원 마케팅 동의 여부 조회
     * @param param
     * @return
     */

    public ApiOutputListData selectMarketingInfo(ApiInputData param) throws Exception{
        ApiOutputListData output;

        try {
            //HttpClient client = createHttpsClient();
            System.out.println(param.toString());

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.SEARCH_MARKETING_INFO.getApiUrl() , "application/json", param);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("selectMarketingInfo result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputListData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputListData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }


    /**
     * 통합회원 회원 정보 수정
     * @param param
     * @return
     */

    public ApiOutputData updateUserInfo(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();
            System.out.println(param.toString());

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.UPDATE_USER_INFO.getApiUrl() + "/"+ param.getMemberId(), "application/json", param);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("updateUserInfo result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }


    public ApiOutputData updateUserPassword(ApiInputData apiParam) throws Exception {
        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();
            System.out.println(apiParam.toString());

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.UPDATE_USER_PASSWORD.getApiUrl() , "application/json", apiParam);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("updateUserPassword result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }
    /**
     * 통합회원 SNS 연동 처리
     * @param param
     * @return
     */

    public ApiOutputData leaveUser(ApiInputData param) throws Exception{
        ApiOutputData output;

        try {
            //HttpClient client = createHttpsClient();
            System.out.println(param.toString());

            HttpPost post = createHttpPost(API_URL + "/api/" + API_VER + ApiUrlInfo.LEAVE_USER.getApiUrl(), "application/json", param);

            //HttpResponse response = client.execute(post);
            CloseableHttpClient httpclient = HttpClients.createDefault();
            CloseableHttpResponse response = httpclient.execute(post);
            HttpEntity entity = response.getEntity();

            String json = getContent(entity);
            System.out.println("leaveUser result : " + json);
            Gson gson = new Gson();
            output = gson.fromJson(json, ApiOutputData.class);

            return output;

        }catch(Exception e) {
            output = new ApiOutputData(new ApiResponseStatusData(true, 500, "API_CONNECT_EXCEPTION", "API 서버와 통신이 원할하지 않습니다.") );
            e.printStackTrace();
        }
        return output;
    }

    /************************************************************************************************************/
    /************ COMMON ****************************************************************************************/
    /************************************************************************************************************/

    /**
     * CREATE HTTP POST
     * @param url
     * @param type
     * @return
     */

    private HttpPost createHttpPost(String url, String type, ApiInputData param) throws Exception{

        //httpPost.addHeader("Authorization", "Bearer " + REALM_CLIENT_ID + ":" + BEARER_TOKEN);

        URIBuilder builder = new URIBuilder(url);
        Gson gson = new Gson();
        String paramString = gson.toJson(param);

        HttpPost httpPost = new HttpPost(url);
        httpPost.setHeader("content-type", type);
        httpPost.setHeader("charset", "UTF-8");
        httpPost.setHeader("X-Vivasam-Api-Key", API_KEY);

        httpPost.setEntity(new StringEntity(paramString, StandardCharsets.UTF_8));
        return httpPost;

    }
    /**
     * CREATE HTTP GET
     * @param url
     * @param type
     * @return
     */
    private HttpGet createHttpGet(String url, String type, ApiInputData param) throws Exception {

        URIBuilder builder = new URIBuilder(url);
        Gson gson = new Gson();
        String paramString = gson.toJson(param);
        builder.setCustomQuery(paramString);
        URI uri = builder.build();

        HttpGet httpGet = new HttpGet(uri);
        httpGet.setHeader("Content-type", type);
        httpGet.setHeader("X-Vivasam-Api-Key", API_KEY);

        //httpGet.setHeader("Authorization", "Bearer " + REALM_CLIENT_ID + ":" + BEARER_TOKEN);
        //HttpResponse httpResponse = httpClient.execute(httpGet);


        return httpGet;
    }

    /**
     * HTTP client create (for https)
     * @return
     */
    private HttpClient createHttpsClient() throws Exception {
        TrustStrategy acceptingTrustStrategy = new TrustStrategy() {
            @Override
            public boolean isTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                return true;
            }
        };
            /*
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
            */

        PoolingHttpClientConnectionManager connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
                        .setSslContext(SSLContexts.createSystemDefault())
                        .setTlsVersions(TLS.V_1_3)
                        .build())
                .setDefaultSocketConfig(SocketConfig.custom()
                        .setSoTimeout(Timeout.ofMinutes(1))
                        .build())
                .setPoolConcurrencyPolicy(PoolConcurrencyPolicy.STRICT)
                .setConnPoolPolicy(PoolReusePolicy.LIFO)
                .setDefaultConnectionConfig(ConnectionConfig.custom()
                        .setSocketTimeout(Timeout.ofMinutes(1))
                        .setConnectTimeout(Timeout.ofMinutes(1))
                        .setTimeToLive(TimeValue.ofMinutes(10))
                        .build())
                .build();
        HttpClient httpClient = HttpClientBuilder
                .create()
                .setConnectionManager(connectionManager)
                .build();

        return httpClient;

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
}
