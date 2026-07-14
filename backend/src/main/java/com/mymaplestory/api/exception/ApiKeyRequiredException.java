package com.mymaplestory.api.exception;

public class ApiKeyRequiredException extends RuntimeException {

    public ApiKeyRequiredException(String message) {
        super(message);
    }
}
