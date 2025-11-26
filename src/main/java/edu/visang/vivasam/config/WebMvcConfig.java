package edu.visang.vivasam.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.visang.vivasam.common.utils.HtmlCharacterEscapes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.*;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;
import org.springframework.data.web.HateoasPageableHandlerMethodArgumentResolver;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.hateoas.config.EnableEntityLinks;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

import java.util.List;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "edu.visang.vivasam")
@PropertySources({
        @PropertySource("classpath:application_${spring.profiles.active}.properties"),
        @PropertySource("classpath:vivasam_${spring.profiles.active}.properties")
})
@EnableSpringDataWebSupport
@EnableEntityLinks
public class WebMvcConfig extends RepositoryRestMvcConfiguration {//extends HateoasAwareSpringDataWebConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(WebMvcConfig.class);

    private final long MAX_AGE_SECS = 3600;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE")
                .maxAge(MAX_AGE_SECS);
    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON);
    }

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**").addResourceLocations("/static/");
        //registry.addResourceHandler("/images/**").addResourceLocations("/images/");
        //registry.addResourceHandler("/js/**").addResourceLocations("/js/");
        //registry.addResourceHandler("/*.js").addResourceLocations("/");
        //registry.addResourceHandler("/*.html").addResourceLocations("/");

        // 폰트 부분 추가
        registry.addResourceHandler("/fonts/**").addResourceLocations("/fonts/");

        registry.addResourceHandler("/images/**").addResourceLocations("/images/").setCacheControl(CacheControl.noCache());
        registry.addResourceHandler("/js/**").addResourceLocations("/js/").setCacheControl(CacheControl.noCache());
        registry.addResourceHandler("/*.js").addResourceLocations("/").setCacheControl(CacheControl.noCache());
        registry.addResourceHandler("/*.html").addResourceLocations("/").setCacheControl(CacheControl.noCache());

        registry.addResourceHandler("/*.json").addResourceLocations("/");
        registry.addResourceHandler("/favicon.ico").addResourceLocations("/");
        //swagger2용
        registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

    /*@Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {

        super.addArgumentResolvers(argumentResolvers);
*//*

        Iterator it = argumentResolvers.listIterator();

        while(it.hasNext()) {
            HandlerMethodArgumentResolver resolver = (HandlerMethodArgumentResolver)it.next();
            logger.info("### {} //// {} ",resolver, (resolver instanceof HateoasPageableHandlerMethodArgumentResolver));
            if(resolver instanceof HateoasPageableHandlerMethodArgumentResolver) {
                HateoasPageableHandlerMethodArgumentResolver hateoasPageableHandlerMethodArgumentResolver = (HateoasPageableHandlerMethodArgumentResolver)resolver;
                hateoasPageableHandlerMethodArgumentResolver.setOneIndexedParameters(true);
            }
        }
*//*

        *//*PageableHandlerMethodArgumentResolver resolver = new PageableHandlerMethodArgumentResolver();
        resolver.setOneIndexedParameters(true);
        argumentResolvers.add(resolver);*//*
    }*/

    @Override
    @Bean
    public HateoasPageableHandlerMethodArgumentResolver pageableResolver() {

        HateoasPageableHandlerMethodArgumentResolver resolver = super.pageableResolver();
        //resolver.setOneIndexedParameters(true);
        return resolver;
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSender javaMailSender = new JavaMailSenderImpl();
        return javaMailSender;
    }

    @Bean(name = "multipartResolver")
    public StandardServletMultipartResolver resolver() {
        return new StandardServletMultipartResolver();
    }
}