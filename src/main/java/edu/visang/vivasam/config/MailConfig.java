package edu.visang.vivasam.config;

import lombok.Data;
import lombok.ToString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;
import java.util.Properties;

@Data
@Configuration
@PropertySource("classpath:application_${spring.profiles.active}.properties")
@ToString
public class MailConfig {
    private static final String MAIL_SMTP_AUTH = "mail.smtp.auth";
    private static final String MAIL_SMTP_STARTTLS_ENABLE = "mail.smtp.starttls.enable";
    private static final String MAIL_SMTP_STARTTLS_REQUIRED = "mail.smtp.starttls.required";
    private static final String MAIL_DEBUG = "mail.smtp.debug";

    @Data
    @Component
    public class Smtp {
        @Value("${spring.mail.properties.mail.smtp.auth}")
        private boolean auth;
        @Value("${spring.mail.properties.mail.smtp.starttls.required}")
        private boolean startTlsRequired;
        @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
        private boolean startTlsEnable;
    }

    @NotNull
    @Value("${spring.mail.host}")
    private String host;
    @Value("${spring.mail.username}")
    private String username;
    @Value("${spring.mail.protocol}")
    private String protocol;
    @Value("${spring.mail.port}")
    private int port;
    @Value("${spring.mail.password}")
    private String password;
    @Value("${spring.mail.default-encoding}")
    private String defaultEncoding;
    @NotNull
    @Autowired
    private Smtp smtp;

    @Bean
    public JavaMailSender mailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        Properties properties = mailSender.getJavaMailProperties();
        properties.put(MAIL_SMTP_AUTH, getSmtp().isAuth());
        properties.put(MAIL_SMTP_STARTTLS_ENABLE, getSmtp().isStartTlsEnable());
        properties.put(MAIL_SMTP_STARTTLS_REQUIRED, getSmtp().isStartTlsRequired());
        properties.put(MAIL_DEBUG, true);
        mailSender.setJavaMailProperties(properties);
        mailSender.setDefaultEncoding(getDefaultEncoding());
        mailSender.setHost(getHost());
        mailSender.setPort(getPort());
        mailSender.setProtocol(getProtocol());
        mailSender.setUsername(getUsername());
        mailSender.setPassword(getPassword());
        return mailSender;
    }
}
