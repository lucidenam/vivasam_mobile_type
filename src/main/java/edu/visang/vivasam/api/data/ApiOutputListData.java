package edu.visang.vivasam.api.data;

import java.util.List;

public class ApiOutputListData {
    private ApiResponseStatusData status;
    private List<ApiResponseData> data;

    public ApiOutputListData(ApiResponseStatusData status) {
        this.status = status;
    }

    public ApiResponseStatusData getStatus() {
        return status;
    }

    public void setStatus(ApiResponseStatusData status) {
        this.status = status;
    }

    public List<ApiResponseData> getData() {
        return data;
    }

    public void setData(List<ApiResponseData> data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "ApiOutputListData{" +
                "status=" + status +
                ", data=" + data +
                '}';
    }
}
