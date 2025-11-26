package edu.visang.vivasam.common.utils;

import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class BaseObjectMapper extends ObjectMapper {

	private static final long serialVersionUID = -1447953346937408985L;

	public BaseObjectMapper() {
		configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
		configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, false);
		configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		configure(Feature.AUTO_CLOSE_SOURCE, true);
		enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
		// setSerializationInclusion(Include.NON_EMPTY);
	}

}
