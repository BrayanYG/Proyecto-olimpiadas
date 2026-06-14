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
    public ResponseEntity<?> registrar(@RequestBody Map<String, String> payload) {
        try {
            Usuario usuario = new Usuario();
            usuario.setEmail(payload.get("email"));
            usuario.setUsername(payload.get("username"));
            usuario.setPassword(payload.get("password"));

            com.olimpiadas.olimpiadas_backend.model.Participante participante = new com.olimpiadas.olimpiadas_backend.model.Participante();
            participante.setNombres(payload.get("nombres"));
            participante.setApellidos(payload.get("apellidos"));
            if (payload.get("dni") != null && !payload.get("dni").trim().isEmpty()) {
                participante.setDni(payload.get("dni").trim());
            }
            if (payload.get("edad") != null && !payload.get("edad").trim().isEmpty()) {
                participante.setEdad(Integer.parseInt(payload.get("edad").trim()));
            }
            if (payload.get("telefono") != null && !payload.get("telefono").trim().isEmpty()) {
                participante.setTelefono(payload.get("telefono").trim());
            }
            // La institución queda nula por defecto

            Usuario nuevoUsuario = usuarioService.registrarConParticipante(usuario, participante);
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
            respuesta.put("email", authUser.getEmail() != null ? authUser.getEmail() : "");
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

    @PutMapping("/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String passwordActual = payload.get("passwordActual");
        String nuevaPassword = payload.get("nuevaPassword");

        if (username == null || passwordActual == null || nuevaPassword == null) {
            Map<String, String> resp = new HashMap<>();
            resp.put("error", "Todos los campos son requeridos.");
            return ResponseEntity.badRequest().body(resp);
        }

        if (nuevaPassword.length() < 6) {
            Map<String, String> resp = new HashMap<>();
            resp.put("error", "La nueva contraseña debe tener al menos 6 caracteres.");
            return ResponseEntity.badRequest().body(resp);
        }

        try {
            boolean exito = usuarioService.cambiarContrasena(username, passwordActual, nuevaPassword);
            Map<String, String> resp = new HashMap<>();
            if (exito) {
                resp.put("mensaje", "Contraseña actualizada correctamente.");
                return ResponseEntity.ok(resp);
            } else {
                resp.put("error", "La contraseña actual es incorrecta.");
                return ResponseEntity.badRequest().body(resp);
            }
        } catch (IllegalArgumentException e) {
            Map<String, String> resp = new HashMap<>();
            resp.put("error", e.getMessage());
            return ResponseEntity.status(404).body(resp);
        }
    }
}
