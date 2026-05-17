package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Usuario;
import com.olimpiadas.olimpiadas_backend.service.UsuarioService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody @org.springframework.lang.NonNull Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrar(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/registro-admin")
    public ResponseEntity<?> registrarAdmin(@RequestBody @org.springframework.lang.NonNull Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarAdmin(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Usuario usuario) {
        Usuario authUser = usuarioService.login(usuario.getUsername(), usuario.getPassword());

        Map<String, Object> respuesta = new HashMap<>();

        if (authUser != null) {
            respuesta.put("mensaje", "Código MFA enviado");
            respuesta.put("estado", "MFA_REQUIRED");
            respuesta.put("username", authUser.getUsername());
        } else {
            respuesta.put("mensaje", "Usuario o contraseña incorrectos");
            respuesta.put("estado", false);
        }

        return respuesta;
    }

    @PostMapping("/verificar-mfa")
    public Map<String, Object> verificarMfa(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String codigo = payload.get("codigo");
        Usuario authUser = usuarioService.verificarMfa(username, codigo);

        Map<String, Object> respuesta = new HashMap<>();

        if (authUser != null) {
            respuesta.put("mensaje", "Login correcto");
            respuesta.put("estado", true);
            respuesta.put("rol", authUser.getRol());
            respuesta.put("username", authUser.getUsername());
        } else {
            respuesta.put("mensaje", "Código incorrecto");
            respuesta.put("estado", false);
        }

        return respuesta;
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
       return usuarioService.listar();
    }
}
