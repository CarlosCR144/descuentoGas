CREATE DATABASE descuentogas_db;

USE descuentogas_db;

SHOW TABLES;

DESCRIBE descuentogasapp_solicitud;

SELECT * FROM descuentogasapp_solicitud;

INSERT INTO descuentogasapp_solicitud (rut, nombre, apellido_paterno, apellido_materno, direccion, telefono, comuna, fecha_solicitud, estado) 
VALUES ('87654321-2', 'Antonio', 'Villegas', 'Pereira', 'Sanhuesa 123', '912345687', 'Purranque', NOW() , 'Pendiente');

-- PARA PRUEBAS
-- Primero, habilitar el Event Scheduler
SET GLOBAL event_scheduler = ON;

-- Crear el evento que se ejecutará cada minuto para verificar solicitudes expiradas
-- DELIMITER //

-- CREATE EVENT check_expired_requests
-- ON SCHEDULE EVERY 1 MINUTE
-- DO
-- BEGIN
    -- UPDATE descuentogasapp_solicitud 
    -- SET estado = 'EXPIRADA'
    -- WHERE estado = 'ACEPTADA'
    -- AND TIMESTAMPADD(MINUTE, 2, fecha_aceptacion) <= NOW();
-- END //

-- DELIMITER ;

-- **************************************************
-- **************************************************

-- (Opcional) eliminar evento antiguo
DROP EVENT IF EXISTS check_expired_requests;

-- Evento para pruebas (marca EXPIRADA si fecha_aceptacion + 2 minutos <= ahora(UTC))
DELIMITER //
CREATE EVENT check_expired_requests
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    UPDATE descuentogasapp_solicitud
    SET estado = 'Expirada'
    WHERE estado = 'Aceptada'
      AND fecha_aceptacion IS NOT NULL
      AND TIMESTAMPADD(MINUTE, 2, fecha_aceptacion) <= UTC_TIMESTAMP();
END //
DELIMITER ;

-- ***************************************************
-- ***************************************************

-- PARA CADA 1 MES
-- Habilitar Event Scheduler
-- SET GLOBAL event_scheduler = ON;

-- DELIMITER //

-- CREATE EVENT check_expired_requests
-- ON SCHEDULE EVERY 1 DAY
-- DO
-- BEGIN
    -- UPDATE descuentogasapp_solicitud 
    -- SET estado = 'EXPIRADA'
    -- WHERE estado = 'ACEPTADA'
    -- AND TIMESTAMPADD(MONTH, 1, fecha_aceptacion) <= UTC_TIMESTAMP();
-- END //

-- DELIMITER ;

-- ***************************************************
-- ***************************************************
-- Ver eventos existentes
SHOW EVENTS;

-- Desactivar el evento si es necesario
ALTER EVENT check_expired_requests DISABLE;

-- Activar el evento
ALTER EVENT check_expired_requests ENABLE;

-- Eliminar el evento si necesitas recrearlo
DROP EVENT IF EXISTS check_expired_requests;

-- ************************************************
-- ************************************************
-- ************************************************
USE descuentogas_db;
SHOW COLUMNS FROM descuentogasapp_solicitud;

SELECT id, rut, fecha_solicitud, fecha_aceptacion, estado
FROM descuentogasapp_solicitud
ORDER BY id DESC
LIMIT 5;

SELECT NOW() AS server_now, UTC_TIMESTAMP() AS utc_now;

SHOW VARIABLES LIKE 'time_zone';