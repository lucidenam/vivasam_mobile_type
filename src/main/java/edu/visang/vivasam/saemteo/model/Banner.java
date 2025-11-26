package edu.visang.vivasam.saemteo.model;

import edu.visang.vivasam.saemteo.controller.SaemteoController;
import lombok.Data;
import lombok.ToString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;

@Data
@ToString
public class Banner implements Comparable<Banner> {

	public static final Logger logger = LoggerFactory.getLogger(SaemteoController.class);

	private String type;
	private String typeName;
	private String name;
	private String id;
	private String startDate;
	private String endDate;
	private String src;

	@Override
	public int compareTo(Banner banner) {
		String startDate1 = this.startDate;
		String startDate2 = banner.getStartDate();
		BigDecimal date1 = null;
		BigDecimal date2 = null;
		int result = 0;

		try{
			date1 = new BigDecimal(startDate1.replaceAll("[.]",""));
			date2 = new BigDecimal(startDate2.replaceAll("[.]", ""));
			if(date1.longValue() < date2.longValue()){
				result = 1;
			}else if(date1.longValue() > date2.longValue()){
				result = -1;
			}
		}catch(Exception e){}

		return result;
	}
}
