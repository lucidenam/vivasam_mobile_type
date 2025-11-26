package edu.visang.vivasam.common.service;

import edu.visang.vivasam.common.mapper.NoticeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    @Autowired
    NoticeMapper noticeMapper;

    public List<Map<String, Object>> noticeList() {
        return noticeMapper.noticeList();
    }
}
