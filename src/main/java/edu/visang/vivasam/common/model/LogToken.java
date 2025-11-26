package edu.visang.vivasam.common.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LogToken {
	private String sessId;
	private String token;
}
