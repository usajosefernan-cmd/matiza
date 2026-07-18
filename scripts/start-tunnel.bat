@echo off
title Tunel SSH Syncthing - Hermes
echo =======================================================
echo   Iniciando tunel SSH para Syncthing con Hermes...
echo   Mapeando puerto local 22001 al 22000 de la VPS
echo =======================================================
echo Para cerrar el tunel, simplemente cierra esta ventana.
echo.
ssh -o StrictHostKeyChecking=no -i "C:\Users\yo\Pictures\Descargaspc\antigravityOLD\aether\02_DATOS\OPENCLAW_HUB\id_rsa_openclaw.key" -N -L 22001:127.0.0.1:22000 ubuntu@143.47.35.167
