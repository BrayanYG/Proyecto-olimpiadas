package com.olimpiadas.olimpiadas_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DatabaseSequenceInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSequenceInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSequenceInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        String[] tables = {
            "usuarios",
            "sorteos",
            "resultados",
            "participantes",
            "instituciones",
            "inscripciones",
            "eventos",
            "equipos",
            "encuentros",
            "deportes"
        };

        for (String table : tables) {
            try {
                // Determine the sequence name (PostgreSQL specific)
                String seqQuery = "SELECT pg_get_serial_sequence(?, 'id')";
                String sequenceName = jdbcTemplate.queryForObject(seqQuery, String.class, table);
                
                if (sequenceName != null) {
                    // Update sequence value to match MAX(id)
                    String updateQuery = String.format(
                        "SELECT setval('%s', COALESCE((SELECT MAX(id) FROM %s), 0) + 1, false)",
                        sequenceName, table
                    );
                    jdbcTemplate.execute(updateQuery);
                    logger.info("Successfully updated sequence {} for table {}", sequenceName, table);
                } else {
                    // fallback if pg_get_serial_sequence is null but we know the standard pattern
                    String fallbackSequence = table + "_id_seq";
                    String updateQuery = String.format(
                        "SELECT setval('%s', COALESCE((SELECT MAX(id) FROM %s), 0) + 1, false)",
                        fallbackSequence, table
                    );
                    jdbcTemplate.execute(updateQuery);
                    logger.info("Successfully updated fallback sequence {} for table {}", fallbackSequence, table);
                }
            } catch (Exception e) {
                logger.warn("Could not reset sequence for table {}: {}", table, e.getMessage());
            }
        }
    }
}
