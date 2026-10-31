package com.routineslim.global.exception;

import lombok.Getter;

/** 서비스 계층에서 던지는 예외. GlobalExceptionHandler 가 ErrorCode 에 맞는 응답으로 바꾼다 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
