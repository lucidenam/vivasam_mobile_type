package edu.visang.vivasam.saemteo.model;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class EventAmount {

    private String eventType;

    private String name;

    private int amount;

    private int remains;

    private Integer price;

}
