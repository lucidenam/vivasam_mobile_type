package edu.visang.vivasam.common.elasticlogin;

import org.codehaus.jackson.annotate.JsonAnyGetter;
import org.codehaus.jackson.annotate.JsonAnySetter;
import org.codehaus.jackson.annotate.JsonProperty;

import java.util.HashMap;
import java.util.Map;

public class AccessTokenResponse {

    @JsonProperty("access_token")
    protected String token;
    @JsonProperty("expires_in")
    protected long expiresIn;
    @JsonProperty("refresh_expires_in")
    protected long refreshExpiresIn;
    @JsonProperty("refresh_token")
    protected String refreshToken;
    @JsonProperty("token_type")
    protected String tokenType;
    @JsonProperty("id_token")
    protected String idToken;
    @JsonProperty("not-before-policy")
    protected int notBeforePolicy;
    @JsonProperty("session_state")
    protected String sessionState;
    protected Map<String, Object> otherClaims = new HashMap();
    @JsonProperty("scope")
    protected String scope;

    public AccessTokenResponse() {
    }

    public String getScope() {
        return this.scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getToken() {
        return this.token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getExpiresIn() {
        return this.expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public long getRefreshExpiresIn() {
        return this.refreshExpiresIn;
    }

    public void setRefreshExpiresIn(long refreshExpiresIn) {
        this.refreshExpiresIn = refreshExpiresIn;
    }

    public String getRefreshToken() {
        return this.refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return this.tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getIdToken() {
        return this.idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public int getNotBeforePolicy() {
        return this.notBeforePolicy;
    }

    public void setNotBeforePolicy(int notBeforePolicy) {
        this.notBeforePolicy = notBeforePolicy;
    }

    public String getSessionState() {
        return this.sessionState;
    }

    public void setSessionState(String sessionState) {
        this.sessionState = sessionState;
    }

    @JsonAnyGetter
    public Map<String, Object> getOtherClaims() {
        return this.otherClaims;
    }

    @JsonAnySetter
    public void setOtherClaims(String name, Object value) {
        this.otherClaims.put(name, value);
    }
}

