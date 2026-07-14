package com.mymaplestory.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MyMaplestoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyMaplestoryApplication.class, args);
    }
}
