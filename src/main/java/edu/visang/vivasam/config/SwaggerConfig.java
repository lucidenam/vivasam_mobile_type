package edu.visang.vivasam.config;

import com.fasterxml.classmate.TypeResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.AlternateTypeRules;
import springfox.documentation.schema.WildcardType;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Collection;
import java.util.Map;

@Configuration
@EnableSwagger2
public class SwaggerConfig {
    @Autowired
    private TypeResolver typeResolver;

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                /*.alternateTypeRules(
                        AlternateTypeRules.newRule(
                                typeResolver.resolve(Collection.class),
                                        typeResolver.resolve(Map.class, String.class, WildcardType.class)
                        )
                )*/
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build()
                .apiInfo(metadata());
    }

    private ApiInfo metadata() {
        return new ApiInfoBuilder()
                .title("비바샘 모바일 ")
                .description("비바샘 모바일 api server")
                .version("0.0.1")
                .contact(new Contact("비바샘", "https://www.vivasam.com", "vivasam@visang.com"))
                .build();
    }
}
