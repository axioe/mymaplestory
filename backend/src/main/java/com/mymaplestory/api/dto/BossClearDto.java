package com.mymaplestory.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BossClearDto(
        @NotBlank @Size(max = 64) String bossName,
        boolean cleared
) {
}
