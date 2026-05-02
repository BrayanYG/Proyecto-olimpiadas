package com.olimpiadas.olimpiadas_backend.controller;

import com.olimpiadas.olimpiadas_backend.model.Usuario;
import com.olimpiadas.olimpiadas_backend.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

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
    public Usuario registrar(@RequestBody Usuario usuario) {
        return usuarioService.registrar(usuario);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Usuario usuario) {
        boolean valido = usuarioService.login(usuario.getUsername(), usuario.getPassword());

        Map<String, Object> respuesta = new HashMap<>();

        if (valido) {
            respuesta.put("mensaje", "Login correcto");
            respuesta.put("estado", true);
        } else {
            respuesta.put("mensaje", "Usuario o contraseña incorrectos");
            respuesta.put("estado", false);
        }

        return respuesta;
    }
}
