package edu.visang.vivasam.api.data;

public class ApiOutputData {
    private ApiResponseStatusData status;
    private ApiResponseData data;

    public ApiOutputData(ApiResponseStatusData status) {
        this.status = status;
    }

    public ApiResponseStatusData getStatus() {
        return status;
    }

    public void setStatus(ApiResponseStatusData status) {
        this.status = status;
    }

    public ApiResponseData getData() {
        return data;
    }

    public void setData(ApiResponseData data) {
        this.data = data;
    }


}
