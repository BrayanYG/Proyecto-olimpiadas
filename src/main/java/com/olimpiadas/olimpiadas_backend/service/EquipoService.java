package com.olimpiadas.olimpiadas_backend.service;

import com.olimpiadas.olimpiadas_backend.model.Equipo;
import com.olimpiadas.olimpiadas_backend.repository.EquipoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;

    public EquipoService(EquipoRepository equipoRepository) {
        this.equipoRepository = equipoRepository;
    }

    public List<Equipo> listar() {
        return equipoRepository.findAll();
    }

    @NonNull
    public Equipo guardar(@NonNull Equipo equipo) {
        return equipoRepository.save(equipo);
    }

    public Equipo buscarPorId(Long id) {
        return equipoRepository.findById(id).orElse(null);
    }

    public Equipo actualizar(Long id, Equipo datos) {
        Equipo equipo = buscarPorId(id);

        if (equipo == null) {
            return null;
        }

        equipo.setNombre(datos.getNombre());
        equipo.setCategoria(datos.getCategoria());
        equipo.setDeporte(datos.getDeporte());

        return equipoRepository.save(equipo);
    }

    public boolean eliminar(Long id) {
        Equipo equipo = buscarPorId(id);

        if (equipo == null) {
            return false;
        }

        equipoRepository.delete(equipo);
        return true;
    }
}
