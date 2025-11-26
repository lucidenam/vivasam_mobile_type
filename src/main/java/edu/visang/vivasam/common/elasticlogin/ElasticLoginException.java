package edu.visang.vivasam.common.elasticlogin;

public class ElasticLoginException extends RuntimeException {

    public ElasticLoginException() {
        super();
    }

    public ElasticLoginException(String s) {
        super(s);
    }

    public ElasticLoginException(Exception e) {
        super(e);
    }
}
