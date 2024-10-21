package com.ract.app;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

class AppConfigTest {

    @Test
    void restTemplateBeanShouldBeCreated() {
        // Initialize Spring Application Context
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        // Retrieve the RestTemplate bean
        RestTemplate restTemplate = context.getBean(RestTemplate.class);

        // Assert that the bean is not null
        assertNotNull(restTemplate);

        // Close the context
        context.close();
    }
}