package com.backend.WhoSaidIt.entities.quiz;

import com.backend.WhoSaidIt.entities.GroupChat;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SURVIVAL")
public class SurvivalQuiz extends Quiz{

    @Column(name = "numberOfQuestions", columnDefinition = "INT", nullable = false)
    private Integer numberOfSkips;

    public SurvivalQuiz() {}

    public SurvivalQuiz(GroupChat groupChat, String quizName, String description, Integer numberOfSkips) {
        super(groupChat, quizName, description);
        this.numberOfSkips = numberOfSkips;
    }
}
