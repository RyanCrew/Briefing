# Contenido del archivo utils.py
from datetime import datetime, timedelta

def process_image_text(text):
    """
    Procesa el texto extraído de la imagen para calcular detalles del vuelo.
    """
    # Esto es un ejemplo básico. Personalízalo según el formato de entrada.
    lines = text.splitlines()
    flight_info = {}

    for line in lines:
        if "Flight Time" in line:
            flight_time = extract_time_from_line(line)
            flight_info["Flight Time"] = flight_time
            report_time = calculate_report_time(flight_time)
            flight_info["Report Time"] = report_time

        if "Status" in line:
            flight_info["Status"] = line.split(":")[-1].strip()

    return flight_info

def extract_time_from_line(line):
    """
    Extrae el tiempo de una línea de texto.
    """
    try:
        time_str = line.split(":")[-1].strip()
        return datetime.strptime(time_str, "%d/%m/%y, %H:%M")
    except ValueError:
        return None

def calculate_report_time(flight_time):
    """
    Calcula el tiempo de reporte restando 45 minutos al tiempo del vuelo.
    """
    if flight_time:
        return flight_time - timedelta(minutes=45)
    return None
