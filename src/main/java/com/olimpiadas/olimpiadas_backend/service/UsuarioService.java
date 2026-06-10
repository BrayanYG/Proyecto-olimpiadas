package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Usuario;
import com.olimpiadas.olimpiadas_backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    @NonNull
    public Usuario registrar(@NonNull Usuario usuario) {
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso. Por favor, escoge otro.");
        }
        usuario.setRol("PARTICIPANTE");
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    @NonNull
    public Usuario registrarAdmin(@NonNull Usuario usuario) {
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso. Por favor, escoge otro.");
        }
        usuario.setRol("ADMINISTRADOR");
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario login(String username, String password) {
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);

        if (usuario == null) {
            return null;
        }

        if (passwordEncoder.matches(password, usuario.getPassword())) {
            String codigo = String.format("%06d", new java.util.Random().nextInt(999999));
            usuario.setCodigoMfa(codigo);
            usuarioRepository.save(usuario);
            
            logger.info("=== [MFA] CÓDIGO GENERADO PARA EL USUARIO '{}': {} ===", username, codigo);
            
            if (usuario.getEmail() != null && !usuario.getEmail().isEmpty()) {
                try {
                    emailService.enviarCorreoMfa(usuario.getEmail(), codigo);
                    logger.info("[MFA] Correo enviado exitosamente a: {}", usuario.getEmail());
                } catch (Exception e) {
                    logger.error("[MFA] Error al enviar correo de verificación a {}: {}. Continuando con login...", 
                                 usuario.getEmail(), e.getMessage());
                }
            } else {
                logger.warn("[MFA] El usuario '{}' no tiene un correo electrónico configurado.", username);
            }
            return usuario;
        }

        return null;
    }

    public Usuario verificarMfa(String username, String codigo) {
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
        if (usuario != null && codigo != null && codigo.equals(usuario.getCodigoMfa())) {
            usuario.setCodigoMfa(null); // Clear after use
            return usuarioRepository.save(usuario);
        }
        return null;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    /**
     * Cambia la contraseña del usuario verificando la contraseña actual.
     * @return true si el cambio fue exitoso, false si la contraseña actual no coincide.
     * @throws IllegalArgumentException si el usuario no existe.
     */
    public boolean cambiarContrasena(String username, String passwordActual, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            return false; // Contraseña actual incorrecta
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
        return true;
    }
}
