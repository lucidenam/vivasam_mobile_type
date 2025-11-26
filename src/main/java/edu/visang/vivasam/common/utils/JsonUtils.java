package edu.visang.vivasam.common.utils;

import java.io.InputStream;
import java.io.OutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.type.TypeReference;

public class JsonUtils {

	static final Logger log = LoggerFactory.getLogger(JsonUtils.class);

	static BaseObjectMapper objectMapper = new BaseObjectMapper();

	/**
	 * value를 JSON String 으로 변환하여 리턴.
	 *
	 * @param value
	 * @return JSON String
	 */
	public static String writeValueAsString(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (Exception e) {
			log.error("writeValueAsString", e);
		}
		return null;
	}

	/**
	 * content를 T 변환하여 리턴.
	 *
	 * @param inputStream
	 * @param typeReference
	 * @return T
	 */
	public static <T> T readValue(InputStream inputStream, TypeReference<T> typeReference) {
		try {
			return objectMapper.readValue(inputStream, typeReference);
		} catch (Exception e) {
			log.error("readValue", e);
		}
		return null;
	}

	/**
	 * content를 T 변환하여 리턴.
	 *
	 * @param value
	 * @return T
	 */
	public static <T> T readValue(String content, TypeReference<T> typeReference) {
		try {
			return objectMapper.readValue(content, typeReference);
		} catch (Exception e) {
			log.error("readValue", e);
		}
		return null;
	}

	/**
	 * content를 T 변환하여 리턴.
	 *
	 * @param value
	 * @return T
	 */
	public static <T> T readValue(String content, Class<T> typeReference) {
		try {
			return objectMapper.readValue(content, typeReference);
		} catch (Exception e) {
			log.error("readValue", e);
		}
		return null;
	}

	/**
	 * content를 T 변환하여 리턴.
	 *
	 * @return T
	 */
	public static <T> T convertValue(Object content, TypeReference<T> typeReference) {
		try {
			return objectMapper.convertValue(content, typeReference);
		} catch (Exception e) {
			log.error("convertValue", e);
		}
		return null;
	}

	/**
	 * Object 값을 byte 문자열로 변환하여 리턴한다.
	 *
	 * @param o
	 * @return
	 */
	public static byte[] writeValueAsBytes(Object o) {
		try {
			return objectMapper.writeValueAsBytes(o);
		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Object 값을 byte 문자열로 변환하여 리턴한다.
	 *
	 * @param o
	 * @return
	 */
	public static void writeValue(OutputStream out, Object value) {
		try {
			objectMapper.writeValue(out, value);
		} catch (Exception e) {
			log.error("e", e);
		}
	}

}
