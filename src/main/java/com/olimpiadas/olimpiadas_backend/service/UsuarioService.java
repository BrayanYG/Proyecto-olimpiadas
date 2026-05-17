package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Usuario;
import com.olimpiadas.olimpiadas_backend.repository.UsuarioRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuarioService {

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
            if (usuario.getEmail() != null && !usuario.getEmail().isEmpty()) {
                emailService.enviarCorreoMfa(usuario.getEmail(), codigo);
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
}
