package edu.visang.vivasam.common.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import edu.visang.vivasam.common.model.CommonSms;
import edu.visang.vivasam.common.service.CommonSmsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommonSmsController {

	private final CommonSmsService commonSmsService;

    @RequestMapping(value = "/common/sms/send", method = RequestMethod.POST)
    public String smsSend(@RequestBody CommonSms parameter) throws Exception {
		return commonSmsService.smsSend(parameter);
	}
}
