package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import org.apache.commons.lang3.time.DateUtils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class SubEventInfo {

    private String eventId;
    private String eventSdate;
    private String eventEdate;

    private boolean progressing = false;

    public SubEventInfo(EventInfo eventInfo) {
        this.eventId = eventInfo.getEventId();
        this.eventSdate = eventInfo.getEventSdate();
        this.eventEdate = eventInfo.getEventEdate();

        try {
            Date startDate = DateUtils.parseDate(this.eventSdate, "yyyy.MM.dd");
            Date endDate = DateUtils.parseDate(this.eventEdate + " 23:59:59.999", "yyyy.MM.dd HH:mm:ss.SSS");

            Date now = new Date();
            this.progressing = now.compareTo(startDate) > 0 && now.compareTo(endDate) < 0;
        } catch (ParseException e) {
            e.printStackTrace();// 이벤트 날짜 포맷이 다름
            throw new RuntimeException("날짜 포멧이 올바르지 않습니다.");
        }

    }

    public static List<SubEventInfo> toUiDtoList(List<EventInfo> eventInfoList) {
        List<SubEventInfo> list = new ArrayList<>();
        for (EventInfo model : eventInfoList) {
            list.add(new SubEventInfo(model));
        }
        return list;
    }

}
