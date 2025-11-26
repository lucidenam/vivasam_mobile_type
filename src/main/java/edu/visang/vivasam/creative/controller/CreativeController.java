package edu.visang.vivasam.creative.controller;

import edu.visang.vivasam.creative.model.CreativeParam;
import edu.visang.vivasam.creative.service.CreativeService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/creative")
@RequiredArgsConstructor
public class CreativeController {
private static final Logger logger = LoggerFactory.getLogger(CreativeController.class);

	private final CreativeService creativeService;

	/**
	 * 달력 정보
	 */
	@GetMapping("/class/data/calendar")
	public ResponseEntity<?> calendar(CreativeParam param) {
		return ResponseEntity.ok(creativeService.getClassDataCalendar(param));
	}

	/**
	 * 계기 수업 자료 일별
	 */
	@GetMapping("/class/data/day")
	public ResponseEntity<?> dayData(CreativeParam param) {

		setDefaultDay(param);

		Map<String, Object> result = new HashMap<>();

		result.put("classData", creativeService.getClassData(param));

		return ResponseEntity.ok(result);
	}

	private void setDefaultDay(CreativeParam param) {

		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMdd");
		Calendar calendar = Calendar.getInstance();

		String today = simpleDateFormat.format(calendar.getTime());

		if (org.apache.commons.lang3.StringUtils.isBlank(param.getYear())) {
			param.setYear(today.substring(0, 4));
		}
		if (org.apache.commons.lang3.StringUtils.isBlank(param.getMonth())) {
			param.setMonth(today.substring(4, 6));
		}
		if (StringUtils.isBlank(param.getDay())) {
			param.setDay(String.valueOf(Integer.parseInt(today.substring(6))));
		}
	}

	/**
	 * 계기 수업 자료 전체보기 월별
	 */
	@GetMapping("/class/data/month")
	public ResponseEntity<?> allClassDataByMonth(CreativeParam param) {

		setDefaultDay(param);

		Map<String, Object> result = new HashMap<>();

		result.put("allClassData", creativeService.getAllClassData(param));

		return ResponseEntity.ok(result);
	}



	/**
	 * 초등 계기수업 활동지 목록
	 *//*
	@GetMapping("/activity/list")
	public ResponseEntity<?> list(CreativeParam param) {

		setDefaultDay(param);

		Map<String, Object> result = new HashMap<>();

		result.put("activityData", creativeService.getActivityData(param));
		result.put("contentGubun", "CN030");

		return ResponseEntity.ok(result);
	}

	*//**
	 * 초등 계기수업 활동지 타이틀 목록
	 *//*
	@GetMapping("/activity/titleList")
	public ResponseEntity<?> titleList(CreativeParam param) {

		setDefaultDay(param);

		Map<String, Object> result = new HashMap<>();

		result.put("activityDataList", creativeService.getActivityDataList(param));
		result.put("contentGubun", "CN030");

		return ResponseEntity.ok(result);
	}

	*//**
	 * 초등 계기수업 활동지 목록 전체
	 *//*
	@GetMapping("/activity/all")
	public ResponseEntity<?> all() {
		return ResponseEntity.ok(creativeService.getActivityDataAll());
	}

	*//**
	 * 초등 계기수업 활동지 연관자료
	 *//*
	@GetMapping("/activity/data")
	public ResponseEntity<?> data(CreativeParam param) {

		setDefaultDay(param);

		Map<String, Object> result = new HashMap<>();

		result.put("relationData", creativeService.getActivityRelationData(param));

		return ResponseEntity.ok(result);
	}

	*//**
	 * 영상 자료실
	 *//*
	@GetMapping("/media/data")
	public ResponseEntity<?> media(CreativeParam param) {

		Map<String, Object> result = new HashMap<>();

		if ("".equals(param.getType1())) {
			if (param.getEducourseId().equals("2320047")) {
				param.setType3("602");
			} else if (param.getEducourseId().equals("2320048")) {
				param.setType3("604");
			} else if (param.getEducourseId().equals("2320049")) {
				param.setType3("606");
			} else if (param.getEducourseId().equals("2320050")) {
				param.setType3("608");
			} else if (param.getEducourseId().equals("2320051")) {
				param.setType3("610");
			} else if (param.getEducourseId().equals("2320052")) {
				param.setType3("612");
			} else if (param.getEducourseId().equals("2320053")) {
				param.setType3("614");
			} else if (param.getEducourseId().equals("2320054")) {
				param.setType3("616");
			} else if (param.getEducourseId().equals("2320055")) {
				param.setType3("618");
			} else if (param.getEducourseId().equals("2320056")) {
				param.setType3("620");
			}

		}

		logger.info("param : {}"+ param);
		result.put("mediaData", creativeService.getMediaData(param));
		result.put("mediaDataCnt", creativeService.getMediaDataCnt(param));

		return ResponseEntity.ok(result);
	}
	*/
}
