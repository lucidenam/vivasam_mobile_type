package edu.visang.vivasam.config;

import edu.visang.vivasam.common.utils.VivasamUtil;
import edu.visang.vivasam.exception.*;
import edu.visang.vivasam.payload.ResponseMessage;
import edu.visang.vivasam.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import java.util.Iterator;

@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {

    @Autowired
    private JwtTokenProvider tokenProvider;

	/* ISMS 조치사항 중, 에러 발생시, 에러가 그대로 페이지에 표현되던 오류 변경
	 * 기본 Exception도 에러 처리하도록 수정 
	 * 2021-02-17 김인수*/
    @ExceptionHandler({
            BadCredentialsException.class,
            RestingAccountException.class,
            EPKIUnauthenticatedException.class,
            EPKIExpiredException.class,
            VivasamException.class,
            NotIdentifiedException.class,
            Exception.class
    })
    protected ResponseEntity<Object> customHandleException(Exception e, WebRequest request, HttpServletRequest servletRequest) throws Exception {
        if (e instanceof BadCredentialsException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            ResponseMessage body = new ResponseMessage(null,"아이디 또는 비밀번호를 다시 확인하세요.\n등록되지 않은 아이디이거나, 아이디 또는 비밀번호를 잘못 입력하셨습니다.");
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        else if (e instanceof RestingAccountException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            ResponseMessage body = new ResponseMessage("L002",e.getMessage());
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        else if (e instanceof EPKIUnauthenticatedException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            ResponseMessage body = new ResponseMessage("L003",e.getMessage());
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        else if (e instanceof EPKIExpiredException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            ResponseMessage body = new ResponseMessage("L004",e.getMessage());
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        else if (e instanceof NotIdentifiedException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            ResponseMessage body = new ResponseMessage("L005",e.getMessage());
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        else if (e instanceof VivasamException) {
            HttpStatus status = HttpStatus.BAD_REQUEST;
            VivasamException ve = (VivasamException)e;
            ResponseMessage body = new ResponseMessage(ve.getCode(),ve.getMessage());
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        } else if (e instanceof AccessDeniedException) {
            HttpStatus status = HttpStatus.UNAUTHORIZED;
            String message = e.getMessage();

            String jwt = VivasamUtil.getJwtFromRequest(servletRequest);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                //message = "로그인된 회원정보가 없습니다. 로그아웃 됩니다.";
                message = null;
            }

            ResponseMessage body = new ResponseMessage(null, message);
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        } else if (e instanceof InternalAuthenticationServiceException){
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            ResponseMessage body = new ResponseMessage(null,
                    "아이디 또는 비밀번호를 다시 확인하세요.\n등록되지 않은 아이디이거나, 아이디 또는 비밀번호를 잘못 입력하셨습니다.");
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
        //기타 정의되지 않은 오류
        else {
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            ResponseMessage body = new ResponseMessage(null,"현재 사용자가 많거나, 서버 문제로 인해 일시적으로 페이지를 표시할 수 없습니다.\n잠시 후 다시 이용해 주시기 바랍니다. 감사합니다.");
            return new ResponseEntity<Object>(body, new HttpHeaders(), status);
        }
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatus status, WebRequest request) {

        logger.info(ex.getBindingResult());

        BindingResult bindingResult = ex.getBindingResult();
        StringBuilder message = new StringBuilder();
        if(bindingResult.hasErrors()) {
            for(ObjectError error : bindingResult.getAllErrors()) {
                if(message.length() > 0) message.append("\n");

                message.append(error.getDefaultMessage());
            }
        }

        ResponseMessage body = new ResponseMessage(null,message.toString());

        //return handleExceptionInternal(ex, null, headers, status, request);
        return new ResponseEntity<Object>(body, new HttpHeaders(), status);
    }
}
