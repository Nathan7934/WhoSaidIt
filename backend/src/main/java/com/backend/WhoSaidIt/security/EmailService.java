package com.backend.WhoSaidIt.security;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    // Email configuration is handled in the application.yaml file.
    // Requires the API key to be set in the environment variable SENDGRID_API_KEY.

    private final JavaMailSender mailSender;

    public EmailService (JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // This method sends an email to the specified address with the specified subject and text.
    // Text can be HTML or plaintext.
    public void sendEmail(String to, String subject, String text, boolean isHtml) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
        String fromAddress = "admin@whosaidit.app";

        try {
            messageHelper.setFrom(fromAddress);
            messageHelper.setTo(to);
            messageHelper.setSubject(subject);
            messageHelper.setText(text, isHtml);

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}