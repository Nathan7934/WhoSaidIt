package com.backend.WhoSaidIt.entities.quiz;

import com.backend.WhoSaidIt.DTOs.quiz.TimeAttackQuizDTO;
import com.backend.WhoSaidIt.entities.GroupChat;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TIME_ATTACK")
public class TimeAttackQuiz extends Quiz{

    @Column(name = "numberOfQuestions", columnDefinition = "INT")
    private Integer numberOfQuestions;

    @Column(name = "initialQuestionScore", columnDefinition = "INT")
    private Integer initialQuestionScore;

    @Column(name = "penaltyPerSecond", columnDefinition = "INT")
    private Integer penaltyPerSecond;

    @Column(name = "wrongAnswerPenalty", columnDefinition = "INT")
    private Integer wrongAnswerPenalty;

    public TimeAttackQuiz() {}

    public TimeAttackQuiz(GroupChat groupChat, String quizName, String description, Integer numberOfQuestions,
                          Integer initialQuestionScore, Integer penaltyPerSecond, Integer wrongAnswerPenalty) {
        super(groupChat, quizName, description);
        this.numberOfQuestions = numberOfQuestions;
        this.initialQuestionScore = initialQuestionScore;
        this.penaltyPerSecond = penaltyPerSecond;
        this.wrongAnswerPenalty = wrongAnswerPenalty;
    }

    public Integer getNumberOfQuestions() { return numberOfQuestions; }

    public Integer getInitialQuestionScore() { return initialQuestionScore; }

    public Integer getPenaltyPerSecond() { return penaltyPerSecond; }

    public Integer getWrongAnswerPenalty() { return wrongAnswerPenalty; }

    public TimeAttackQuizDTO toDTO() {
        return new TimeAttackQuizDTO(
                this.getId(),
                this.getQuizName(),
                this.getDescription(),
                this.getCreatedDate(),
                this.getHasSpecifiedMessages(),
                this.getNumberOfQuestions(),
                this.getInitialQuestionScore(),
                this.getPenaltyPerSecond(),
                this.getWrongAnswerPenalty()
        );
    }
}
