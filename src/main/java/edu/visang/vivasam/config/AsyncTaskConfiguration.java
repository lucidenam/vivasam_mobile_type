package edu.visang.vivasam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 비동기 작업 설정
 */
@Configuration
@EnableAsync
public class AsyncTaskConfiguration {
    
    @Bean
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor(); 
        threadPoolTaskExecutor.setCorePoolSize(10); 
        threadPoolTaskExecutor.setMaxPoolSize(50);
        threadPoolTaskExecutor.setQueueCapacity(500);
        threadPoolTaskExecutor.setThreadNamePrefix("vivasam-async-");
        return threadPoolTaskExecutor;
    }
    
}
