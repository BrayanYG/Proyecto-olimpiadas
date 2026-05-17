package com.olimpiadas.olimpiadas_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCorreoMfa(String to, String codigo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Código de Verificación - Olimpiadas Perú");
        message.setText("Tu código de vericiación de 6 dígitos es el siguiente: " + codigo);
        mailSender.send(message);
    }
}
