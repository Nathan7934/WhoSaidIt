package com.backend.WhoSaidIt.entities.quiz;

import com.backend.WhoSaidIt.DTOs.quiz.SurvivalQuizDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SURVIVAL")
public class SurvivalQuiz extends Quiz{

    @Column(name = "numberOfSkips", columnDefinition = "INT")
    private Integer numberOfSkips;

    public SurvivalQuiz() {}

    public SurvivalQuiz(GroupChat groupChat, String quizName, String description, Integer numberOfSkips) {
        super(groupChat, quizName, description);
        this.numberOfSkips = numberOfSkips;
    }

    public Integer getNumberOfSkips() { return numberOfSkips; }

    public SurvivalQuizDTO toDTO() {
        return new SurvivalQuizDTO(
                this.getId(),
                this.getQuizName(),
                this.getDescription(),
                this.getCreatedDate(),
                this.getNumberOfSkips()
        );
    }
}
