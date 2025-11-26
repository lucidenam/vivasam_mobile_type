package edu.visang.vivasam.config;

import java.util.Properties;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.PropertiesLoaderUtils;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
public class GlobalConfig {

	final Log logger = LogFactory.getLog(getClass());

	public static String activeEnv;
	private boolean local;
	private boolean dev;
	private boolean prod;

	//SMS 관련
	private String callNumber;
	private String smsAuth;
	private String smsUrl;
	private String smsStandardUrl;
	private String smsBulkUrl;
	// 캡챠 KEY
	private String recaptchaSecretKey;

	@Autowired
	private ResourceLoader resourceLoader;

	private static Properties properties;

	/**
	 * 클래스가 생성시 메서드가 호출된다. 프로젝트 설정관련 기능을 수행한다.
	 */
	@PostConstruct
	public void init() {
		String activeProfile = System.getProperty("spring.profiles.active", "dev");
		activeEnv = activeProfile;
		logger.debug("activeProfile : " + activeProfile);
		String resourcePath = String.format("classpath:vivasam_%s.properties", activeProfile);

		try {
			Resource resource = resourceLoader.getResource(resourcePath);
			properties = PropertiesLoaderUtils.loadProperties(resource);
			// 로컬, 개발, 운영 구분을 boolean으로 set
			local = activeProfile.equals("local");
			dev = activeProfile.equals("dev");
			prod = activeProfile.equals("prod");

			logger.debug("local : " + local);
			logger.debug("dev : " + dev);
			logger.debug("prod : " + prod);

		} catch (Exception e) {
			logger.error(e);
		}
	}

	static String getValue(String key) {
		String value = properties.getProperty(key);
		if (org.apache.commons.lang.StringUtils.isNotEmpty(value)) {
			return value.trim();
		}
		return null;
	}

	public boolean isLocal() {
		return local;
	}

	public boolean isDev() {
		return dev;
	}

	public boolean isProd() {
		return prod;
	}

	public String getSmsAuth() {
		return getValue("smsAuth");
	}
	public String getSmsUrl() {
		return getValue("smsUrl");
	}

	public String getSmsStandardUrl() {
		return getValue("smsStandardUrl");
	}

	public String getSmsBulkUrl() {
		return getValue("smsBulkUrl");
	}

	public String getCallNumber() {
		return getValue("callNumber");
	}

	public String getRecaptchaSecretKey() { return getValue("recaptcha.secret.key"); }

	public void setRecaptchaSecretKey(String recaptchaSecretKey) { this.recaptchaSecretKey = recaptchaSecretKey; }
}