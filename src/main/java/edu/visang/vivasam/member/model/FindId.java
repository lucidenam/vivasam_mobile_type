package edu.visang.vivasam.member.model;

import lombok.Data;
import lombok.ToString;
import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.Pattern;


@Data
@ToString
public class FindId {
    @Pattern(regexp="[\\uac00-\\ud7a3]{2,4}", message="올바른 성명 형식이 아닙니다.")
    private String memberName;
    private String certifyMethod;
    private String searchString;
    private String memberEmail;
    private String memberHp;
}
