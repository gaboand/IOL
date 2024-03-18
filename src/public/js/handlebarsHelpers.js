export function formatVariacion(value) {
    let clase;
    if (value > 0) {
      clase = "variacion-positiva";
    } else if (value < 0) {
      clase = "variacion-negativa";
    } else {
      clase = "variacion-cero";
    }
    return `<span class="${clase}">${value.toFixed(2)}%</span>`;
  }
  