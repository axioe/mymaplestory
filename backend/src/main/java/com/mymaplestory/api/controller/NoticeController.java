package com.mymaplestory.api.controller;

import com.mymaplestory.api.dto.NoticeItem;
import com.mymaplestory.api.service.NexonApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 공지/이벤트는 특정 캐릭터에 종속되지 않는 정보라 CharacterController와 분리했다.
 */
@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NexonApiService nexonApiService;

    public NoticeController(NexonApiService nexonApiService) {
        this.nexonApiService = nexonApiService;
    }

    /** GET /api/notices - 일반 공지사항 목록 */
    @GetMapping
    public List<NoticeItem> getNotices(
            @RequestHeader(value = "X-Nexon-Api-Key", required = false) String apiKey
    ) {
        return nexonApiService.getNotices(apiKey);
    }

    /** GET /api/notices/events - 진행 중인 이벤트 목록 */
    @GetMapping("/events")
    public List<NoticeItem> getEventNotices(
            @RequestHeader(value = "X-Nexon-Api-Key", required = false) String apiKey
    ) {
        return nexonApiService.getEventNotices(apiKey);
    }
}
