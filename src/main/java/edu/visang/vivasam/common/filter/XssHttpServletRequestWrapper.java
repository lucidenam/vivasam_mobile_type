package edu.visang.vivasam.common.filter;

import java.io.*;
import java.util.*;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import edu.visang.vivasam.common.utils.JsonUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.util.FileCopyUtils;


public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

	final Logger logger = LoggerFactory.getLogger(getClass());
	
	public XssHttpServletRequestWrapper(HttpServletRequest request) {
		super(request);
	}

	@Override
	public String[] getParameterValues(String key) {
		String[] values = super.getParameterValues(key);
		if (values == null) {
			return null;
		}
		int count = values.length;
		String[] encodedValues = new String[count];
		for (int i = 0; i < count; i++) {
			encodedValues[i] = StringEscapeUtils.escapeHtml4(values[i]);
		}
		return encodedValues;
	}

	@Override
	public String getParameter(String key) {
		String value = super.getParameter(key);
		if (StringUtils.isEmpty(value)) {
			return null;
		}
		return StringEscapeUtils.escapeHtml4(value);
	}

	@Override
	public Map<String, String[]> getParameterMap() {

		Map<String, String[]> allMap = super.getParameterMap();

		allMap.forEach( (key,value) -> {
			value[0] = StringEscapeUtils.escapeHtml4(value[0]);
		});

		return allMap;
	}

	@Override
	public String getHeader(String name) {
		return super.getHeader(name);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public ServletInputStream getInputStream() throws IOException {
		try {
			logger.debug("contentType : {}", super.getContentType());
			if (super.getContentType() != null && super.getContentType().equals(MediaType.APPLICATION_JSON_VALUE)) {
				String requestBody = FileCopyUtils.copyToString(new InputStreamReader(super.getInputStream()));
				Map<String, Object> requestMap = JsonUtils.readValue(requestBody, Map.class);
				Iterator<String> iterator = requestMap.keySet().iterator();
				String key = null;
				Object value = null;
				while (iterator.hasNext()) {
					key = iterator.next();
					value = requestMap.get(key);
					logger.debug("key : {}, value : {}", key, value);
					if (value instanceof String) {
						requestMap.put(key, StringEscapeUtils.escapeHtml4(value.toString()));
					} else if (value instanceof LinkedHashMap) {
						escapeValue((LinkedHashMap<String, Object>) value);
					} else if (value instanceof List) {
						ArrayList<Map<String, Object>> list = (ArrayList<Map<String, Object>>) value;
						for (Map<String, Object> map : list) {
							escapeValue(map);
						}
						requestMap.put(key, list);
					}
				}
				final InputStream escapeInputStream = new ByteArrayInputStream(JsonUtils.writeValueAsBytes(requestMap));
				return new ServletInputStream() {
					
					@Override
					public int read() throws IOException {
						return escapeInputStream.read();
					}
		
				};
			}
			return super.getInputStream();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}


	@Override
	public BufferedReader getReader() throws IOException {
		return new BufferedReader(new InputStreamReader(getInputStream()));
	}
	
	private void escapeValue(Map<String, Object> map) {
		Iterator<String> iterator = map.keySet().iterator();
		String key = null;
		Object value = null;
		while (iterator.hasNext()) {
			key = iterator.next();
			value = map.get(key);
			if (value instanceof String) {
				map.put(key, StringEscapeUtils.escapeHtml4(value.toString()));
			}
		}		
	}
}