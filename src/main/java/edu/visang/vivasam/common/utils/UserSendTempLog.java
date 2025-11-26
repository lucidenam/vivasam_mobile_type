package edu.visang.vivasam.common.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.BiFunction;

@Component
public class UserSendTempLog {

    private RedisTemplate<String, UserSendLog> redisTemplate;

    @Autowired
    public UserSendTempLog(RedisTemplate<String, UserSendLog> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    //객체 저장하기
    public void saveUserSendLog(UserSendLog userSendLog){
        userSendLog.setUserSendLogSendDate(LocalDateTime.now().toString());
        redisTemplate.opsForValue().set(userSendLog.getUserSendLogIp(),userSendLog);
    }

    //객체 저장하기
    public void saveUserSendLog(String userIp,String type){
        UserSendLog userSendLog = new UserSendLog();
        userSendLog.setUserSendLogIp(userIp);
        userSendLog.setUserSendLogType(type);
        userSendLog.setUserSendLogSendDate(LocalDateTime.now().toString());
        redisTemplate.opsForValue().set(userSendLog.getUserSendLogIp(),userSendLog);
    }
    
    //저장객체 가져오기
    public UserSendLog getUserSendLog(String userIp){
        return redisTemplate.opsForValue().get(userIp);
    }

    /* sms,email 등 같은 ip로 1분안에 보낼수 없음 ( 1분이 지났으면 true ) */
    public boolean isOneMinuteLate(String userIp){
        return checkProcess(userIp, (localDate ,userSendLog) -> {
            return localDate.isAfter(LocalDateTime.parse(userSendLog.getUserSendLogSendDate()));
        });
    }

    /* sms,email 등 같은 ip로 1분안에 보낼수 없음 (타입까지 맞아야할때) */
    public boolean isOneMinuteLate(String userIp,String type){
        return checkProcess(userIp, (localDate ,userSendLog) -> {
            if(type.equals(userSendLog.getUserSendLogType())){
                return localDate.isAfter(LocalDateTime.parse(userSendLog.getUserSendLogSendDate()));
            }
            return true;
        });
    }

    public boolean checkProcess(String userIp, BiFunction<LocalDateTime,UserSendLog,Boolean> method){

        //기본값으로 통과
        boolean check = true;

        try {
            UserSendLog userSendLog = redisTemplate.opsForValue().get(userIp);

            if (userSendLog != null) {

                //현재시간에서 1분을 빼서 값을 가져온다.
                LocalDateTime localDate = LocalDateTime.now().minusSeconds(60);

                //1분이 지나지 않았으면 false
                if (!method.apply(localDate, userSendLog)) {
                    check = false;
                }
            }
        } catch (Exception e){
            e.printStackTrace();
        }

        return check;
    }

}
