package com.mymaplestory.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SkipDto(
        @NotBlank @Size(max = 128) String contentName,
        boolean skipped
) {
}
