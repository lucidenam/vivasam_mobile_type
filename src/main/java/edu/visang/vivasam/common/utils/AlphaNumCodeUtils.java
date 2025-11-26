package edu.visang.vivasam.common.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 랜덤 생성된 숫자를 알파벳과 숫자의 조합으로 코드화 하여 반환하는 유틸리티
 */
public class AlphaNumCodeUtils {

    // 숫자에서 0을 제외 + alphabet A-Z에서 I와 O를 제외
    private static final List<String> CHAR_CODE_LIST = Arrays.asList("1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");
    private static final int DIVISOR = CHAR_CODE_LIST.size();
    private static final int MINIMUM_LENGTH = 4;

    // 4자리이내에서 사용가능한 최대수 Math.power(33, 4) - 1
    private static final int MAX_VALUE = 1185920;

    public static String generateRecommendationCode() {
        int randomNum = (int) (Math.random() * MAX_VALUE);
        return generateCode(randomNum);
    }

    public static String generateCode(int value) {

        int quotient = value;

        List<Integer> intList = new ArrayList<>();
        List<String> list = new ArrayList<>();

        while (quotient > 0) {
            int remainder = getRemainder(quotient);
            intList.add(remainder);
            list.add(getCharForNumber(remainder));
            quotient = getQuotient(quotient);
        }

        // 빈값 패딩
        if (intList.size() < MINIMUM_LENGTH) {
            for (int i = intList.size(), size = MINIMUM_LENGTH; i < size; i++) {
                intList.add(0);
                list.add(getCharForNumber(0));
            }
        }

        Collections.reverse(intList);
        Collections.reverse(list);

        StringBuilder sb = new StringBuilder();
        for (String str : list) {
            sb.append(str);
        }
        return sb.toString();
    }

    private static int getQuotient(int value) {
        return value / DIVISOR;
    }

    private static int getRemainder(int value) {
        return value % DIVISOR;
    }

    private static String getCharForNumber(int i) {
        return i >= 0 && i < DIVISOR ? CHAR_CODE_LIST.get(i) : null;
    }

    private static int getNumberForChar(String str) {
        return CHAR_CODE_LIST.indexOf(str);
    }

}
