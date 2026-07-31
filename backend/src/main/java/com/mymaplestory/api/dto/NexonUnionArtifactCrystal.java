package com.mymaplestory.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NexonUnionArtifactCrystal(
        String name,
        @JsonProperty("validity_flag") String validityFlag,
        @JsonProperty("date_expire") String dateExpire,
        Integer level,
        @JsonProperty("crystal_option_name_1") String crystalOptionName1,
        @JsonProperty("crystal_option_name_2") String crystalOptionName2,
        @JsonProperty("crystal_option_name_3") String crystalOptionName3
) {
}
