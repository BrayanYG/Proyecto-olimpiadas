package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Encuentro;
import com.olimpiadas.olimpiadas_backend.model.Resultado;
import com.olimpiadas.olimpiadas_backend.repository.EncuentroRepository;
import com.olimpiadas.olimpiadas_backend.repository.ResultadoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
public class ResultadoService {

    private final ResultadoRepository resultadoRepository;
    private final EncuentroRepository encuentroRepository;

    public ResultadoService(ResultadoRepository resultadoRepository, EncuentroRepository encuentroRepository) {
        this.resultadoRepository = resultadoRepository;
        this.encuentroRepository = encuentroRepository;
    }

    @NonNull
    public Resultado registrarResultado(@NonNull Resultado resultado) {
        Encuentro encuentro = resultado.getEncuentro();
        encuentro.setEstado("FINALIZADO");
        encuentro.setResultado(resultado); // Sincronizar relación bidireccional en memoria
        encuentroRepository.save(encuentro);

        return resultadoRepository.save(resultado);
    }

    public Resultado buscarPorEncuentro(Long encuentroId) {
        return resultadoRepository.findAll().stream()
                .filter(r -> r.getEncuentro().getId().equals(encuentroId))
                .findFirst()
                .orElse(null);
    }
}
