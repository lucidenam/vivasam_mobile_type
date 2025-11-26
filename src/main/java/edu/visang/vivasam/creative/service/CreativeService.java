package edu.visang.vivasam.creative.service;

import edu.visang.vivasam.creative.mapper.CreativeMapper;
import edu.visang.vivasam.creative.model.CreativeParam;
import edu.visang.vivasam.creative.model.CreativeResult;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreativeService {

	private static final Logger logger = LoggerFactory.getLogger(CreativeService.class);

	private final CreativeMapper creativeMapper;

	public List<CreativeResult> getAllClassData(CreativeParam param) {

		Set<String> uniqueRefCodeSet = new HashSet<>();
		List<CreativeResult> allData = creativeMapper.getAllClassData(param);
		List<CreativeResult> result = new ArrayList<>();

		for (CreativeResult v : allData) {
			uniqueRefCodeSet.add(v.getRefCode());
		}

		List<String> uniqueRefCodeList = new ArrayList<>(uniqueRefCodeSet);
		Collections.sort(uniqueRefCodeList);

		int i = 0;
		for (String uniqueRefCode : uniqueRefCodeList) {
			List<CreativeResult> group = new ArrayList<>();
			result.add(CreativeResult.builder()
					.refCode(uniqueRefCode)
					.build());
			allData.forEach(v -> {
				if (uniqueRefCode.equals(v.getRefCode())) {
					group.add(v);
				}
			});
			result.get(i).setGroup(group);
			i++;
		}

		return result;
	}


	// 달력 데이터 정보
	public Map<String, Object> getClassDataCalendar(CreativeParam param) {

		Map<String, Object> result = new HashMap<>();

		List<CreativeResult> calendarData = creativeMapper.getClassDataCalendar(param);
		List<CreativeResult> calendarResult = new ArrayList<>();

		result.put("calendar", calendarResult);

		if (calendarData.size() == 0) {
			return result;
		}

		String nextYear = param.getYear();
		String nextMonth = param.getMonth();

		// 데이터 있는 날짜 구함
		String nextDay = getNextDataDay(calendarData, param.getDay());

		// 오늘 날짜에 데이터 없는데, 이번달에도 없으면 다음달 조회, 이번년 없으면 다음년 조회
		if(StringUtils.isBlank(nextDay)) {
			if(Integer.parseInt(param.getMonth()) == 12) {
				param.setYear((Integer.parseInt(param.getYear()) + 1) + "");
				param.setMonth("01");
			} else {
				String month = (Integer.parseInt(param.getMonth()) + 1) + "";
				param.setMonth(month.length() == 1 ? "0" + month : month);
			}
			param.setDay("1");

			calendarData = creativeMapper.getClassDataCalendar(param);
			nextDay = getNextDataDay(calendarData, param.getDay());
			param.setDay(nextDay);

			nextYear = param.getYear();
			nextMonth = param.getMonth();
		} else {
			param.setDay(nextDay);
		}

		calendarResult.add(new CreativeResult());
		calendarResult.get(0).setGroup(new ArrayList<>());

		int range = 0;

		// 주 단위 파싱, week set
		for (int i = 1; i <= calendarData.size(); i++) {
			if (StringUtils.isBlank(calendarResult.get(range).getWeekYn()) &&
					"Y".equals(calendarData.get(i - 1).getShowYn()) &&
					Integer.parseInt(calendarData.get(i - 1).getDay()) == Integer.parseInt(param.getDay())) {
				calendarResult.get(range).setWeekYn("Y");
			}
			calendarResult.get(range).getGroup().add(calendarData.get(i - 1));
			if ((i % 7) == 0) {
				range++;
				calendarResult.add(new CreativeResult());
				calendarResult.get(range).setGroup(new ArrayList<>());
			}
		}

		result.put("nextYear", nextYear);
		result.put("nextMonth", nextMonth);
		result.put("nextDay", nextDay);

		return result;
	}

	// 오늘 날짜에 데이터 없으면 다음 날짜 구함
	private String getNextDataDay(List<CreativeResult> calendarData, String currDay) {

		boolean isNotExist = false;

		// null : 이번 달 데이터 없음
		// currDay : 오늘 데이터 있음
		// nextDay : 다음 데이터 날짜 있음
		String nextDay = currDay;

		for (CreativeResult day : calendarData) {
			// 오늘 날짜 이 후 데이터 있는 날
			if(isNotExist && "Y".equals(day.getDataYn())) {
				nextDay = day.getDay().length() == 1 ? "0" + day.getDay() : day.getDay();
				break;
			}
			// 오늘 날짜에 데이터가 없으면
			if (!isNotExist && "Y".equals(day.getShowYn()) && Integer.parseInt(day.getDay()) == Integer.parseInt(currDay)
					&& "N".equals(day.getDataYn())) {
				isNotExist = true;
				nextDay = null;
			}
		}

		return nextDay;
	}

	public List<CreativeResult> getClassData(CreativeParam param) {

		List<CreativeResult> classData = creativeMapper.getClassData(param);
		List<CreativeResult> relationData = this.getClassDataByRelation(param);

		for (CreativeResult c : classData) {
			for (CreativeResult r : relationData) {
				if (c.getGroup() == null) {
					c.setGroup(new ArrayList<>());
				}
				if (c.getIssueId().equals(r.getIssueId())) {
					c.getGroup().add(r);
				}
			}
		}

		return classData;
	}

	public List<CreativeResult> getClassDataByRelation(CreativeParam param) {

		List<CreativeResult> classDataByRelationList = creativeMapper.getClassDataByRelation(param);

		for (CreativeResult temp : classDataByRelationList) {
			String filePath = temp.getThumbnail();
			if (filePath == null) {
				temp.setThumbnail("");
			} else if ("https://dn.vivasam.com".equals(filePath)) {
				temp.setThumbnail(filePath.replace("https://dn.vivasam.com", ""));
			}
		}

		return classDataByRelationList.stream()
				.filter(v -> StringUtils.isNotBlank(v.getThumbnail()))
				.collect(Collectors.toList());
	}

	/*public CreativeResult getActivityData(CreativeParam param) {

		CreativeResult result = creativeMapper.getActivityData(param);

		if (result == null) {
			return new CreativeResult();
		}

		if (result.getActiveValue().contains("ul")) {
			result.setActiveValue(StringUtils.replace(result.getActiveValue(), "<ul class=\"list\">", ""));
			result.setActiveValue(StringUtils.replace(result.getActiveValue(), "</ul>", ""));
			result.setActiveValue(StringUtils.replace(result.getActiveValue(), "li>", "p>"));
			result.setActiveValue(StringUtils.replace(result.getActiveValue(), "\r\n", ""));
		}

		return result;
	}

	public List<CreativeResult> getActivityDataList(CreativeParam param) {
		return creativeMapper.getActivityDataList(param);
	}

	public List<CreativeResult> getActivityDataAll() {
		return creativeMapper.getAllActivityData();
	}

	public List<CreativeResult> getActivityRelationData(CreativeParam param) {
		return creativeMapper.getActivityRelationData(param);
	}

	public List<CreativeResult> getMediaData(CreativeParam param) {
		return creativeMapper.getMediaData(param);
	}

	public int getMediaDataCnt(CreativeParam param) {
		return creativeMapper.getMediaDataCnt(param);
	}*/
}