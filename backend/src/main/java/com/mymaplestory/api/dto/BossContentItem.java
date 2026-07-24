package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BossContentItem(
        @JsonProperty("content_name") String contentName,
        String difficulty,
        String cycle,
        @JsonProperty("list_order_no") Long listOrderNo,
        @JsonProperty("registration_flag") String registrationFlag, // "true" | "false"
        @JsonProperty("complete_flag") String completeFlag // "true" | "false"
) {
}
